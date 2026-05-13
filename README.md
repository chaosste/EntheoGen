# EntheoGen — slim UI

Vite + React SPA only: no dataset build scripts, KB, agents, Supabase, or CI docs in this branch.

## Bundled data (replace from your pipeline)

- `src/data/substances_snapshot.json`
- `src/exports/interaction_pairs.json`

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

## References panel

The in-app reference list is an inline placeholder in `src/App.tsx` (no `knowledge-base/` path).
