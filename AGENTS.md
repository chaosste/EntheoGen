## Repo Guidance

Work directly when the task is clear, bounded, and low-risk. Keep diffs small,
reviewable, and reversible, and prefer the repository's existing patterns over
new abstractions.

Do not commit secrets, tokens, private keys, or live credentials. Use placeholder
values in examples and documentation.

Do not revert user or branch changes unless explicitly asked. If unrelated
changes are present, leave them alone; if they affect the task, work with them
and call out any remaining risk.

Dependencies may be added when they are needed for requested work,
verification, or existing tooling. Keep additions narrow and explain why they
are needed.

Broad refactors should be protected with tests before behavior-changing edits.
Small obvious fixes, documentation edits, and simple tooling updates may be made
directly.

Commit messages should explain why the change was made. Structured trailers are
not required.

## Verification

Use the real commands available in this repo:

- `npm run typecheck` for TypeScript verification.
- `npm run build` for production build verification.
- `npm test` for the knowledge-base and interaction validation suite.
- Targeted scripts such as `npm run test:slack`, `npm run kb:validate`, or
  `npm run validate:interactions:v2` when they directly cover the change.

Run the checks that are directly relevant to the files changed. Do not invent
fake verification.

## OMX Runtime

Use direct execution for routine, bounded repo work.

Use OMX runtime workflows such as `ralph`, `ralplan`, `team`, or `ultrawork`
only when the user explicitly asks for them, or when the task is large,
ambiguous, multi-agent, or needs durable staged coordination.

Do not require PRDs, test-spec gates, team overlays, or runtime state updates
for small fixes, documentation edits, simple scripts, dependency/tooling fixes,
or ordinary verification.

## Automation Components

For EntheoGen automation components, follow
`docs/automation/AUTOMATION_AGENTS.md`. That specification defines the live
automation role boundaries, output contracts, and human-approval constraints.

## Learned User Preferences

- Prefer minimal, isolated patches over broad refactors.
- Keep provenance/auth systems untouched during interaction UI/data-layer work
  unless explicitly requested.
- Remove dead code only when TypeScript explicitly confirms it is unused.
- Keep new filtering logic centralized in a single composable helper.
- Use normalized `UIInteraction` fields for UI behavior and rendering instead of
  raw dataset fields.

## Learned Workspace Facts

- The UI interaction adapter is centered in `src/data/uiInteractions.ts`.
- Research Mode filtering is centralized in `src/data/researchMode.ts`.
- A dev regression assertion script exists at
  `scripts/testUIInteractionsAdapter.ts`.
