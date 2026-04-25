import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ConfidenceLevel,
  DerivationType,
  EvidenceSupportType,
  EvidenceTierV2,
  InteractionCodeV2,
  InteractionDatasetV2,
  InteractionStatus,
  MechanismCategoryV2,
  SourceKind,
  ValidationFlagV2
} from '../src/data/interactionSchemaV2';

interface InteractionPairV1 {
  substance_a_id: string;
  substance_b_id: string;
  pair_key: string;
  origin: string;
  interaction_code: string;
  interaction_label: string;
  risk_scale: number;
  summary: string;
  confidence: string | null;
  mechanism: string | null;
  mechanism_category: string | null;
  timing: string | null;
  evidence_gaps: string | null;
  evidence_tier: string | null;
  field_notes: string | null;
  sources: string;
  source_refs: string[];
  source_fingerprint: string;
}

interface DrugRow {
  id: string;
  name: string;
  class?: string;
  mechanismTag?: string;
  notes?: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pairsV1Path = path.join(root, 'src/exports/interaction_pairs.json');
const outputPath = path.join(root, 'src/data/interactionDatasetV2.json');

const codeMap: Record<string, InteractionCodeV2> = {
  SELF: 'SELF',
  UNK: 'UNKNOWN',
  LOW: 'LOW',
  LOW_MOD: 'LOW_MOD',
  CAU: 'CAUTION',
  UNS: 'UNSAFE',
  DAN: 'DANGEROUS'
};

const derivationMap: Record<string, DerivationType> = {
  self: 'self_pair',
  explicit: 'explicit_source',
  fallback: 'fallback_rule',
  unknown: 'generated_unknown'
};

const riskByCode: Record<InteractionCodeV2, number> = {
  SELF: -1,
  UNKNOWN: 0,
  LOW: 1,
  LOW_MOD: 2,
  CAUTION: 3,
  UNSAFE: 4,
  DANGEROUS: 5
};

const evidenceTierRules: Array<[RegExp, EvidenceTierV2]> = [
  [/direct|trial|randomized|controlled human|human data/i, 'direct_human_data'],
  [/guideline|consensus guideline|toxicology guidelines/i, 'clinical_guideline'],
  [/case report|case series|toxicology case/i, 'case_report_or_series'],
  [/observational|survey|registry|report analysis/i, 'observational_report'],
  [/mechanistic|pharmacology|extrapolat/i, 'mechanistic_inference'],
  [/field guidance|field consensus|retreat protocols|retreat guidance/i, 'field_consensus'],
  [/traditional|ethnographic|precedent/i, 'traditional_use_precedent'],
  [/source-gap|source gap|decidable-by-case-data/i, 'source_gap']
];

const mechanismKeywordRules: Array<{ category: MechanismCategoryV2; patterns: RegExp[] }> = [
  { category: 'maoi_potentiation', patterns: [/\bmao\b/i, /\bmaoi\b/i, /harmala/i, /harmine/i, /harmaline/i] },
  { category: 'serotonergic_toxicity', patterns: [/serotonin syndrome/i, /serotonergic crisis/i, /\bssri\b/i, /\bsnri\b/i, /5-ht/i] },
  { category: 'cardiovascular_load', patterns: [/blood pressure/i, /heart rate/i, /cardiovascular/i, /tachycardia/i, /hypertension/i] },
  { category: 'sympathomimetic_load', patterns: [/stimulant/i, /amphetamine/i, /cocaine/i, /methylphenidate/i, /catecholamine/i] },
  { category: 'seizure_threshold', patterns: [/seizure/i, /seizure threshold/i, /lithium/i, /bupropion/i] },
  { category: 'anticholinergic_delirium', patterns: [/anticholinergic/i, /atropine/i, /scopolamine/i, /hyoscyamine/i, /delirium/i] },
  { category: 'glutamatergic_dissociation', patterns: [/ketamine/i, /dissociation/i, /\bnmda\b/i] },
  { category: 'gabaergic_modulation', patterns: [/benzodiazepine/i, /\bgaba\b/i] },
  { category: 'dehydration_or_electrolyte_risk', patterns: [/dehydration/i, /electrolyte/i, /vomiting/i, /diarrhea/i, /purge/i] },
  { category: 'psychiatric_destabilization', patterns: [/panic/i, /psychosis/i, /mania/i, /destabilization/i] },
  {
    category: 'operational_or_behavioral_risk',
    patterns: [/falls/i, /aspiration/i, /behavioral disorganization/i, /operational risk/i]
  }
];

const titleFromSourceId = (sourceId: string): string =>
  sourceId
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();

const canonicalPairKey = (a: string, b: string): string => [a, b].sort().join('|');

const toEvidenceTier = (value: string | null): EvidenceTierV2 => {
  if (!value) return 'not_applicable';
  for (const [regex, mapped] of evidenceTierRules) {
    if (regex.test(value)) return mapped;
  }
  return 'mechanistic_inference';
};

const toSupportType = (tier: EvidenceTierV2): EvidenceSupportType => {
  if (tier === 'direct_human_data' || tier === 'clinical_guideline') return 'direct';
  if (tier === 'case_report_or_series' || tier === 'observational_report') return 'indirect';
  if (tier === 'mechanistic_inference') return 'mechanistic';
  if (tier === 'field_consensus') return 'field_observation';
  if (tier === 'traditional_use_precedent') return 'traditional_context';
  if (tier === 'source_gap') return 'none';
  return 'none';
};

const toStatus = (code: InteractionCodeV2, confidence: ConfidenceLevel, origin: DerivationType, evidenceTier: EvidenceTierV2): InteractionStatus => {
  if (code === 'SELF') return 'not_applicable';
  if (code === 'UNKNOWN') return 'unknown';
  if (confidence === 'low') return 'low_confidence';
  if (evidenceTier === 'source_gap' || evidenceTier === 'not_applicable') return 'missing_evidence';
  if (origin === 'explicit_source') return 'confirmed';
  return 'inferred';
};

const toConfidence = (value: string | null): ConfidenceLevel => {
  if (value === 'high' || value === 'medium' || value === 'low') return value;
  if (value === 'n/a') return 'not_applicable';
  return 'none';
};

const inferMechanismCategories = (input: string): MechanismCategoryV2[] => {
  const matches = new Set<MechanismCategoryV2>();
  for (const rule of mechanismKeywordRules) {
    if (rule.patterns.some((pattern) => pattern.test(input))) {
      matches.add(rule.category);
    }
  }
  return matches.size ? Array.from(matches) : ['unknown'];
};

const toSourceKind = (sourceId: string): SourceKind => {
  if (sourceId === 'source_gap') return 'generated_placeholder';
  if (sourceId.includes('research_update')) return 'internal_research_update';
  if (sourceId.includes('guidance') || sourceId.includes('consensus')) return 'field_guidance';
  if (sourceId.includes('interaction') || sourceId.includes('pdf') || sourceId.includes('study')) return 'primary_source';
  return 'secondary_source';
};

const run = async (): Promise<void> => {
  const raw = await readFile(pairsV1Path, 'utf8');
  const pairsV1 = JSON.parse(raw) as InteractionPairV1[];

  let drugRows: DrugRow[] = [];
  try {
    const drugModule = await import('../src/data/drugData.ts');
    drugRows = ((drugModule as { DRUGS?: DrugRow[] }).DRUGS ?? []).map((row) => ({ ...row }));
  } catch {
    // Assumption: fallback to ID-only substances when DRUGS cannot be imported in script execution context.
  }

  const allIds = Array.from(new Set(pairsV1.flatMap((row) => [row.substance_a_id, row.substance_b_id]))).sort();
  const drugById = new Map(drugRows.map((row) => [row.id, row]));

  const substances = allIds.map((id) => {
    const drug = drugById.get(id);
    return {
      id,
      name: drug?.name ?? id,
      class: drug?.class,
      mechanism_tag: drug?.mechanismTag,
      notes: drug?.notes
    };
  });

  const sourceFingerprintById = new Map<string, string>();
  const discoveredSources = new Set<string>();

  const pairs = pairsV1.map((row) => {
    const key = canonicalPairKey(row.substance_a_id, row.substance_b_id);
    const code = codeMap[row.interaction_code] ?? 'UNKNOWN';
    const derivationType = derivationMap[row.origin] ?? 'generated_unknown';
    const confidence = toConfidence(row.confidence);
    const evidenceTier = toEvidenceTier(row.evidence_tier);

    const mechanismScanText = `${row.mechanism ?? ''}\n${row.summary ?? ''}\n${row.evidence_tier ?? ''}`;
    const inferredCategories = inferMechanismCategories(mechanismScanText);
    const primaryCategory = inferredCategories[0] ?? 'unknown';

    const sourceRefIds = (row.source_refs ?? []).filter(Boolean);
    const sourceRefs = sourceRefIds.map((source_id) => ({
      source_id,
      support_type: toSupportType(evidenceTier)
    }));

    for (const sourceId of sourceRefIds) {
      discoveredSources.add(sourceId);
      if (!sourceFingerprintById.has(sourceId) && row.source_fingerprint) {
        sourceFingerprintById.set(sourceId, row.source_fingerprint);
      }
    }

    const validationFlags = new Set<ValidationFlagV2>();
    if (!row.mechanism) validationFlags.add('missing_mechanism');
    if (!row.timing) validationFlags.add('missing_timing');
    if (!row.evidence_tier) validationFlags.add('missing_evidence_tier');
    if (!sourceRefIds.length) validationFlags.add('missing_source');
    if (confidence === 'low') validationFlags.add('low_confidence');
    if (code === 'UNKNOWN') validationFlags.add('unknown_classification');
    if (primaryCategory === 'unknown') validationFlags.add('mechanism_category_unknown');
    if (sourceRefIds.includes('source_gap')) validationFlags.add('source_gap');

    const reviewStatus: 'human_reviewed' | 'needs_review' =
      derivationType === 'self_pair' ||
      (derivationType === 'explicit_source' && confidence === 'high')
        ? 'human_reviewed'
        : 'needs_review';

    const status = toStatus(code, confidence, derivationType, evidenceTier);

    return {
      key,
      substances: [key.split('|')[0], key.split('|')[1]] as [string, string],
      classification: {
        code,
        status,
        confidence,
        risk_score: riskByCode[code],
        label: row.interaction_label
      },
      clinical_summary: {
        headline: row.summary,
        mechanism: row.mechanism,
        timing_guidance: row.timing,
        field_notes: row.field_notes
      },
      mechanism: {
        primary_category: primaryCategory,
        categories: Array.from(new Set(inferredCategories))
      },
      evidence: {
        tier: evidenceTier,
        support_type: toSupportType(evidenceTier),
        source_refs: sourceRefs,
        evidence_gaps: row.evidence_gaps
      },
      source_text: row.sources,
      source_fingerprint: row.source_fingerprint,
      provenance: {
        derivation_type: derivationType,
        origin_value_v1: row.origin,
        migrated_from_v1: true as const,
        migration_version: 'v1_to_v2' as const,
        migrated_at: new Date().toISOString()
      },
      override_metadata: {
        // Assumption: overrides are not explicitly represented in v1 rows, so default false.
        applied: false
      },
      audit: {
        validation_flags: Array.from(validationFlags),
        review_status: reviewStatus
      }
    };
  });

  // Preserve source text fallback semantics by adding source IDs parsed from source text when refs are absent.
  for (const pair of pairs) {
    if (!pair.evidence.source_refs.length && pair.source_text) {
      const tokens = pair.source_text
        .split(/[;,]/)
        .map((token) => token.trim())
        .filter(Boolean);
      for (const token of tokens) {
        const fallbackId = token
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        if (!fallbackId) continue;
        pair.evidence.source_refs.push({ source_id: fallbackId, support_type: pair.evidence.support_type });
        discoveredSources.add(fallbackId);
      }
    }
  }

  const sources = Array.from(discoveredSources)
    .sort()
    .map((id) => ({
      id,
      title: titleFromSourceId(id),
      source_type: toSourceKind(id),
      reliability: 'unknown' as const,
      fingerprint: sourceFingerprintById.get(id)
    }));

  const dataset: InteractionDatasetV2 = {
    schema_version: 'v2',
    generated_at: new Date().toISOString(),
    substances,
    pairs,
    sources
  };

  await writeFile(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  console.log(`Migrated ${pairs.length} interactions to ${path.relative(root, outputPath)}`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
