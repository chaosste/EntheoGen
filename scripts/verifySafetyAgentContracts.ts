import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Json = Record<string, unknown>;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const rulesDir = path.join(root, 'packages/agents/safety_rules');
const sentinelDir = path.join(root, 'packages/agents/safety_sentinel');

const FLAG_CATEGORIES = [
  'high_interaction_risk',
  'ambiguous_guidance',
  'missing_warning',
  'overclaiming_evidence',
  'participant_distress_signal',
  'consent_or_data_handling_issue',
  'indigenous_knowledge_sensitivity',
  'legal_or_policy_concern'
] as const;

const SEVERITIES = ['low', 'moderate', 'high', 'critical'] as const;
const WORKFLOW_LABELS = [
  'safety_signal',
  'human_review_required',
  'ethics_advisor_review',
  'data_curator_review',
  'product_lead_review',
  'beta_coordinator_review',
  'linear_escalation_draft',
  'source_gap',
  'evidence_uncertain'
] as const;
const REVIEW_OWNERS = ['ethics_advisor', 'product_lead', 'data_curator', 'beta_coordinator'] as const;
const LINEAR_PRIORITIES = ['none', 'low', 'medium', 'high', 'urgent'] as const;

const asObject = (value: unknown, label: string): Json => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Json;
};

const asArray = (value: unknown, label: string): unknown[] => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
};

const requireKeys = (value: Json, keys: string[], label: string): void => {
  for (const key of keys) {
    if (!(key in value)) {
      throw new Error(`${label} missing required key: ${key}`);
    }
  }
};

const assertAllowed = (value: string, allowed: readonly string[], label: string): void => {
  if (!allowed.includes(value)) {
    throw new Error(`${label} has unsupported value: ${value}`);
  }
};

const assertAllowedArray = (values: unknown[], allowed: readonly string[], label: string): void => {
  for (const value of values.map(String)) {
    assertAllowed(value, allowed, label);
  }
};

const schemaProperty = (schema: Json, key: string, label: string): Json => {
  const properties = asObject(schema.properties, `${label}.properties`);
  return asObject(properties[key], `${label}.properties.${key}`);
};

const enumValues = (schema: Json, label: string): string[] => asArray(schema.enum, `${label}.enum`).map(String);

const requiredSchemaKeys = (schema: Json, keys: string[], label: string): void => {
  const required = asArray(schema.required, `${label}.required`).map(String);
  for (const key of keys) {
    if (!required.includes(key)) {
      throw new Error(`${label}.required missing ${key}`);
    }
  }
  requireKeys(asObject(schema.properties, `${label}.properties`), keys, `${label}.properties`);
};

