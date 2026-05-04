-- Metabase model: interactions_enriched (Phase 1 Supabase)
-- NEW-89: corrected against live schema — see docs/metabase/README.md
--
-- Facts (EntheoGen Phase 1):
--   - pair_key is canonical: least(id_a,id_b) || '|' || greatest(id_a,id_b)
--   - risk_score is NUMERIC (typically 1–5; self-pairs often -1; nullable for unknown)
--   - classification_confidence is TEXT: high|medium|low|none|not_applicable
--   - mechanism_categories is JSONB array (use jsonb_array_length / jsonb_array_elements_text)
--
-- Paste into Metabase → Native query → Turn into a model (or wrap in CREATE VIEW in Supabase if you prefer DB-side).

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
  end as risk_bucket,
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
  and not s_high.deprecated;
