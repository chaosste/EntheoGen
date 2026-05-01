# Natural Language Report → Interaction Update Proposal

Convert a natural-language pharmacology / harm-reduction interaction report into one valid `InteractionUpdateProposal` JSONL line for:

`src/curation/interaction-updates.jsonl`

## Output rules

- Output exactly one JSON object.
- No markdown fence.
- No commentary.
- Must be valid single-line JSONL.
- Do not approve or apply the update.
- Always set `"status": "proposed"`.
- Always set `"workflow.state": "submitted"` with empty transition history.
- Use canonical pair IDs from the dataset.
- If no structured source IDs exist, use `"source_gap"`.
- Preserve uncertainty conservatively.
- Keep output explicitly draft/reviewable and never frame it as final authority.
- Use `reviewer_notes` with explicit section labels in this order:
  `Extracted: ... Inferred: ... Uncertainty: ... Draft-only: ...`
  so extracted facts, inferred suggestions, and uncertainty remain separated.

## Required JSON shape

{
  "update_id": "nl_<pair_key>_<short_hash>",
  "created_at": "<ISO timestamp>",
  "created_by": "manual_nl_report",
  "pair": ["<substance_a_id>", "<substance_b_id>"],
  "claim": "<one-sentence summary>",
  "source_refs": [
    {
      "source_id": "<source_id>",
      "claim_support": "direct | indirect | mechanistic | field_observation | traditional_context | extrapolated | none",
      "locator": "<optional>",
      "quote": "<optional>"
    }
  ],
  "requested_change": {
    "classification.code": "CAUTION",
    "classification.confidence": "medium",
    "clinical_summary.headline": "...",
    "clinical_summary.mechanism": "...",
    "clinical_summary.practical_guidance": "...",
    "mechanism.primary_category": "...",
    "mechanism.categories": ["..."],
    "evidence.tier": "...",
    "evidence.support_type": ["..."],
    "evidence.evidence_gaps": "..."
  },
  "rationale": "<condensed rationale from report>",
  "reviewer_notes": "Extracted: <source-grounded facts>. Inferred: <candidate interpretation/suggestions>. Uncertainty: <limitations, evidence gaps, ambiguity>. Draft-only: <human approval required; no publication authority>",
  "status": "proposed",
  "workflow": {
    "state": "submitted",
    "transition_history": []
  }
}

## Classification mapping

- green / low → LOW
- amber / caution / moderate → CAUTION
- unsafe / high risk → UNSAFE
- red / dangerous / contraindicated → DANGEROUS
- unknown / insufficient data → UNKNOWN

## Confidence rules

- Use `"high"` only with direct evidence or strong guideline support.
- Use `"medium"` for plausible, well-supported mechanistic or clinical-practice claims.
- Use `"low"` for sparse, speculative, or source-gap-only claims.
- If direct data are limited, cap confidence at `"medium"`.

## Mechanism category rules

Use only valid v2.1 categories:
- serotonergic_toxicity
- maoi_potentiation
- psychedelic_intensification
- sympathomimetic_load
- cardiovascular_load
- qt_or_arrhythmia_risk
- cns_depression
- respiratory_depression
- seizure_threshold
- anticholinergic_delirium
- dopaminergic_load
- glutamatergic_dissociation
- gabaergic_modulation
- dehydration_or_electrolyte_risk
- psychiatric_destabilization
- operational_or_behavioral_risk
- unknown