const run = async (): Promise<void> => {
  const [rulesRaw, rulesExampleRaw, sentinelContractRaw, sentinelExampleRaw] = await Promise.all([
    readFile(path.join(rulesDir, 'rules.json'), 'utf8'),
    readFile(path.join(rulesDir, 'examples/high-risk-interaction.example.json'), 'utf8'),
    readFile(path.join(sentinelDir, 'output-contract.json'), 'utf8'),
    readFile(path.join(sentinelDir, 'examples/safety-signal.example.json'), 'utf8')
  ]);

  const rules = asObject(JSON.parse(rulesRaw), 'rules');
  const rulesExample = asObject(JSON.parse(rulesExampleRaw), 'rules example');
  const sentinelContract = asObject(JSON.parse(sentinelContractRaw), 'sentinel contract');
  const sentinelExample = asObject(JSON.parse(sentinelExampleRaw), 'sentinel example');

  requireKeys(rules, ['rule_set', 'contract_version', 'boundaries', 'workflow_labels', 'review_owners', 'flag_categories', 'severity_levels', 'rules'], 'rules');
  const ruleBoundaries = asObject(rules.boundaries, 'rules.boundaries');
  const ruleHumansApprove = asArray(ruleBoundaries.humans_must_approve, 'rules.boundaries.humans_must_approve').map(String);
  if (!ruleHumansApprove.some((value) => value.includes('interpretation')) || !ruleHumansApprove.some((value) => value.includes('escalation'))) {
    throw new Error('rules boundaries must keep human approval over interpretation and escalation');
  }

  assertAllowedArray(asArray(rules.workflow_labels, 'rules.workflow_labels'), WORKFLOW_LABELS, 'rules.workflow_labels');
  assertAllowedArray(asArray(rules.review_owners, 'rules.review_owners'), REVIEW_OWNERS, 'rules.review_owners');
  assertAllowedArray(asArray(rules.flag_categories, 'rules.flag_categories'), FLAG_CATEGORIES, 'rules.flag_categories');
  assertAllowedArray(asArray(rules.severity_levels, 'rules.severity_levels'), SEVERITIES, 'rules.severity_levels');

  const ruleItems = asArray(rules.rules, 'rules.rules').map((rule, index) => asObject(rule, `rules.rules[${index}]`));
  if (ruleItems.length < FLAG_CATEGORIES.length) {
    throw new Error('rules must cover each safety flag category');
  }
  for (const category of FLAG_CATEGORIES) {
    if (!ruleItems.some((rule) => rule.flag_category === category)) {
      throw new Error(`rules missing category: ${category}`);
    }
  }
  for (const [index, rule] of ruleItems.entries()) {
    requireKeys(rule, ['rule_id', 'flag_category', 'default_severity', 'trigger', 'review_owner', 'workflow_labels', 'review_gate', 'linear_escalation_recommended'], `rules.rules[${index}]`);
    assertAllowed(String(rule.flag_category), FLAG_CATEGORIES, `rules.rules[${index}].flag_category`);
    assertAllowed(String(rule.default_severity), SEVERITIES, `rules.rules[${index}].default_severity`);
    assertAllowedArray(asArray(rule.workflow_labels, `rules.rules[${index}].workflow_labels`), WORKFLOW_LABELS, `rules.rules[${index}].workflow_labels`);
    assertAllowed(String(rule.review_owner), REVIEW_OWNERS, `rules.rules[${index}].review_owner`);
    const labels = asArray(rule.workflow_labels, `rules.rules[${index}].workflow_labels`).map(String);
    if ((String(rule.default_severity) === 'critical' || labels.includes('ethics_advisor_review')) && rule.review_owner !== 'ethics_advisor') {
      throw new Error(`critical or ethics-review rule ${rule.rule_id} must route to ethics_advisor`);
    }
  }

  requireKeys(rulesExample, ['output_type', 'agent', 'contract_version', 'role', 'workflow_labels', 'rule_matches', 'review_routing', 'prohibited_assertions_check'], 'rules example');
  assertAllowedArray(asArray(rulesExample.workflow_labels, 'rules example workflow_labels'), WORKFLOW_LABELS, 'rules example workflow_labels');
  const ruleMatches = asArray(rulesExample.rule_matches, 'rules example.rule_matches').map((match, index) =>
    asObject(match, `rules example.rule_matches[${index}]`)
  );
  if (ruleMatches.length === 0) {
    throw new Error('rules example must include at least one rule match');
  }
  for (const [index, match] of ruleMatches.entries()) {
    requireKeys(match, ['rule_id', 'flag_category', 'severity', 'workflow_labels', 'review_owner', 'review_gate', 'requires_human_approval'], `rules example.rule_matches[${index}]`);
    assertAllowed(String(match.flag_category), FLAG_CATEGORIES, `rules example.rule_matches[${index}].flag_category`);
    assertAllowed(String(match.severity), SEVERITIES, `rules example.rule_matches[${index}].severity`);
    assertAllowedArray(asArray(match.workflow_labels, `rules example.rule_matches[${index}].workflow_labels`), WORKFLOW_LABELS, `rules example.rule_matches[${index}].workflow_labels`);
    assertAllowed(String(match.review_owner), REVIEW_OWNERS, `rules example.rule_matches[${index}].review_owner`);
    if (match.requires_human_approval !== true) {
      throw new Error(`rules example.rule_matches[${index}] must require human approval`);
    }
  }
  const rulesReviewRouting = asObject(rulesExample.review_routing, 'rules example.review_routing');
  assertAllowed(String(rulesReviewRouting.required_human_reviewer), REVIEW_OWNERS, 'rules example required_human_reviewer');

  requiredSchemaKeys(
    sentinelContract,
    [
      'output_type',
      'agent',
      'role',
      'contract_version',
      'pipeline_status',
      'boundaries',
      'input_context',
      'safety_signal',
      'review_routing',
      'linear_escalation',
      'workflow_effect',
      'evidence',
      'validation_notes',
      'prohibited_assertions_check'
    ],
    'sentinel contract'
  );

  const sentinelProperties = asObject(sentinelContract.properties, 'sentinel contract.properties');
  assertAllowedArray(
    enumValues(schemaProperty(sentinelContract, 'pipeline_status', 'sentinel contract'), 'pipeline_status'),
    ['signal_for_human_review', 'no_signal_detected', 'needs_triage'],
    'sentinel pipeline_status'
  );

  const sentinelDefs = asObject(sentinelContract.$defs, 'sentinel contract.$defs');
  const flagCategoryDef = asObject(sentinelDefs.flagCategory, 'sentinel contract.$defs.flagCategory');
  const severityDef = asObject(sentinelDefs.severity, 'sentinel contract.$defs.severity');
  assertAllowedArray(enumValues(flagCategoryDef, 'flagCategory'), FLAG_CATEGORIES, 'sentinel flag_category enum');
  assertAllowedArray(enumValues(severityDef, 'severity'), SEVERITIES, 'sentinel severity enum');

  const workflowLabelDef = asObject(sentinelDefs.workflowLabel, 'sentinel contract.$defs.workflowLabel');
  assertAllowedArray(enumValues(workflowLabelDef, 'workflowLabel'), WORKFLOW_LABELS, 'sentinel workflowLabel enum');

  const reviewOwnerDef = asObject(sentinelDefs.reviewOwner, 'sentinel contract.$defs.reviewOwner');
  assertAllowedArray(enumValues(reviewOwnerDef, 'reviewOwner'), REVIEW_OWNERS, 'sentinel reviewer enum');

  const linearSchema = schemaProperty(sentinelContract, 'linear_escalation', 'sentinel contract');
  const linearProperties = asObject(linearSchema.properties, 'sentinel linear_escalation.properties');
  for (const field of ['create_linear_draft', 'linear_team', 'linear_labels', 'linear_title', 'linear_description', 'linear_priority', 'owner', 'approval_required_before_submission']) {
    if (!(field in linearProperties)) {
      throw new Error(`sentinel linear_escalation missing field ${field}`);
    }
  }
  assertAllowedArray(enumValues(asObject(linearProperties.linear_priority, 'linear_priority schema'), 'linear_priority'), LINEAR_PRIORITIES, 'sentinel linear priority enum');

  requireKeys(
    sentinelExample,
    [
      'output_type',
      'role',
      'pipeline_status',
      'boundaries',
      'input_context',
      'safety_signal',
      'review_routing',
      'linear_escalation',
      'workflow_effect',
      'evidence',
      'validation_notes',
      'prohibited_assertions_check'
    ],
    'sentinel example'
  );

  const exampleBoundaries = asObject(sentinelExample.boundaries, 'sentinel example.boundaries');
  const humansApprove = asArray(exampleBoundaries.humans_must_approve, 'sentinel example.boundaries.humans_must_approve').map(String);
  if (!humansApprove.some((value) => value.includes('escalation'))) {
    throw new Error('sentinel example boundaries must keep escalation outcomes human-approved');
  }
  const exampleSignal = asObject(sentinelExample.safety_signal, 'sentinel example.safety_signal');
  assertAllowed(String(exampleSignal.flag_category), FLAG_CATEGORIES, 'sentinel example flag_category');
  assertAllowed(String(exampleSignal.severity), SEVERITIES, 'sentinel example severity');

  const exampleReview = asObject(sentinelExample.review_routing, 'sentinel example.review_routing');
  assertAllowed(String(exampleReview.required_human_reviewer), REVIEW_OWNERS, 'sentinel example reviewer');
  if (!exampleReview.review_owner) {
    throw new Error('sentinel example review ownership must be explicit');
  }

  const exampleLinear = asObject(sentinelExample.linear_escalation, 'sentinel example.linear_escalation');
  assertAllowed(String(exampleLinear.linear_priority), LINEAR_PRIORITIES, 'sentinel example Linear priority');
  for (const field of ['create_linear_draft', 'linear_team', 'linear_labels', 'linear_title', 'linear_description', 'linear_priority', 'owner', 'approval_required_before_submission']) {
    if (!(field in exampleLinear)) {
      throw new Error(`sentinel example Linear context missing ${field}`);
    }
  }
  assertAllowedArray(asArray(exampleLinear.linear_labels, 'sentinel example Linear labels'), WORKFLOW_LABELS, 'sentinel example Linear labels');
  if (exampleLinear.approval_required_before_submission !== true) {
    throw new Error('sentinel example Linear escalation must require approval before submission');
  }

  const workflowEffect = asObject(sentinelExample.workflow_effect, 'sentinel example.workflow_effect');
  assertAllowed(String(workflowEffect.suggested_workflow_label), WORKFLOW_LABELS, 'sentinel example workflow label');
  if (workflowEffect.may_auto_apply !== false) {
    throw new Error('sentinel example must not allow auto-apply');
  }

  const prohibitedCheck = asObject(sentinelExample.prohibited_assertions_check, 'sentinel example.prohibited_assertions_check');
  for (const [key, value] of Object.entries(prohibitedCheck)) {
    if (value !== true) {
      throw new Error(`sentinel example prohibited assertion check must keep ${key} true`);
    }
  }

  console.log('Safety agent contract verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
