import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const txsBin = path.join(root, 'node_modules/.bin/tsx');
const datasetSource = path.join(root, 'src/data/interactionDatasetV2.json');
const specSource = path.join(root, 'src/data/15_high_value_pairs.json');

const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'entheogen-provisional-add-'));
const tempDatasetPath = path.join(tempRoot, 'interactionDatasetV2.json');
const tempSpecPath = path.join(tempRoot, '15_high_value_pairs.json');
const tempReportPath = path.join(tempRoot, 'provisional_interactions_insert_report.json');

const dataset = JSON.parse(await readFile(datasetSource, 'utf8'));
dataset.pairs = dataset.pairs.filter((pair: { key: string }) => pair.key !== 'ayahuasca|gabapentin');
dataset.pairs.push({
  key: 'ayahuasca|gabapentin',
  substances: ['ayahuasca', 'gabapentin'],
  classification: {
    code: 'THEORETICAL',
    status: 'inferred',
    confidence: 'low',
    risk_score: 2,
    label: 'Provisional theoretical interaction',
    risk_assessment: { level: 'provisional_moderate', rationale: 'Seed record' }
  },
  clinical_summary: { headline: 'Seed record', mechanism: 'Seed record', timing_guidance: null, field_notes: null },
  mechanism: { primary_category: 'cns_depression', categories: ['cns_depression'] },
  evidence: {
    tier: 'theoretical',
    support_type: 'provisional_gap_fill',
    evidence_strength: 'theoretical',
    source_refs: [],
    status: 'provisional_secondary',
    review_state: 'needs_verification',
    review_notes: 'Seed record',
    evidence_gaps: 'Seed record'
  },
  source_text: 'seed',
  source_fingerprint: 'seed',
  provenance: {
    derivation_type: 'curated_inference',
    origin_value_v1: 'seed',
    source: 'provisional_gap_fill',
    confidence_tier: 'low',
    method: 'manual_high_priority_gap_insert_v1',
    source_linking_method: 'manual_high_priority_gap_insert_v1',
    source_linking_confidence: 'low',
    requires_verification: true,
    rationale: 'Seed record',
    migrated_from_v1: true,
    migration_version: 'v1_to_v2',
    migrated_at: new Date().toISOString()
  },
  override_metadata: { applied: false },
  audit: { validation_flags: ['low_confidence', 'provisional_secondary', 'needs_verification', 'upgrade_candidate'], review_status: 'needs_review' },
  validation: {
    flags: {
      critical: [],
      warning: [],
      info: ['low_confidence', 'provisional_secondary', 'needs_verification', 'upgrade_candidate']
    }
  }
});

await writeFile(tempDatasetPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
await writeFile(tempSpecPath, await readFile(specSource, 'utf8'), 'utf8');

const result = spawnSync(process.execPath, [txsBin, path.join(root, 'scripts/addProvisionalInteractions.ts')], {
  cwd: root,
  env: {
    ...process.env,
    INTERACTION_DATASET_V2_PATH: tempDatasetPath,
    PROVISIONAL_PAIR_SPEC_PATH: tempSpecPath,
    PROVISIONAL_REPORT_PATH: tempReportPath
  },
  encoding: 'utf8'
});

assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);

const insertedDataset = JSON.parse(await readFile(tempDatasetPath, 'utf8'));
assert.strictEqual(insertedDataset.pairs.length, dataset.pairs.length + 14, 'should insert 14 missing records');
assert.ok(insertedDataset.substances.some((entry: { id: string }) => entry.id === 'dextromethorphan'));

const insertedPair = insertedDataset.pairs.find((pair: { key: string }) => pair.key === 'ayahuasca|dextromethorphan');
assert.ok(insertedPair, 'ayahuasca|dextromethorphan should be inserted');
assert.strictEqual(insertedPair.classification.code, 'THEORETICAL');
assert.strictEqual(insertedPair.evidence.status, 'provisional_secondary');
assert.strictEqual(insertedPair.evidence.support_type, 'provisional_gap_fill');
assert.strictEqual(insertedPair.evidence.source_refs.length, 0);
assert.strictEqual(insertedPair.provenance.source, 'provisional_gap_fill');
assert.strictEqual(insertedPair.provenance.requires_verification, true);

const report = JSON.parse(await readFile(tempReportPath, 'utf8'));
assert.strictEqual(report.records_requested, 15);
assert.strictEqual(report.records_inserted, 14);
assert.strictEqual(report.records_skipped_existing, 1);
assert.ok(Array.isArray(report.skipped_existing_keys));
assert.strictEqual(report.final_total_interactions, insertedDataset.pairs.length);

rmSync(tempRoot, { recursive: true, force: true });
console.log('provisional interaction insertion checks passed');
