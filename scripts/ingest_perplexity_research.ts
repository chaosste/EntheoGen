import path from 'node:path';
import { readFile } from 'node:fs/promises';
import {
  buildPerplexityCitationKey,
  ensureDir,
  extractPerplexityCitations,
  extractPerplexityClaims,
  isPerplexitySourceId,
  loadSchema,
  parseFrontmatter,
  readJson,
  slugify,
  stableHash,
  titleCaseFromSlug,
  walkFiles,
  validateSchemaSubset,
  writeJson,
  type ClaimPackage,
  type SourceManifestEntry
} from './kb-utils';
import type { InteractionDatasetV2 } from '../src/data/interactionSchemaV2';

type CitationRegistryEntry = {
  citation_id?: string;
  discovered_via?: string;
  title?: string;
  url?: string;
  doi?: string;
  status?: 'unverified' | 'verified' | 'rejected';
  notes?: string;
  source_id?: string;
  citation?: string;
  source_type?: string;
  year?: number;
  url_or_path?: string;
};

type PerplexityReportSource = {
  source_id: string;
  file: string;
  processed: boolean;
  reason?: string;
  total_claims: number;
  citations_extracted: number;
  existing_pair_matches: number;
  candidate_new_pairs: number;
  verification_required: number;
  warnings: string[];
};

const compactObject = <T extends Record<string, unknown>>(value: T): T => {
  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) {
      output[key] = entry;
    }
  }
  return output as T;
};

const extractTitle = (frontmatter: Record<string, unknown>, fileStem: string): string =>
  typeof frontmatter.title === 'string' && frontmatter.title.trim()
    ? frontmatter.title.trim()
    : titleCaseFromSlug(fileStem);

const upsertManifestEntry = (
  manifest: { version: string; sources: SourceManifestEntry[] },
  entry: SourceManifestEntry
): void => {
  const index = manifest.sources.findIndex((source) => source.source_id === entry.source_id);
  if (index >= 0) {
    manifest.sources[index] = {
      ...manifest.sources[index],
      ...entry,
      review_state: manifest.sources[index].review_state === 'validated' ? 'validated' : entry.review_state
    };
    return;
  }
  manifest.sources.push(entry);
};

const normalizeSourceId = (fileStem: string, frontmatter: Record<string, unknown>): string =>
  typeof frontmatter.source_id === 'string' && frontmatter.source_id.trim()
    ? frontmatter.source_id.trim()
    : fileStem;

const citationMatchesRegistry = (entry: CitationRegistryEntry, citation: { title?: string; url?: string; doi?: string; citation_text?: string }): boolean => {
  const entryUrl = entry.url?.trim().toLowerCase();
  const citationUrl = citation.url?.trim().toLowerCase();
  const entryDoi = entry.doi?.trim().toLowerCase();
  const citationDoi = citation.doi?.trim().toLowerCase();
  const entryTitle = entry.title?.trim().toLowerCase();
  const citationTitle = citation.title?.trim().toLowerCase();
  return Boolean(
    (entryUrl && citationUrl && entryUrl === citationUrl) ||
    (entryDoi && citationDoi && entryDoi === citationDoi) ||
    (entryTitle && citationTitle && entryTitle === citationTitle)
  );
};

const collectPairKeys = (pairs: [string, string][]): string[] => Array.from(new Set(pairs.map((pair) => `${pair[0]}|${pair[1]}`))).sort();

