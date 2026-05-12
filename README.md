<div align="center">

[![DOI](https://zenodo.org/badge/1234835641.svg)](https://doi.org/10.5281/zenodo.20127293)
![Dataset](https://img.shields.io/badge/Dataset-beta--0.1-blue)
![Interactions](https://img.shields.io/badge/Interactions-~794-informational)
![Substances](https://img.shields.io/badge/Substances-~41-informational)
![App data](https://img.shields.io/badge/App%20data-static%20JSON%20snapshot-lightgrey)
![TypeScript](https://img.shields.io/badge/TypeScript-compile%20pass-brightgreen)

# EntheoGen — plant medicine interaction guide

**Evidence-grounded, deterministic interaction readouts for intentional psychedelic contexts.**

Live demos: [New Psychonaut](https://www.entheogen.newpsychonaut.com/) · [Azure](https://entheogen.azurewebsites.net)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## Important
# Important!

EntheoGen does **not** provide clinical medical advice.

For expert harm-reduction guidance, consult a qualified medical professional.

# What is EntheoGen?

EntheoGen is a substance interaction guidance app focussed on intentional use of psychedelics. 

The web application estimates the effects of mixing the two substances entered into the drop-down menus. 

Data is personal and not stored remotely (i.e., not recorded or held by us). 

EntheoGen's data model is mapped specifically to sacramental substances often used in psychedelic ceremonies, pharmaceutical medications, and commonly used consciousness-altering substances.

# Why EntheoGen is different:

- Ceremonial-context interaction coverage for plant-medicine and psychedelic use cases
- Deterministic interaction rules and static app data snapshots
- Evidence status, confidence, mechanism, and source-link metadata in the dataset
- Human review before proposed evidence changes are treated as publication-ready
- Local validation scripts for knowledge-base and interaction-dataset changes
- Privacy-first app behavior: substance selections are not stored remotely by the app

⸻

## EntheoGen v3 — Impact Statement

Transitions from a static dataset to a **strictly evidence-gated knowledge system**

Enforces **human-reviewed, citation-backed claims** before any interaction is linked

Introduces **deterministic validation + transparent audit pipelines** (no silent failures)

Separates **mechanistic inference from verified evidence** to preserve harm-reduction integrity

Establishes a foundation for **clinically and ceremonially credible interaction intelligence**

[Full version release notes and more in project wiki](https://github.com/chaosste/EntheoGen/wiki).

# We need YOUR entheogenic knowledge

Unlike generative AI tools, EntheoGen interaction classifications remain strictly rule-based and evidence-grounded.

Academic literature is still sparse in some areas of plant-medicine interaction pharmacology.

EntheoGen is **educational**, not clinical advice. For harm reduction and medical decisions, consult a qualified professional.

---

## What this version is

**Beta‑0‑1 (app)** still ships as **static JSON** built from curated CSVs—no live database required for the public interaction guide. See [Beta‑0‑1 release notes (wiki)](https://github.com/chaosste/EntheoGen/wiki/EntheoGen-Beta%E2%80%900%E2%80%901).

**Since that baseline**, the repo has gained clearer **automation and data-operation docs**, optional **Supabase Phase 1** alignment for analytics and exports (not a runtime dependency for the SPA), and operational notes for **parallel programmes** (e.g. private beta launch) without changing the core “snapshot in, UI out” contract.

---

## Data flow (unchanged core)

| Artifact | Role |
|----------|------|
| `interactions.csv`, `substances.csv` | Workspace inputs for regeneration |
| `npm run dataset:build-beta -- .` | Builds `src/data/substances_snapshot.json`, `src/exports/interaction_pairs.json` |
| `src/data/uiInteractions.ts` | Adapter to `UIInteraction` for the UI |

After CSV edits, rebuild snapshots and commit JSON before you treat a branch as release-ready.

---
# Tech Stack
| Layer | Technology Frontend |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Risk Engine | Deterministic pharmacological rule engine |
| Dataset Pipeline | Node + TypeScript ingestion, validation, and migration scripts |
| Verification | TypeScript, knowledge-base validation, interaction validation, adapter regression checks |
| AI | Google Gemini API (explanatory summarization only) |
| Design | Tailwind CSS, Lucide Icons |
| Deployment | Vite build output; Cloudflare config in `wrangler.jsonc`; Azure workflow in `.github/workflows/azure-deploy.yml` |

## Developer quickstart

```bash
npm install
npm run dataset:build-beta -- .
npm run typecheck
npm test
npm run dev
```

## Verification commands

Build:
```
npm run build
```
Broader CI-style gate: npm run ci:checks (see docs/automation/QUALITY_AND_RELIABILITY.md).

## Where to read more

| Topic | Doc |
|----------|------|
| **Supabase: install `interactions_enriched` view (paste in SQL Editor)** | **docs/metabase/supabase-install-interactions-enriched-view.sql** |
| Automation roles and safety | docs/automation/AUTOMATION_AGENTS.md, docs/automation/AGENT_AND_SAFETY_OUTPUTS.md |
| Intake and submissions | docs/automation/INTAKE_AND_INTEGRATION.md, docs/automation/SUBMISSION_HOW_TO.md |
| Backend / data foundations | docs/automation/BACKEND_AND_DATA_FOUNDATIONS.md |
| Repo layout | docs/REPO_LAYOUT.md |
| Private student beta (ops) | docs/private-student-beta/README.md |
| Contributor / agent rules | AGENTS.md |
Typecheck:
```
npm run lint
```

Knowledge-base and interaction validation:
```
npm test
```

Targeted knowledge-base script checks:
```
npm run kb:test
```

Wiki and discussions
[Project wiki](https://github.com/chaosste/EntheoGen/wiki) — release notes and narrative history
[Discussions](https://github.com/chaosste/EntheoGen/discussions/1) — feedback and community input

---
