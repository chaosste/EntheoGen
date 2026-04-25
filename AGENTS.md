# Agent Curation Rules

- Natural-language interaction reports are allowed as curation input.
- Always convert natural-language reports into structured proposals in `src/curation/interaction-updates.jsonl` before any patch generation.
- Never apply NLP-derived changes directly to `src/data/interactionDatasetV2.json`.
- Treat NLP extraction as low-confidence by default unless validated by stronger evidence.
- Preserve original report text in `rationale` for traceability.
- For any request to update a single interaction pair from a report, JSONL proposal, or manual curation note, automatically use the `EntheoGenUpdate` skill and follow its workflow without waiting for a reminder.
