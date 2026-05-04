-- Metabase model: interactions_enriched_v2 (Phase 1 Supabase)
-- NEW-90: versioned contract — see docs/metabase/README.md § Model versioning
--
-- Differences vs interactions_enriched.sql (v1):
--   - Explicit substance_a_id / substance_b_id (raw row order) alongside normalized substance_1_* / substance_2_*.
--   - risk_severity_bucket: same CASE logic as v1 risk_bucket; prefer this name for new dashboards (avoids confusion with legacy exports that used "high" loosely).
--   - Enforces canonical pair_key = least || '|' || greatest (rows violating this are excluded).
--
-- Facts (unchanged from v1):
--   - risk_score NUMERIC (typically 1–5; self-pairs often -1; nullable)
--   - classification_confidence TEXT
--   - mechanism_categories JSONB array

select
  i.pair_key,
  i.substance_a_id,
  i.substance_b_id,
  least(i.substance_a_id, i.substance_b_id) as substance_1_id,
  greatest(i.substance_a_id, i.substance_b_id) as substance_2_id,
  s_low.name as substance_1_name,
  s_high.name as substance_2_name,
  s_low.class as substance_1_class,
  s_high.class as substance_2_class,
  i.is_self_pair,
  i.classification_code,
  i.classification_confidence,
  case lower(coalesce(i.classification_confidence, ''))
    when 'high' then 'high'
    when 'medium' then 'medium'
    when 'low' then 'low'
    when 'none' then 'none'
    when 'not_applicable' then 'not_applicable'
    else 'unknown'
  end as confidence_bucket,
  i.risk_score,
  i.risk_label,
  case
    when i.is_self_pair then 'self_pair'
    when i.risk_score is null then 'unknown'
    when i.risk_score >= 5 then 'critical'
    when i.risk_score >= 4 then 'high'
    when i.risk_score >= 3 then 'moderate'
    else 'low'
  end as risk_severity_bucket,
  i.headline,
  i.mechanism_summary,
  i.timing_guidance,
  i.field_notes,
  i.primary_mechanism_category,
  i.mechanism_categories,
  coalesce(jsonb_array_length(i.mechanism_categories), 0) as mechanism_category_count,
  (coalesce(jsonb_array_length(i.mechanism_categories), 0) > 1) as is_multi_mechanism,
  i.evidence_gaps,
  i.provenance_confidence_tier,
  i.provenance_rationale
from public.interactions i
join public.substances s_low
  on s_low.id = least(i.substance_a_id, i.substance_b_id)
join public.substances s_high
  on s_high.id = greatest(i.substance_a_id, i.substance_b_id)
where not s_low.deprecated
  and not s_high.deprecated
  and i.pair_key = concat_ws(
    '|',
    least(i.substance_a_id, i.substance_b_id),
    greatest(i.substance_a_id, i.substance_b_id)
  );
