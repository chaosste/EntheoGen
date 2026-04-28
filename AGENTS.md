## Learned User Preferences

- Prefer minimal, isolated patches over broad refactors.
- Keep provenance/auth systems untouched during interaction UI/data-layer work unless explicitly requested.
- Remove dead code only when TypeScript explicitly confirms it is unused.
- Keep new filtering logic centralized in a single composable helper.
- Use normalized `UIInteraction` fields for UI behavior and rendering instead of raw dataset fields.

## Learned Workspace Facts

- The UI interaction adapter is centered in `src/data/uiInteractions.ts`.
- Research Mode filtering is centralized in `src/data/researchMode.ts`.
- A dev regression assertion script exists at `scripts/testUIInteractionsAdapter.ts`.
