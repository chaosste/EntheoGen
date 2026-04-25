import interactionPairsRaw from '../exports/interaction_pairs.json' with { type: 'json' };
import interactionDatasetV2Raw from './interactionDatasetV2.json' with { type: 'json' };
import type { InteractionDatasetV2 } from './interactionSchemaV2';

export type RuleOrigin = 'self' | 'explicit' | 'fallback' | 'unknown';

export type InteractionCode =
  | 'LOW'
  | 'LOW_MOD'
  | 'CAU'
  | 'UNS'
  | 'DAN'
  | 'UNK'
  | 'SELF';

export interface InteractionPair {
  substance_a_id: string;
  substance_b_id: string;
  pair_key: string;
  origin: RuleOrigin;
  interaction_code: InteractionCode;
  interaction_label: string;
  risk_scale: number;
  summary: string;
  confidence: string;
  mechanism: string | null;
  mechanism_category: string;
  timing: string | null;
  evidence_gaps: string | null;
  evidence_tier: string | null;
  field_notes: string | null;
  sources: string;
  source_refs: string[];
  source_fingerprint: string;
}

export const interactionPairs = interactionPairsRaw as InteractionPair[];
export const interactionDatasetV2 = interactionDatasetV2Raw as InteractionDatasetV2;
