import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildUpdateProposal, initParserContext } from './parseInteractionReports';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const fixturePath = path.join(root, 'src/curation/examples/ketamine-serotonergic-opioids-report.md');
const expectedPath = path.join(root, 'src/curation/examples/ketamine-serotonergic-opioids.expected.json');

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async (): Promise<void> => {
  await initParserContext();
  const [fixtureRaw, expectedRaw] = await Promise.all([
    readFile(fixturePath, 'utf8'),
    readFile(expectedPath, 'utf8')
  ]);

  const expected = JSON.parse(expectedRaw) as {
    pair: [string, string];
    'classification.code': string;
    'classification.confidence': string;
    'mechanism.primary_category': string;
    'mechanism.categories': string[];
    'evidence.tier': string;
    status: string;
    source_ref_fallback: string;
  };

  const proposal = buildUpdateProposal(fixtureRaw, 'ketamine-serotonergic-opioids-report.md');

  assert(proposal.pair[0] === expected.pair[0] && proposal.pair[1] === expected.pair[1], 'pair mismatch');
  assert(proposal.requested_change['classification.code'] === expected['classification.code'], 'classification.code mismatch');
  assert(proposal.requested_change['classification.confidence'] === expected['classification.confidence'], 'classification.confidence mismatch');
  assert(proposal.requested_change['mechanism.primary_category'] === expected['mechanism.primary_category'], 'mechanism.primary_category mismatch');

  for (const category of expected['mechanism.categories']) {
    assert(proposal.requested_change['mechanism.categories'].includes(category as any), `missing mechanism category: ${category}`);
  }

  assert(
    proposal.requested_change['evidence.tier'] === expected['evidence.tier'] || proposal.requested_change['evidence.tier'] === 'mechanistic_inference',
    'evidence.tier mismatch'
  );

  assert(proposal.status === expected.status, 'status must remain proposed');
  assert(proposal.workflow.state === 'submitted', 'workflow.state must initialize to submitted');
  assert(Array.isArray(proposal.workflow.transition_history), 'workflow.transition_history must be an array');
  assert(proposal.workflow.transition_history.length === 0, 'workflow.transition_history must initialize empty');
  assert(proposal.source_refs.some((ref) => ref.source_id === expected.source_ref_fallback), 'source_gap fallback expected');

  console.log('Parser fixture test passed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
