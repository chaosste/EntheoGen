import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transitionInteractionUpdateRecord, type InteractionUpdateRecord } from './interactionUpdateWorkflow';
import type { WorkflowState } from './stateMachine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const defaultUpdatesPath = path.join(root, 'src/curation/interaction-updates.jsonl');

interface TransitionFileParams {
  filePath: string;
  updateId: string;
  to: WorkflowState;
  actor: string;
  note?: string;
  at?: string;
}

const parseJsonLine = (line: string, lineNo: number): InteractionUpdateRecord => {
  try {
    const parsed = JSON.parse(line) as InteractionUpdateRecord;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.update_id !== 'string') {
      throw new Error('missing update_id');
    }
    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSONL record at line ${lineNo}: ${message}`);
  }
};

export async function transitionInteractionUpdateStateInFile(params: TransitionFileParams): Promise<void> {
  const raw = await readFile(params.filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  let matches = 0;
  const nextLines = lines.map((line, index) => {
    if (!line.trim()) return line;

    const record = parseJsonLine(line, index + 1);
    if (record.update_id !== params.updateId) return line;

    matches += 1;
    const transitioned = transitionInteractionUpdateRecord(record, params.to, {
      actor: params.actor,
      note: params.note,
      at: params.at
    });
    return JSON.stringify(transitioned);
  });

  if (matches === 0) {
    throw new Error(`No update found with id=${params.updateId}`);
  }
  if (matches > 1) {
    throw new Error(`Multiple updates found with id=${params.updateId}; refusing ambiguous transition.`);
  }

  await writeFile(params.filePath, `${nextLines.join('\n').replace(/\n*$/, '\n')}`, 'utf8');
}

const parseArgValue = (name: string): string | undefined => {
  const direct = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (direct) return direct.slice(name.length + 3);

  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
};

async function main(): Promise<void> {
  const updateId = parseArgValue('update-id');
  const to = parseArgValue('to') as WorkflowState | undefined;
  const actor = parseArgValue('actor');
  const note = parseArgValue('note');
  const filePath = path.resolve(parseArgValue('file') ?? defaultUpdatesPath);

  if (!updateId) {
    throw new Error('Missing required --update-id');
  }
  if (!to) {
    throw new Error('Missing required --to');
  }
  if (!actor) {
    throw new Error('Missing required --actor');
  }

  await transitionInteractionUpdateStateInFile({
    filePath,
    updateId,
    to,
    actor,
    note
  });

  console.log(`Transition applied: ${updateId} -> ${to}`);
}

const isMain = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url : false;
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
