# Submission Intake Flow (Current Repo)

This repository does not contain a backend route at
`/apps/api/routes/submission.*`. Intake is file-first and workflow-governed.

## Scope

- Source reports: `src/curation/nl-reports/incoming/`
- Parsed reports: `src/curation/nl-reports/parsed/`
- Failed reports: `src/curation/nl-reports/failed/`
- Update queue: `src/curation/interaction-updates.jsonl`
- Canonical dataset reference: `src/data/interactionDatasetV2.json`

## Current Intake Path

```text
Submission report markdown
-> parseInteractionReports.ts
-> workflow-initialized proposal (state=submitted)
-> interaction-updates.jsonl
-> transitionInteractionUpdateState.ts
-> review/approval states
-> publication lane (approved -> published requires review note)
```

Linear remains the workflow control plane. The repository includes a workflow
state-to-Linear status/owner mapping helper in
`scripts/workflow/linearWorkflowAlignment.ts` so issue state can stay aligned
to record state without inventing a backend orchestration layer.

Current CLI behavior in `scripts/workflow/transitionInteractionUpdateState.ts`
prints:

- the applied workflow transition result
- a structured audit event payload that includes workflow transition fields and
  role-action mapping (`owner_role`, `linear_state`, `review_action`,
  `github_pr_flow`)

On failure, the CLI currently prints a plain error message (stderr) and exits
non-zero; it does not emit a global structured error envelope.

For parser-generated proposal drafts, `reviewer_notes` should stay explicitly
sectioned as `Extracted`, `Inferred`, `Uncertainty`, and `Draft-only` to keep
candidate interpretation separate from source-grounded data.

## Commands

```bash
# Parser contract + workflow initialization assertions
npm run test:submission-intake

# Parse incoming markdown reports into update proposals
npm run reports:parse

# Apply a governed transition for one proposal
npx tsx scripts/workflow/transitionInteractionUpdateState.ts \
  --update-id <update_id> \
  --to structured \
  --actor "codex"
```

For `--to published`, include `--note "<PR/review reference>"`.
