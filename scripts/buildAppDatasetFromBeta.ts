/**
 * Reads EntheoGen-Dataset-Beta-0-1 CSV exports and writes app snapshot artifacts:
 * - src/exports/interaction_pairs.json
 * - src/data/substances_snapshot.json
 *
 * Usage:
 *   npx tsx scripts/buildAppDatasetFromBeta.ts [path/to/beta/data]
 *   npx tsx scripts/buildAppDatasetFromBeta.ts --print-paths
 * Default beta data dir: ../../EntheoGen-Dataset-Beta-0-1/data (sibling of EntheoGen repo)
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  mapBetaClassificationToAppCode,
  normalizeBetaConfidence
} from './betaDatasetMapping';
import {
  getBetaCsvPaths,
  getCanonicalDatasetPaths,
  getDefaultBetaDataDir
} from './datasetPaths';

type AppInteractionCode =
  | 'LOW'
  | 'LOW_MOD'
  | 'CAU'
  | 'UNS'
  | 'DAN'
  | 'UNK'
  | 'SELF'
  | 'INFERRED'
  | 'THEORETICAL'
  | 'DETERMINISTIC';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

type CsvRow = Record<string, string>;

function readCsvObjects(csvPath: string): CsvRow[] {
  const py = `
import csv, json, sys
with open(sys.argv[1], newline='', encoding='utf-8') as f:
    print(json.dumps(list(csv.DictReader(f))))
`;
  const json = execFileSync('python3', ['-c', py, csvPath], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024
  });
  return JSON.parse(json) as CsvRow[];
}

function fingerprintPair(row: CsvRow): string {
  const payload = JSON.stringify({
    pair_key: row.pair_key,
    substance_a_id: row.substance_a_id,
    substance_b_id: row.substance_b_id,
    classification_code: row.classification_code,
    risk_score: row.risk_score,
    headline: row.headline
  });
  return createHash('sha256').update(payload).digest('hex');
}

function parseRiskScore(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') return Number.NaN;
  const n = Number(trimmed);
  return n;
}

function deriveOrigin(row: CsvRow): 'self' | 'explicit' | 'unknown' {
  if (row.is_self_pair?.toUpperCase() === 'TRUE' || row.classification_code === 'SELF') {
    return 'self';
  }
  if (row.classification_code === 'INFERRED' || row.classification_code === 'THEORETICAL') {
    return 'unknown';
  }
  return 'explicit';
}

function buildInteractions(rows: CsvRow[]) {
  return rows.map((row) => {
    const interaction_code = mapBetaClassificationToAppCode(row.classification_code) as AppInteractionCode;

    const riskNum = parseRiskScore(row.risk_score);
    const risk_scale = Number.isFinite(riskNum) ? riskNum : 0;

    const mechanism_category = (row.primary_mechanism_category ?? 'unknown').trim() || 'unknown';

    return {
      substance_a_id: row.substance_a_id,
      substance_b_id: row.substance_b_id,
      pair_key: row.pair_key,
      origin: deriveOrigin(row),
      interaction_code,
      interaction_label: (row.risk_label ?? '').trim() || row.classification_code,
      risk_scale,
      summary: (row.headline ?? '').trim(),
      confidence: normalizeBetaConfidence(row.classification_confidence ?? ''),
      mechanism: row.mechanism_summary?.trim() ? row.mechanism_summary.trim() : null,
      mechanism_category,
      timing: row.timing_guidance?.trim() ? row.timing_guidance.trim() : null,
      evidence_gaps: row.evidence_gaps?.trim() ? row.evidence_gaps.trim() : null,
      evidence_tier: null,
      field_notes: row.field_notes?.trim() ? row.field_notes.trim() : null,
      sources: 'beta-0-1-snapshot',
      source_refs: ['beta_dataset'],
      source_fingerprint: fingerprintPair(row)
    };
  });
}

function buildSubstances(rows: CsvRow[]) {
  return rows.map((row) => {
    const deprecated = ['true', '1', 'yes'].includes(row.deprecated?.trim().toLowerCase() ?? '');
    const supersededRaw = (row.superseded_by ?? '').trim();
    const supersededBy = supersededRaw
      ? supersededRaw.split(/[,|]/).map((s) => s.trim()).filter(Boolean)
      : undefined;

    return {
      id: row.id,
      name: row.name,
      class: row.class ?? '',
      mechanismTag: row.mechanism_tag ?? '',
      notes: row.notes ?? '',
      deprecated: deprecated || undefined,
      supersededBy
    };
  });
}

function main() {
  const args = process.argv.slice(2);
  const printPathsOnly = args.includes('--print-paths');
  const betaDataDir = args.find((arg) => !arg.startsWith('--')) ?? getDefaultBetaDataDir(root);
  const betaCsv = getBetaCsvPaths(betaDataDir);
  const canonical = getCanonicalDatasetPaths(root);

  if (printPathsOnly) {
    console.log(
      JSON.stringify(
        {
          beta_csv_inputs: betaCsv,
          canonical_outputs: {
            substancesSnapshot: canonical.substancesSnapshot,
            interactionPairsExport: canonical.interactionPairsExport
          }
        },
        null,
        2
      )
    );
    return;
  }

  if (!fs.existsSync(betaCsv.substancesCsv) || !fs.existsSync(betaCsv.interactionsCsv)) {
    throw new Error(
      `Beta dataset CSVs not found under "${betaDataDir}". ` +
        `Pass the data directory as the first argument, e.g. ` +
        `npx tsx scripts/buildAppDatasetFromBeta.ts /path/to/EntheoGen-Dataset-Beta-0-1/data`
    );
  }

  const substanceRows = readCsvObjects(betaCsv.substancesCsv);
  const interactionRows = readCsvObjects(betaCsv.interactionsCsv);

  const substances = buildSubstances(substanceRows);
  const interactions = buildInteractions(interactionRows);

  const outSubstances = canonical.substancesSnapshot;
  const outInteractions = canonical.interactionPairsExport;

  fs.writeFileSync(outSubstances, `${JSON.stringify(substances, null, 2)}\n`, 'utf8');
  fs.writeFileSync(outInteractions, `${JSON.stringify(interactions, null, 2)}\n`, 'utf8');

  console.log(
    `Wrote ${substances.length} substances -> ${path.relative(process.cwd(), outSubstances)}`
  );
  console.log(
    `Wrote ${interactions.length} interactions -> ${path.relative(process.cwd(), outInteractions)}`
  );
}

main();
