import {
  applyWorkflowTransition,
  type WorkflowRecord,
  type WorkflowState
} from './stateMachine';

export interface InteractionUpdateWorkflowTransition {
  from: WorkflowState;
  to: WorkflowState;
  actor: string;
  at: string;
  note?: string;
}

export interface InteractionUpdateWorkflowData {
  state: WorkflowState;
  transition_history: InteractionUpdateWorkflowTransition[];
}

export interface InteractionUpdateRecord {
  update_id: string;
  status?: string;
  workflow?: InteractionUpdateWorkflowData;
  [key: string]: unknown;
}

const VALID_STATES = new Set<WorkflowState>([
  'submitted',
  'structured',
  'curator_review',
  'safety_review',
  'approved',
  'published',
  'archived',
  'blocked'
]);

function isWorkflowState(value: unknown): value is WorkflowState {
  return typeof value === 'string' && VALID_STATES.has(value as WorkflowState);
}

function normalizeTransitionHistory(value: unknown): InteractionUpdateWorkflowTransition[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is InteractionUpdateWorkflowTransition => {
      if (!entry || typeof entry !== 'object') return false;
      const candidate = entry as Record<string, unknown>;
      return (
        isWorkflowState(candidate.from) &&
        isWorkflowState(candidate.to) &&
        typeof candidate.actor === 'string' &&
        typeof candidate.at === 'string' &&
        (candidate.note === undefined || typeof candidate.note === 'string')
      );
    })
    .map((entry) => ({ ...entry }));
}

export function resolveInteractionUpdateWorkflow(record: InteractionUpdateRecord): InteractionUpdateWorkflowData {
  const explicit = record.workflow;
  if (explicit && isWorkflowState(explicit.state)) {
    return {
      state: explicit.state,
      transition_history: normalizeTransitionHistory(explicit.transition_history)
    };
  }

  // Legacy proposals only had status=proposed; map them into the governed workflow.
  if (record.status === 'proposed' || record.status === undefined) {
    return {
      state: 'submitted',
      transition_history: []
    };
  }

  throw new Error(`Unsupported legacy update status for ${record.update_id}: ${String(record.status)}`);
}

interface TransitionContext {
  actor: string;
  at?: string;
  note?: string;
}

export function transitionInteractionUpdateRecord(
  record: InteractionUpdateRecord,
  to: WorkflowState,
  context: TransitionContext
): InteractionUpdateRecord {
  const workflow = resolveInteractionUpdateWorkflow(record);

  const baseRecord: WorkflowRecord = {
    id: record.update_id,
    state: workflow.state,
    transition_history: workflow.transition_history
  };

  const nextWorkflow = applyWorkflowTransition(baseRecord, to, context);

  return {
    ...record,
    workflow: {
      state: nextWorkflow.state,
      transition_history: nextWorkflow.transition_history
    }
  };
}
