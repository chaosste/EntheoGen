import path from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import {
  ensureDir,
  loadSchema,
  readJson,
  validateSchemaSubset,
  type ClaimPackage,
  type ClaimRecord,
  type SourceManifestEntry
} from './kb-utils';
import type { InteractionDatasetV2 } from '../src/data/interactionSchemaV2';

const loadClaimPackages = async (dirPath: string): Promise<Array<{ file: string; packageRecord: ClaimPackage }>> => {
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(() => []);
  const packages: Array<{ file: string; packageRecord: ClaimPackage }> = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.claims.json')) continue;
    packages.push({ file: entry.name, packageRecord: await readJson<ClaimPackage>(path.join(dirPath, entry.name)) });
  }
  return packages;
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
};

const validateClaim = (claim: ClaimRecord, claimSchema: Record<string, unknown>): string[] => {
  const issues = validateSchemaSubset(claimSchema, claim, `$.claim`);
  if (claim.review_state === 'human_reviewed') {
    if (!claim.evidence_strength) issues.push({ path: '$.claim.evidence_strength', message: 'human_reviewed claims must include evidence_strength' });
    if (!claim.confidence) issues.push({ path: '$.claim.confidence', message: 'human_reviewed claims must include confidence' });
  }
  return issues.map((issue) => `${issue.path}: ${issue.message}`);
};

const run = async (): Promise<void> => {
  const kbRoot = process.env.KB_ROOT ?? path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'knowledge-base');
  const indexesDir = process.env.KB_INDEXES_DIR ?? path.join(kbRoot, 'indexes');
  const pendingDir = process.env.KB_PENDING_DIR ?? path.join(kbRoot, 'extracted', 'claims', 'pending');
  const reviewedDir = process.env.KB_REVIEWED_DIR ?? path.join(kbRoot, 'extracted', 'claims', 'reviewed');
  const rejectedDir = process.env.KB_REJECTED_DIR ?? path.join(kbRoot, 'extracted', 'claims', 'rejected');
  const sourceManifestPath = process.env.KB_SOURCE_MANIFEST_PATH ?? path.join(indexesDir, 'source_manifest.json');
  const claimSchemaPath = process.env.KB_CLAIM_SCHEMA_PATH ?? path.join(kbRoot, 'schemas', 'claim.schema.json');
  const sourceSchemaPath = process.env.KB_SOURCE_SCHEMA_PATH ?? path.join(kbRoot, 'schemas', 'source.schema.json');
  const datasetPath = process.env.KB_DATASET_PATH ?? path.resolve(kbRoot, '..', 'src', 'data', 'interactionDatasetV2.json');

  await ensureDir(indexesDir);

  const sourceSchema = await loadSchema(sourceSchemaPath);
  const claimSchema = await loadSchema(claimSchemaPath);
  const manifest = await readJson<{ version: string; sources: SourceManifestEntry[] }>(sourceManifestPath);
  const dataset = await readJson<InteractionDatasetV2>(datasetPath);

  const errors: string[] = [];

  for (const [index, source] of manifest.sources.entries()) {
    errors.push(...validateSchemaSubset(sourceSchema, source, `$.sources[${index}]`).map((issue) => `${issue.path}: ${issue.message}`));
    for (const fileRef of source.file_refs ?? []) {
      const filePath = path.join(kbRoot, fileRef);
      if (!(await fileExists(filePath))) {
        errors.push(`missing source file referenced by ${source.source_id}: ${fileRef}`);
      }
    }
  }

  const sourceIds = new Set(manifest.sources.map((source) => source.source_id));
  for (const folder of [pendingDir, reviewedDir, rejectedDir]) {
    const packages = await loadClaimPackages(folder);
    for (const { file, packageRecord } of packages) {
      for (const claim of packageRecord.claims) {
        errors.push(...validateClaim(claim, claimSchema));
        if (!sourceIds.has(claim.source_id)) {
          errors.push(`unknown source_id in claim ${claim.claim_id}: ${claim.source_id}`);
        }
        if (claim.review_state === 'human_reviewed' && folder !== reviewedDir) {
          errors.push(`human_reviewed claim found outside reviewed/ in ${file}`);
        }
        if (claim.review_state === 'rejected' && folder !== rejectedDir) {
          errors.push(`rejected claim found outside rejected/ in ${file}`);
        }
        if (folder === reviewedDir && claim.review_state !== 'human_reviewed') {
          errors.push(`non-human_reviewed claim found in reviewed/ in ${file}`);
        }
        if (folder === rejectedDir && claim.review_state !== 'rejected') {
          errors.push(`non-rejected claim found in rejected/ in ${file}`);
        }
      }
    }
  }

  const datasetSourceIds = new Set(dataset.sources.map((source) => source.id));
  for (const pair of dataset.pairs) {
    if (pair.classification.code === 'SELF') continue;
    for (const ref of pair.evidence.source_refs) {
      if (!datasetSourceIds.has(ref.source_id)) {
        errors.push(`dataset source ref ${ref.source_id} is missing from dataset.sources in ${pair.key}`);
      }
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`ERROR: ${error}`);
    }
    console.error(`KB validation failed with ${errors.length} error(s)`);
    process.exitCode = 1;
    return;
  }

  console.log('KB validation complete. errors=0');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
