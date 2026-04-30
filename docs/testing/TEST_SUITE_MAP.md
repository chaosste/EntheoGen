# Test Suite Map

This map aligns live test commands to current EntheoGen modules.

## Coverage Labels

| Coverage label | Command | Modules covered |
| --- | --- | --- |
| `dataset_helpers` | `npm run test:dataset-helpers` | `scripts/datasetPaths.ts`, `scripts/buildAppDatasetFromBeta.ts`, `scripts/betaDatasetMapping.ts` |
| `workflow_modules` | `npm run test:workflow` | `scripts/workflow/stateMachine.ts`, `scripts/workflow/transitionInteractionUpdateState.ts`, `scripts/workflow/interactionUpdateWorkflow.ts` |
| `agent_output_contracts` | `npm run updates:test-parser` | `scripts/parseInteractionReports.ts` proposal output shape and workflow initialization |
| `knowledge_base_pipeline` | `npm run kb:test` | `scripts/testKnowledgeBasePipeline.ts`, `scripts/testAlmaIngestion.ts`, `scripts/testPerplexityIngestion.ts` |
| `external_bridge_slack` | `npm run test:slack` | `scripts/slack/slackApi.ts` request/response bridge behavior |
| `validation_surface` | `npm test` | `scripts/validateKnowledgeBase.ts`, `scripts/validateInteractionsV2.ts` |

## Full Alignment Suite

Use this when validating test-surface alignment across dataset helpers, workflow
modules, and agent output contracts:

```bash
npm run test:suite:alignment
```

## Notes

- There is no `/tests/` directory in this repository; executable tests live under `scripts/`.
- Keep command references in docs and issues aligned to package scripts.
- Add or remove coverage labels only when the associated command changes.
- Obsolete construction-stage tests that depend on removed fixtures should be
  deleted instead of kept as broken placeholders.
