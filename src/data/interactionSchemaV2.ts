export const INTERACTION_CODES_V2 = [
  'SELF',
  'UNKNOWN',
  'LOW',
  'LOW_MOD',
  'CAUTION',
  'UNSAFE',
  'DANGEROUS'
] as const;

export type InteractionCodeV2 = (typeof INTERACTION_CODES_V2)[number];

export const INTERACTION_STATUSES = [
  'confirmed',
  'inferred',
  'low_confidence',
  'missing_evidence',
  'unknown',
  'not_applicable'
] as const;

export type InteractionStatus = (typeof INTERACTION_STATUSES)[number];

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low', 'none', 'not_applicable'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const MECHANISM_CATEGORIES_V2 = [
  'serotonergic_toxicity',
  'maoi_potentiation',
  'psychedelic_intensification',
  'sympathomimetic_load',
  'cardiovascular_load',
  'qt_or_arrhythmia_risk',
  'cns_depression',
  'respiratory_depression',
  'seizure_threshold',
  'anticholinergic_delirium',
  'dopaminergic_load',
  'glutamatergic_dissociation',
  'gabaergic_modulation',
  'dehydration_or_electrolyte_risk',
  'psychiatric_destabilization',
  'operational_or_behavioral_risk',
  'unknown'
] as const;

export type MechanismCategoryV2 = (typeof MECHANISM_CATEGORIES_V2)[number];

export const EVIDENCE_TIERS_V2 = [
  'direct_human_data',
  'clinical_guideline',
  'case_report_or_series',
  'observational_report',
  'mechanistic_inference',
  'field_consensus',
  'traditional_use_precedent',
  'source_gap',
  'not_applicable'
] as const;

export type EvidenceTierV2 = (typeof EVIDENCE_TIERS_V2)[number];

export const EVIDENCE_SUPPORT_TYPES = [
  'direct',
  'indirect',
  'mechanistic',
  'field_observation',
  'traditional_context',
  'extrapolated',
  'none'
] as const;

export type EvidenceSupportType = (typeof EVIDENCE_SUPPORT_TYPES)[number];

export const DERIVATION_TYPES = [
  'explicit_source',
  'curated_inference',
  'fallback_rule',
  'generated_unknown',
  'self_pair'
] as const;

export type DerivationType = (typeof DERIVATION_TYPES)[number];

export const SOURCE_KINDS = [
  'primary_source',
  'secondary_source',
  'field_guidance',
  'internal_research_update',
  'generated_placeholder',
  'none'
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export const VALIDATION_FLAGS_V2 = [
  'missing_mechanism',
  'missing_timing',
  'missing_evidence_tier',
  'missing_source',
  'low_confidence',
  'unknown_classification',
  'mechanism_category_unknown',
  'override_applied',
  'source_gap'
] as const;

export type ValidationFlagV2 = (typeof VALIDATION_FLAGS_V2)[number];

export interface SourceClaimRefV2 {
  source_id: string;
  claim_excerpt?: string;
  support_type?: EvidenceSupportType;
}

export interface InteractionClassificationV2 {
  code: InteractionCodeV2;
  status: InteractionStatus;
  confidence: ConfidenceLevel;
  risk_score: number;
  label?: string;
}

export interface EvidenceProfileV2 {
  tier: EvidenceTierV2;
  support_type: EvidenceSupportType;
  source_refs: SourceClaimRefV2[];
  evidence_gaps?: string | null;
}

export interface ProvenanceV2 {
  derivation_type: DerivationType;
  origin_value_v1?: string;
  migrated_from_v1: true;
  migration_version: 'v1_to_v2';
  migrated_at: string;
}

export interface OverrideMetadataV2 {
  applied: boolean;
  override_id?: string;
  reason?: string;
}

export interface AuditMetadataV2 {
  validation_flags: ValidationFlagV2[];
  review_status: 'human_reviewed' | 'needs_review';
  validation_notes?: string[];
}

export interface SourceV2 {
  id: string;
  title: string;
  source_type: SourceKind;
  reliability: 'unknown';
  fingerprint?: string;
}

export interface SubstanceV2 {
  id: string;
  name: string;
  class?: string;
  mechanism_tag?: string;
  notes?: string;
}

export interface InteractionPairV2 {
  key: string;
  substances: [string, string];
  classification: InteractionClassificationV2;
  clinical_summary: {
    headline: string;
    mechanism?: string | null;
    timing_guidance?: string | null;
    field_notes?: string | null;
  };
  mechanism: {
    primary_category: MechanismCategoryV2;
    categories: MechanismCategoryV2[];
  };
  evidence: EvidenceProfileV2;
  source_text?: string;
  source_fingerprint?: string;
  provenance: ProvenanceV2;
  override_metadata: OverrideMetadataV2;
  audit: AuditMetadataV2;
}

export interface InteractionDatasetV2 {
  schema_version: 'v2';
  generated_at: string;
  substances: SubstanceV2[];
  pairs: InteractionPairV2[];
  sources: SourceV2[];
}