const run = async (): Promise<void> => {
  const kbRoot = process.env.KB_ROOT ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'knowledge-base');
  const sourcesDir = process.env.KB_SOURCES_DIR ?? path.join(kbRoot, 'sources', 'expert-guidelines');
  const indexesDir = process.env.KB_INDEXES_DIR ?? path.join(kbRoot, 'indexes');
  const pendingDir = process.env.KB_PENDING_DIR ?? path.join(kbRoot, 'extracted', 'claims', 'pending');
  const reportPath = process.env.KB_PERPLEXITY_REPORT_PATH ?? path.join(kbRoot, 'reports', 'perplexity_ingestion_report.json');
  const sourceManifestPath = process.env.KB_SOURCE_MANIFEST_PATH ?? path.join(indexesDir, 'source_manifest.json');
  const sourceTagsPath = process.env.KB_SOURCE_TAGS_PATH ?? path.join(indexesDir, 'source_tags.json');
  const citationRegistryPath = process.env.KB_CITATION_REGISTRY_PATH ?? path.join(indexesDir, 'citation_registry.json');
  const sourceSchemaPath = process.env.KB_SOURCE_SCHEMA_PATH ?? path.join(kbRoot, 'schemas', 'source.schema.json');
  const claimSchemaPath = process.env.KB_CLAIM_SCHEMA_PATH ?? path.join(kbRoot, 'schemas', 'claim.schema.json');
  const datasetPath = process.env.KB_DATASET_PATH ?? path.resolve(kbRoot, '..', 'src', 'data', 'interactionDatasetV2.json');

  await ensureDir(pendingDir);
  await ensureDir(indexesDir);
  await ensureDir(path.dirname(reportPath));

  const sourceSchema = await loadSchema(sourceSchemaPath);
  const claimSchema = await loadSchema(claimSchemaPath);
  const manifestRaw = await readJson<{ version: string; sources: SourceManifestEntry[] }>(sourceManifestPath).catch(() => ({ version: 'kb_v1', sources: [] }));
  const manifest = { version: manifestRaw.version ?? 'kb_v1', sources: [...(manifestRaw.sources ?? [])] };
  const sourceTags = await readJson<{ version: string; source_tags: Array<{ source_id: string; tags: string[] }> }>(sourceTagsPath).catch(() => ({ version: 'kb_v1', source_tags: [] }));
  const citationRegistry = await readJson<{ version: string; citations: CitationRegistryEntry[] }>(citationRegistryPath).catch(() => ({ version: 'kb_v1', citations: [] }));
  const dataset = await readJson<InteractionDatasetV2>(datasetPath).catch(() => ({ schema_version: 'v2', generated_at: new Date().toISOString(), substances: [], pairs: [], sources: [] }));

  const sourceFiles = await walkFiles(sourcesDir, ['.md', '.txt']);
  const manifestById = new Map(manifest.sources.map((entry) => [entry.source_id, entry] as const));
  const datasetPairKeys = new Set(dataset.pairs.map((pair) => pair.key));
  const processedSources: PerplexityReportSource[] = [];
  const allCitations = new Map<string, CitationRegistryEntry>();
  for (const citation of citationRegistry.citations) {
    const key = buildPerplexityCitationKey({
      title: citation.title,
      url: citation.url,
      doi: citation.doi,
      citation_text: citation.citation ?? citation.notes
    });
    allCitations.set(key, citation);
  }

  let totalClaims = 0;
  let totalCitationsExtracted = 0;
  let citedSourcesAlreadyKnown = 0;
  let citedSourcesNewlyDiscovered = 0;
  let claimsRequiringVerification = 0;
  const candidateNewPairs = new Map<string, { claim_id: string; source_id: string; claim: string }[]>();
  const claimsLinkedToExistingPairs = new Map<string, { claim_id: string; source_id: string; claim: string }[]>();
  const warnings: string[] = [];
  const skippedFiles: Array<{ file: string; reason: string }> = [];

  for (const filePath of sourceFiles) {
    const relativePath = path.relative(kbRoot, filePath).replace(/\\/g, '/');
    const fileStem = path.basename(filePath, path.extname(filePath));
    const rawText = await readFile(filePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(rawText);
    const sourceId = normalizeSourceId(fileStem, frontmatter);
    const title = extractTitle(frontmatter, fileStem);
    const manifestEntry = manifestById.get(sourceId);
    const isAiSynthesis = manifestEntry?.source_type === 'ai_synthesis' || frontmatter.source_type === 'ai_synthesis' || isPerplexitySourceId(sourceId);

    if (!isAiSynthesis) {
      skippedFiles.push({ file: relativePath, reason: 'source_type is not ai_synthesis' });
      continue;
    }

    const sourceEntry: SourceManifestEntry = compactObject({
      source_id: sourceId,
      title,
      source_type: 'ai_synthesis',
      authority_level: 'low',
      evidence_domain: 'aggregated_clinical',
      year: typeof frontmatter.year === 'number' ? frontmatter.year : undefined,
      authors: ['Perplexity research synthesis'],
      citation: `Perplexity research synthesis, generated/retrieved ${new Date().toISOString().slice(0, 10)}`,
      url_or_path: relativePath,
      file_refs: [relativePath],
      review_state: 'extracted',
      notes: 'AI-generated research synthesis. Use for provisional coverage and citation discovery only.'
    }) as SourceManifestEntry;

    upsertManifestEntry(manifest, sourceEntry);
    manifestById.set(sourceId, sourceEntry);

    const citations = extractPerplexityCitations(rawText);
    totalCitationsExtracted += citations.length;
    const claimedCitations: CitationRegistryEntry[] = [];
    for (const citation of citations) {
      const citationKey = buildPerplexityCitationKey(citation);
      const known = allCitations.has(citationKey) || citationRegistry.citations.some((entry) => citationMatchesRegistry(entry, citation));
      if (known) {
        citedSourcesAlreadyKnown += 1;
      } else {
        citedSourcesNewlyDiscovered += 1;
        const citationEntry: CitationRegistryEntry = {
          citation_id: `cit_${sourceId}_${stableHash(citationKey, 10)}`,
          discovered_via: sourceId,
          title: citation.title,
          url: citation.url,
          doi: citation.doi,
          status: 'unverified',
          notes: 'Discovered via Perplexity synthesis; requires manual verification.'
        };
        citationRegistry.citations.push(citationEntry);
        allCitations.set(citationKey, citationEntry);
      }
      claimedCitations.push({
        title: citation.title,
        url: citation.url,
        doi: citation.doi,
        authors: citation.authors,
        year: citation.year,
        citation_text: citation.citation_text
      });
    }

    const claims = extractPerplexityClaims(sourceId, title, body, claimedCitations, frontmatter);
    if (claims.length === 0) {
      skippedFiles.push({ file: relativePath, reason: 'no claim candidates matched the rule-based extractor' });
      processedSources.push({
        source_id: sourceId,
        file: relativePath,
        processed: false,
        reason: 'no claim candidates matched the rule-based extractor',
        total_claims: 0,
        citations_extracted: claimedCitations.length,
        existing_pair_matches: 0,
        candidate_new_pairs: 0,
        verification_required: 0,
        warnings: []
      });
      continue;
    }

    const packageRecord: ClaimPackage = {
      source_id: sourceId,
      source_path: relativePath,
      source_metadata: frontmatter,
      claims
    };

    for (const claim of claims) {
      const issues = validateSchemaSubset(claimSchema, claim, `$.claims[${claim.claim_id}]`);
      if (issues.length > 0) {
        throw new Error(`Perplexity claim validation failed for ${claim.claim_id}:\n${issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n')}`);
      }
      totalClaims += 1;
      claimsRequiringVerification += 1;

      const matchingPairKeys = new Set<string>();
      for (const pair of claim.supports_pairs ?? []) {
        const key = pair.map((item) => item.toLowerCase()).sort().join('|');
        if (datasetPairKeys.has(key)) {
          matchingPairKeys.add(key);
        } else {
          if (!candidateNewPairs.has(key)) candidateNewPairs.set(key, []);
          candidateNewPairs.get(key)?.push({ claim_id: claim.claim_id, source_id: claim.source_id, claim: claim.claim });
        }
      }
      if (matchingPairKeys.size > 0) {
        for (const key of matchingPairKeys) {
          if (!claimsLinkedToExistingPairs.has(key)) claimsLinkedToExistingPairs.set(key, []);
          claimsLinkedToExistingPairs.get(key)?.push({ claim_id: claim.claim_id, source_id: claim.source_id, claim: claim.claim });
        }
      }
    }

    await writeJson(path.join(pendingDir, `${sourceId}.claims.json`), packageRecord);

    const tags = Array.from(
      new Set([
        'ai_synthesis',
        'perplexity',
        'provisional_secondary',
        ...claims.map((claim) => claim.claim_type),
        ...claims.flatMap((claim) => claim.clinical_actionability ? [claim.clinical_actionability] : []),
        ...claims.flatMap((claim) => claim.mechanism)
      ])
    ).sort();
    const tagIndex = sourceTags.source_tags.findIndex((entry) => entry.source_id === sourceId);
    if (tagIndex >= 0) {
      sourceTags.source_tags[tagIndex] = {
        source_id: sourceId,
        tags: Array.from(new Set([...sourceTags.source_tags[tagIndex].tags, ...tags])).sort()
      };
    } else {
      sourceTags.source_tags.push({ source_id: sourceId, tags });
    }

    processedSources.push({
      source_id: sourceId,
      file: relativePath,
      processed: true,
      total_claims: claims.length,
      citations_extracted: claimedCitations.length,
      existing_pair_matches: Array.from(claimsLinkedToExistingPairs.values()).reduce((sum, entries) => sum + entries.length, 0),
      candidate_new_pairs: Array.from(candidateNewPairs.values()).reduce((sum, entries) => sum + entries.length, 0),
      verification_required: claims.length,
      warnings: []
    });
  }

  const manifestIssues = manifest.sources.flatMap((entry, index) => validateSchemaSubset(sourceSchema, entry, `$.sources[${index}]`));
  if (manifestIssues.length > 0) {
    throw new Error(`source manifest validation failed:\n${manifestIssues.map((issue) => `${issue.path}: ${issue.message}`).join('\n')}`);
  }

  await writeJson(sourceManifestPath, manifest);
  await writeJson(sourceTagsPath, { version: sourceTags.version ?? 'kb_v1', source_tags: sourceTags.source_tags });
  await writeJson(citationRegistryPath, { version: citationRegistry.version ?? 'kb_v1', citations: citationRegistry.citations });
  await writeJson(reportPath, {
    source_type: 'ai_synthesis',
    ingestion_method: 'perplexity_ingestion_v1',
    total_files_processed: processedSources.length,
    total_claims_generated: totalClaims,
    total_cited_sources_extracted: totalCitationsExtracted,
    cited_sources_already_known: citedSourcesAlreadyKnown,
    cited_sources_newly_discovered: citedSourcesNewlyDiscovered,
    candidate_new_interaction_pairs: Array.from(candidateNewPairs.entries()).map(([pairKey, entries]) => ({ pair_key: pairKey, entries })),
    claims_linked_to_existing_pairs: Array.from(claimsLinkedToExistingPairs.entries()).map(([pairKey, entries]) => ({ pair_key: pairKey, entries })),
    claims_requiring_verification: claimsRequiringVerification,
    skipped_files: skippedFiles,
    parsing_warnings: warnings,
    per_source_summaries: processedSources
  });

  console.log(`Perplexity ingestion complete. files=${processedSources.length} claims=${totalClaims}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
