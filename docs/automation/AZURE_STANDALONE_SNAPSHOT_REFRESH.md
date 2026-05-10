# Azure standalone EntheoGen snapshot refresh (manual)

Use this when you want the **Azure PostgreSQL** database `entheogen` on flexible server **`sb1397datsetserver`** to match a **major** refresh of **Supabase Phase 1 / V3** data. This path is **manual only**—no scheduled jobs or auto-sync.

**Purpose:** A read-only-friendly, Azure-hosted copy for student-safe use, governance/ethics demos, and stakeholders who should not depend on live Supabase.

## Prerequisites

- **Azure CLI** logged into the correct tenant/subscription (`az account show`).
- **psql** (PostgreSQL client).
- **Microsoft Entra** access to the target server as a configured admin (e.g. `sb1397@exeter.ac.uk`). The server uses Entra + token auth for interactive refresh.
- **Source CSVs** at the repo root: **`substances.csv`** and **`interactions.csv`**, matching Supabase `public.substances` and `public.interactions`.

### Refresh CSVs from Supabase (recommended before load)

From the repo root, with **`DATABASE_URL`** or **`SUPABASE_DB_URL`** in **`.env.local`** (gitignored):

```bash
npm run supabase:phase1-csv-pipeline -- export
```

Validate row counts if needed (Supabase dashboard or `execute_sql`).

## Target

| Item | Value |
|------|--------|
| Server | `sb1397datsetserver` |
| FQDN | `sb1397datsetserver.postgres.database.azure.com` |
| Database | `entheogen` |
| Resource group | `neurophenom_group-a499` |
| Subscription | (your Exeter tenant subscription containing this RG) |

## One-time full replace (schema + data)

Run from the **EntheoGen repo root**. Replace `YOUR_ENTRA_USER@domain` with an Entra principal that is a **Microsoft Entra admin** on the flexible server.

### 1. Connect helper

```bash
export PGHOST=sb1397datsetserver.postgres.database.azure.com
export PGPORT=5432
export PGDATABASE=entheogen
export PGUSER='YOUR_ENTRA_USER@domain'
export PGPASSWORD="$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)"
export PGSSLMODE=require
```

### 2. Recreate live tables (V3 shape)

If the database already has V3 tables and you only need a data refresh, skip DDL and go to step 4 with `TRUNCATE` + insert only (see **Incremental refresh** below).

Initial / full reset DDL (drops legacy objects such as old `interaction_pairs` **table** if present):

```sql
begin;

drop table if exists public.interaction_pairs cascade;
drop view if exists public.interaction_pairs cascade;
drop table if exists public.interactions cascade;
drop table if exists public.substances cascade;

create table public.substances (
  id text primary key,
  name text not null,
  class text,
  mechanism_tag text,
  notes text,
  deprecated boolean not null default false,
  superseded_by text references public.substances(id),
  source_schema_version text,
  source_generated_at timestamptz
);

create table public.interactions (
  pair_key text primary key,
  substance_a_id text not null references public.substances(id),
  substance_b_id text not null references public.substances(id),
  is_self_pair boolean not null default false,
  classification_code text,
  classification_confidence text,
  risk_score numeric,
  risk_label text,
  headline text,
  mechanism_summary text,
  timing_guidance text,
  field_notes text,
  primary_mechanism_category text,
  mechanism_categories jsonb not null default '[]'::jsonb,
  evidence_gaps text,
  provenance_confidence_tier text,
  provenance_rationale text
);

commit;
```

Apply with:

```bash
psql -v ON_ERROR_STOP=1 -c "$(cat <<'SQL'
-- paste SQL block above
SQL
)"
```

Or use `-f` with a local `.sql` file.

### 3. Staging objects

```bash
psql -v ON_ERROR_STOP=1 -f scripts/automation/sql/02_staging_ddl_and_helper.sql
```

### 4. Load CSVs into staging

Use **absolute paths** to the CSVs:

```bash
psql -v ON_ERROR_STOP=1 <<SQL
\\copy public._staging_substances_csv from '$(pwd)/substances.csv' with (format csv, header true)
\\copy public._staging_interactions_csv from '$(pwd)/interactions.csv' with (format csv, header true)
SQL
```

### 5. Swap into live tables

**Important:** truncate **`interactions` and `substances` in one statement** (FK order).

Use the same `INSERT … SELECT` logic as `scripts/automation/sql/03_swap_from_staging.sql`, but replace the two `truncate` lines with:

```sql
truncate table public.interactions, public.substances;
```

Then run the two `insert into public.substances` / `insert into public.interactions` blocks from that file unchanged.

### 6. Legacy compatibility view (optional but recommended)

Stakeholders or old scripts may expect **`public.interaction_pairs`**. Expose it as a **view** over V3 `interactions`:

```sql
create or replace view public.interaction_pairs as
select
  pair_key,
  substance_a_id,
  substance_b_id,
  classification_code as interaction_code,
  case
    when risk_score is null then null
    else round(risk_score)::int
  end as risk_scale,
  provenance_confidence_tier as origin,
  primary_mechanism_category as mechanism_category
from public.interactions;
```

### 7. Remove staging (optional)

```sql
drop table if exists public._staging_interactions_csv;
drop table if exists public._staging_substances_csv;
drop function if exists public._staging_mechanism_categories_to_jsonb(text);
```

### 8. Sanity checks

```sql
select (select count(*) from public.substances) as substances,
       (select count(*) from public.interactions) as interactions;
```

Spot-check a few `pair_key` values and `mechanism_categories` jsonb against Supabase.

## Incremental refresh (data only, schema unchanged)

When `public.substances` / `public.interactions` already exist and match V3:

1. Re-run steps **3–5** (staging DDL, `\copy`, swap with `truncate table public.interactions, public.substances`).
2. Re-run step **6** if the view definition changed in repo docs.
3. Drop staging (step 7).

## Related repo docs

- Supabase → CSV export: [SUPABASE_PHASE1_CSV_PIPELINE.md](./SUPABASE_PHASE1_CSV_PIPELINE.md)
- Metabase models (optional future Azure Metabase): [docs/metabase/README.md](../metabase/README.md)

## Safety

- Do **not** commit connection strings or passwords. Prefer Entra tokens via `az account get-access-token --resource-type oss-rdbms`.
- Treat this database as a **snapshot**: it will drift from Supabase until the next manual refresh.
