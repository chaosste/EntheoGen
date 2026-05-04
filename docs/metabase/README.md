# Metabase on EntheoGen Phase 1 (Supabase)

End-to-end CSV backup, staging reload, and Metabase SQL copy: see [SUPABASE_PHASE1_CSV_PIPELINE.md](../automation/SUPABASE_PHASE1_CSV_PIPELINE.md).

## `interactions_enriched` model (NEW-89)

The Linear draft in [Metabase table, graph and model layer creation](https://linear.app/new-psychonaut/document/metabase-table-graph-and-model-layer-creation-34b332599de1) used **0–1 `risk_score`** and **numeric `classification_confidence`**. Phase 1 Postgres uses:

- **`risk_score`**: numeric, typically **1–5** (plus nulls and **self-pair `-1`** semantics).
- **`classification_confidence`**: **text** (`high` / `medium` / `low` / `none` / `not_applicable`).
- **`mechanism_categories`**: **jsonb** array — use `jsonb_array_length` or `jsonb_array_elements_text` for multi-label analytics.

Canonical pair labels for joins: **`LEAST` / `GREATEST`** on substance ids (see [AGENTS.md](../../AGENTS.md) learned workspace facts).

### Create the model in Metabase

1. Connect Metabase to the Supabase Postgres database (read-only user recommended).
2. **New** → **SQL query** → paste the contents of [interactions_enriched.sql](./interactions_enriched.sql).
3. Run the query; confirm row count matches expectations (non-deprecated substances only).
4. **Save** → choose **Turn this into a model** (or your Metabase version’s equivalent: save as **Model** with collection + friendly name `interactions_enriched`).
5. Set **primary key** / entity keys in the model UI to `pair_key` if Metabase prompts for grain.
6. Build charts from the **model** so pair normalization, buckets, and deprecated filtering stay consistent.

### Model versioning (`interactions_enriched_v2`, NEW-90)

Older Metabase/CSV exports (for example **2026-04-28** snapshots) often used **fractional `risk_score`**, a **`risk_bucket` column that does not match** Phase 1 integer cutpoints, **empty text `classification_confidence`**, or **names not aligned to normalized ids**. Phase 1 Postgres and the app use **integer-like `risk_score` (1–5, null, self-pair -1)**, **text confidence**, and **canonical `pair_key`**.

Use **[interactions_enriched_v2.sql](./interactions_enriched_v2.sql)** for **new** Metabase models and dashboards:

1. **New** → **SQL query** → paste `interactions_enriched_v2.sql` → run.
2. Confirm row count: it **drops** rows where `pair_key` ≠ `least(id)|greatest(id)` (data hygiene). If the count is unexpectedly low, fix `pair_key` in `public.interactions` before relying on v2.
3. Save as a model named e.g. **`interactions_enriched_v2`** (keep the legacy **`interactions_enriched`** model until questions are migrated).
4. In new questions, group on **`substance_1_id` / `substance_1_name`** (normalized), not raw `substance_a_id` unless you intentionally want row storage order.
5. Use **`risk_severity_bucket`** (`critical` / `high` / `moderate` / `low` / `unknown`; self-pairs are **out of scope** for this model) — not legacy export columns named `Risk Bucket` that used different semantics.

`npm run supabase:phase1-csv-pipeline -- emit-bundle` copies both **`interactions_enriched.sql`** and **`interactions_enriched_v2.sql`** into `scripts/automation/generated/` for runbooks.

### Dashboard and display conventions (Phase 1)

These are **defaults for analytics quality**, not a governance gate: routine chart tweaks and exclusions do **not** need explicit sign-off.

- **Self-pairs:** **`interactions_enriched_v2`** keeps self rows in the result set but adds **`is_comparable_pair`** (`true` when not a self-pair). Set a **default Metabase segment / filter** `is_comparable_pair = true` on most charts so pair analytics stay comparable; self rows remain available for reference. Legacy **`interactions_enriched.sql` (v1)** may still surface self rows without that flag; prefer v2 for new work. If you maintain a Supabase **`VIEW`**, refresh its body when this repo’s v2 SQL changes.
- **`risk_score`:** Use the Phase **1–5** (integer-style) numeric axis and aggregations. **Do not** remap to **0–1** for charts or exports — that scale dropped most of the signal in older pipelines.
- **Nulls:** Show **`NULL`** as **“N/A”** (or equivalent) in Metabase column display names / custom expressions where it is quick to do.
- **Labels:** Prefer **natural, UI-friendly** column titles and category labels on charts (Metabase field display names, axis labels) where it is straightforward.
- **Dataset scope:** Prefer getting the **best insight from the current Phase 1 dataset** over blocking dashboards on future schema work.

### Optional follow-on models

Once `interactions_enriched` (or v2) exists as a Metabase model, downstream saved questions can use:

- **Substance risk profile**: `GROUP BY substance_1_id, substance_1_name` with `avg(risk_score)`, counts, `high` share — **union** both ends of the pair if you need undirected substance totals (or aggregate on `substance_1_id` only if you adopt a fixed undirected convention).
- **Mechanism × risk**: `GROUP BY primary_mechanism_category, risk_severity_bucket` (v2) or `risk_bucket` (v1 SQL alias).
- **Class × class**: `GROUP BY substance_1_class, substance_2_class`.

### Deprecated / legacy rows

The base query **excludes** rows where either joined substance is `deprecated`. For legacy analytics, copy the SQL, remove the `WHERE not s_low.deprecated` clause (or branch with a parameter once Metabase supports it), and save as a separate model (e.g. `interactions_enriched_with_deprecated`).
