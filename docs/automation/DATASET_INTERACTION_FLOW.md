# Dataset Interaction Flow (Current Repo)

Purpose: this repository currently consumes upstream dataset CSVs, writes app
snapshot artifacts, and uses PR-based review for canonical dataset-aligned
changes.

## Scope

This issue request references `/packages/dataset/`, but that path does not
exist in this repository. Scope is mapped to real repository surfaces:

- `scripts/datasetPaths.ts` path resolution for CSV inputs and app/canonical
  outputs
- `scripts/buildAppDatasetFromBeta.ts` CSV-to-JSON snapshot export
- `scripts/generateDatasetChangelog.ts` PR-linked canonical change summary
- `scripts/consolidateJsonUpdates.ts` canonical dataset/index/schema merge path
- `src/data/interactionDataset.ts` and `src/data/drugData.ts` app read surfaces
- `src/exports/interaction_pairs.json` and `src/data/substances_snapshot.json`
  app snapshot artifacts
- `src/data/interactionDatasetV2.json` and `knowledge-base/indexes/*` canonical
  review surfaces

Out of scope for this issue:

- schema redesign
- canonical data edits
- new storage/indexing systems

## Dataset Files And Roles

- Upstream dataset input: `substances.csv` (read by
  `scripts/buildAppDatasetFromBeta.ts`)
- Upstream dataset input: `interactions_enriched.csv` may be provided by some
  source workspaces for interaction records.
- In-repo script input contract: `scripts/buildAppDatasetFromBeta.ts` currently
  reads `interactions.csv` (resolved by `scripts/datasetPaths.ts`) and does not
  auto-discover `interactions_enriched.csv`.
- Operational implication: when upstream provides `interactions_enriched.csv`,
  humans must decide the handling path (for example explicit copy/rename to
  `interactions.csv`, or a script change reviewed in PR) before running the
  snapshot build.
- App snapshot output: `src/data/substances_snapshot.json`
- App snapshot output: `src/exports/interaction_pairs.json`
- Canonical dataset source: `src/data/interactionDatasetV2.json`
- Canonical supporting indexes/schemas:
  `knowledge-base/indexes/source_manifest.json`,
  `knowledge-base/indexes/source_tags.json`,
  `knowledge-base/indexes/citation_registry.json`,
  `knowledge-base/schemas/source.schema.json`,
  `knowledge-base/schemas/claim.schema.json`

## Read/Write Pathways

1. CSV input detection and path resolution
- Command: `npm run dataset:paths`
- Source: `scripts/datasetPaths.ts`
- Behavior: prints resolved `beta_csv_inputs` and `app_dataset_exports` paths.

2. Snapshot export for app runtime
- Command: `npm run dataset:build-beta <beta-data-dir>`
- Source: `scripts/buildAppDatasetFromBeta.ts`
- Reads: `<beta-data-dir>/substances.csv` and
  `<beta-data-dir>/interactions.csv` (current script contract)
- Upstream compatibility note: if only
  `<beta-data-dir>/interactions_enriched.csv` exists, resolve that mismatch
  explicitly before this command is run.
- Writes: `src/data/substances_snapshot.json` and
  `src/exports/interaction_pairs.json`

3. App runtime dataset read
- Source: `src/data/interactionDataset.ts`
- Reads: `src/exports/interaction_pairs.json` and
  `src/data/interactionDatasetV2.json`
- Source: `src/data/drugData.ts`
- Reads: `src/data/substances_snapshot.json`

4. Canonical review and merge flow (conditional)
- For changes touching canonical dataset/index/schema surfaces, use:
  - `npm run changelog:dataset -- --pr "<PR reference>"`
  - `npm run json:consolidate` only when update artifacts are intentionally
    being absorbed
- Behavior: generate PR-linked review evidence and apply explicit merges through
  tracked scripts, not ad hoc edits.

## Decision Boundaries

Automation may:

- resolve and print dataset paths
- transform approved CSV inputs into app snapshot JSON artifacts
- generate canonical dataset changelog drafts for PR review
- surface conflicts or merge candidates for curator review

Humans must approve:

- any PR that changes canonical dataset/index/schema files
- interpretation-level classification/evidence changes
- any handling decision when upstream uses `interactions_enriched.csv` instead
  of `interactions.csv`
- any script change that modifies CSV filename contracts or canonical merge
  behavior

Prohibited in this flow:

- silent direct edits to canonical dataset files outside reviewed workflows
- treating automation output as publication approval
- introducing new schema/storage/indexing layers in this doc-alignment issue

## Risk-Based Guidance

- For docs-only or test-surface-only changes, run targeted checks and avoid
  broad all-check pipelines.
- For app snapshot refreshes, verify input file naming first, then run focused
  snapshot commands.
- If `interactions_enriched.csv` is present but `interactions.csv` is not,
  treat this as an explicit decision point instead of silently guessing.
- For canonical surface changes, require PR-linked changelog evidence and human
  review before merge/deploy decisions.

## Acceptance Criteria (Testable Now)

- Dataset interaction flow is explicit across read/write surfaces and commands.
- PR-based canonical update mechanism is documented with concrete command and
  artifact references.
- Boundaries clearly separate automation actions, human approvals, and
  prohibited actions.
- No schema or dataset content changes are required by this documentation update.

## Verification

Run:

```bash
npm run dataset:paths
npm run test:dataset-paths
npm run test:changelog
```

Expected outputs:

- `npm run dataset:paths` prints JSON including `beta_csv_inputs` and
  `app_dataset_exports`.
- `npm run test:dataset-paths` prints `dataset path helper checks passed`.
- `npm run test:changelog` prints
  `dataset changelog generation assertions passed.`

Residual risks and limitations:

- The current snapshot build script does not automatically consume
  `interactions_enriched.csv`; upstream naming mismatches still require explicit
  handling before execution.
- `npm run dataset:build-beta` is mutating by design and should be run only when
  a snapshot refresh is intentionally in scope.
- This document describes current execution behavior and review boundaries; it
  does not redefine upstream dataset ownership or naming policy.
