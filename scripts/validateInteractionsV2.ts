import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONFIDENCE_LEVELS,
  DERIVATION_TYPES,
  EVIDENCE_SUPPORT_TYPES,
  EVIDENCE_TIERS_V2,
  INTERACTION_CODES_V2,
  INTERACTION_STATUSES,
  MECHANISM_CATEGORIES_V2,
  SOURCE_KINDS,
  VALIDATION_FLAGS_V2,
  type InteractionDatasetV2
} from '../src/data/interactionSchemaV2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const datasetPath = path.join(root, 'src/data/interactionDatasetV2.json');

const expectedRiskByCode: Record<string, number> = {
  SELF: -1,
  UNKNOWN: 0,
  LOW: 1,
  LOW_MOD: 2,
  CAUTION: 3,
  UNSAFE: 4,
  DANGEROUS: 5
};

const asSet = <T extends string>(values: readonly T[]) => new Set<string>(values);

const enums = {
  code: asSet(INTERACTION_CODES_V2),
  status: asSet(INTERACTION_STATUSES),
  confidence: asSet(CONFIDENCE_LEVELS),
  mechanism: asSet(MECHANISM_CATEGORIES_V2),
  evidenceTier: asSet(EVIDENCE_TIERS_V2),
  supportType: asSet(EVIDENCE_SUPPORT_TYPES),
  derivationType: asSet(DERIVATION_TYPES),
  sourceType: asSet(SOURCE_KINDS),
  validationFlag: asSet(VALIDATION_FLAGS_V2)
};

const canonicalPairKey = (a: string, b: string): string => [a, b].sort().join('|');

const run = async (): Promise<void> => {
  const raw = await readFile(datasetPath, 'utf8');
  const dataset = JSON.parse(raw) as InteractionDatasetV2;

  const errors: string[] = [];
  const warnings: string[] = [];

  const substanceIds = new Set(dataset.substances.map((s) => s.id));
  const pairKeys = new Set<string>();
  const sourceIds = new Set(dataset.sources.map((s) => s.id));

  for (const source of dataset.sources) {
    if (!enums.sourceType.has(source.source_type)) {
      errors.push(`invalid source_type for source ${source.id}: ${source.source_type}`);
    }
  }

  for (const pair of dataset.pairs) {
    const [a, b] = pair.substances;
    const expectedKey = canonicalPairKey(a, b);
    if (pair.key !== expectedKey) {
      errors.push(`pair key mismatch for ${pair.key}; expected ${expectedKey}`);
    }

    if (pairKeys.has(pair.key)) {
      errors.push(`duplicate pair key: ${pair.key}`);
    }
    pairKeys.add(pair.key);

    if (!substanceIds.has(a) || !substanceIds.has(b)) {
      errors.push(`pair ${pair.key} references unknown substance id(s): ${a}, ${b}`);
    }

    if (!enums.code.has(pair.classification.code)) errors.push(`invalid code in ${pair.key}`);
    if (!enums.status.has(pair.classification.status)) errors.push(`invalid status in ${pair.key}`);
    if (!enums.confidence.has(pair.classification.confidence)) errors.push(`invalid confidence in ${pair.key}`);
    if (!enums.derivationType.has(pair.provenance.derivation_type)) errors.push(`invalid derivation type in ${pair.key}`);
    if (!enums.evidenceTier.has(pair.evidence.tier)) errors.push(`invalid evidence tier in ${pair.key}`);
    if (!enums.supportType.has(pair.evidence.support_type)) errors.push(`invalid support type in ${pair.key}`);

    for (const flag of pair.audit.validation_flags) {
      if (!enums.validationFlag.has(flag)) {
        errors.push(`invalid validation flag ${flag} in ${pair.key}`);
      }
    }

    if (!enums.mechanism.has(pair.mechanism.primary_category)) {
      errors.push(`invalid primary mechanism category in ${pair.key}`);
    }

    for (const category of pair.mechanism.categories) {
      if (!enums.mechanism.has(category)) {
        errors.push(`invalid mechanism category ${category} in ${pair.key}`);
      }
    }

    if (!pair.mechanism.categories.includes(pair.mechanism.primary_category)) {
      errors.push(`primary mechanism category missing from categories in ${pair.key}`);
    }

    if (a === b) {
      if (pair.classification.code !== 'SELF' || pair.classification.risk_score !== -1) {
        errors.push(`self pair ${pair.key} must have code SELF and risk_score -1`);
      }
    }

    if (pair.classification.code === 'UNKNOWN') {
      const hasUnknownStatus = pair.classification.status === 'unknown';
      const hasUnknownFlag = pair.audit.validation_flags.includes('unknown_classification');
      if (!hasUnknownStatus && !hasUnknownFlag) {
        errors.push(`unknown pair ${pair.key} must have unknown status or unknown_classification flag`);
      }
    }

    const expectedRisk = expectedRiskByCode[pair.classification.code];
    if (typeof expectedRisk === 'number' && pair.classification.risk_score !== expectedRisk) {
      errors.push(
        `risk score mismatch for ${pair.key}; got ${pair.classification.risk_score}, expected ${expectedRisk}`
      );
    }

    for (const ref of pair.evidence.source_refs) {
      if (!sourceIds.has(ref.source_id)) {
        errors.push(`source ref ${ref.source_id} in ${pair.key} does not exist in sources[]`);
      }
      if (ref.support_type && !enums.supportType.has(ref.support_type)) {
        errors.push(`invalid source ref support_type in ${pair.key}: ${ref.support_type}`);
      }
    }

    if (pair.classification.confidence === 'low' && !pair.audit.validation_flags.includes('low_confidence')) {
      warnings.push(`pair ${pair.key} has low confidence but no low_confidence flag`);
    }
  }

  for (const warning of warnings) {
    console.warn(`WARN: ${warning}`);
  }

  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }

  console.log(`Validation complete. errors=${errors.length} warnings=${warnings.length}`);
  if (errors.length > 0) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
