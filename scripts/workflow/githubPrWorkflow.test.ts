import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const templatePath = path.join(root, '.github/PULL_REQUEST_TEMPLATE.md');

const template = await readFile(templatePath, 'utf8');

const requiredAnchors = [
  '## Control Plane',
  'Linear issue:',
  'Executor/delegate:',
  'Branch/commits:',
  'PR flow expectation:',
  '## Execution Trace',
  'Changed surfaces:',
  'Commands run:',
  'Generated or review artifacts:',
  'Residual risks:',
  '## Human Approval Boundary',
  'PR references the Linear issue or explicit user override.',
  'Merge decision remains human-controlled.',
  'Publication, deployment, safety, and dataset approval remain human-controlled.',
  'Linear state and automation output are not treated as approval artifacts.'
];

for (const anchor of requiredAnchors) {
  assert.ok(template.includes(anchor), `missing PR template anchor: ${anchor}`);
}

assert.match(template, /NEW-###/, 'PR template should prompt for a Linear issue identifier');
assert.match(
  template,
  /not_required \| recommended \| required_for_publication \| already_published_or_retired/,
  'PR template should use the workflow GitHub PR expectation values'
);

console.log('github PR workflow template assertions passed');
