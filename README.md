# EntheoGen — slim UI

Vite + React SPA only: no dataset build scripts, KB, agents, Supabase, or CI docs in this branch.

## Bundled data (replace from your pipeline)

- `src/data/substances_snapshot.json`
- `src/data/interactionDatasetV2.json`
- `src/exports/interaction_pairs.json`

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

Optional Cloudflare deploy: `npm run deploy` (requires Wrangler config and credentials).

## References panel

The in-app reference list is an inline placeholder in `src/App.tsx` (no `knowledge-base/` path).
