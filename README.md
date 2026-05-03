<div align="center">

![Dataset](https://img.shields.io/badge/Dataset-beta--0.1-blue)
![Interactions](https://img.shields.io/badge/Interactions-~794-informational)
![Substances](https://img.shields.io/badge/Substances-~41-informational)
![App data](https://img.shields.io/badge/App%20data-static%20JSON%20snapshot-lightgrey)
![TypeScript](https://img.shields.io/badge/TypeScript-compile%20pass-brightgreen)

# EntheoGen — plant medicine interaction guide

**Evidence-grounded, deterministic interaction readouts for intentional psychedelic contexts.**

Live demos: [entheogen.newpsychonaut.com](https://www.entheogen.newpsychonaut.com/) · [Azure](https://entheogen.azurewebsites.net)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
</div>

---

## Important

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

## Developer quickstart

```bash
npm install
npm run dataset:build-beta -- .
npm run typecheck
npm test
```
Broader CI-style gate: npm run ci:checks (see docs/automation/QUALITY_AND_RELIABILITY.md).

## Where to read more

| Topic | Doc |
|----------|------|
| Automation roles and safety | docs/automation/AUTOMATION_AGENTS.md, docs/automation/AGENT_AND_SAFETY_OUTPUTS.md |
| Automation roles and safety | docs/automation/AUTOMATION_AGENTS.md, docs/automation/AGENT_AND_SAFETY_OUTPUTS.md |
| Intake and submissions | docs/automation/INTAKE_AND_INTEGRATION.md, docs/automation/SUBMISSION_HOW_TO.md |
| Backend / data foundations | docs/automation/BACKEND_AND_DATA_FOUNDATIONS.md |
| Repo layout | docs/REPO_LAYOUT.md |
| Private student beta (ops) | docs/private-student-beta/README.md |
| Contributor / agent rules | AGENTS.md |

Wiki and discussions
[Project wiki](https://github.com/chaosste/EntheoGen/wiki) — release notes and narrative history
[Discussions](https://github.com/chaosste/EntheoGen/discussions/1) — feedback and community input

*(Adjust interaction/substance counts and badges to match whatever you ship; current DB-aligned counts are in the low 40s substances and 794 interaction rows.)*

---

### Changelog (after Beta‑0‑1 wiki, **non‑exhaustive**)

Use as a new subsection under the wiki page or under `## Unreleased` in a `CHANGELOG.md`:

```markdown
## After Beta‑0‑1 (wiki 2026-04-28) — repo highlights

### Documentation and governance
- Expanded automation documentation (intake/integration hub, backend and data foundations, quality and CI map, agent and safety outputs).
- Clarified Supabase’s role (Phase 1 analytics / exports) vs static SPA data.
- Added `docs/private-student-beta/` for parallel programme workflow: environments, GitLab guardrails, Linear-first linking, Jira sync policy, and Supabase CSV import notes under `exports/…/README.md`.
- `AGENTS.md` updated with durable workspace facts (e.g. dataset build vs `mechanism_categories`, Cloud Agent repo deps) and contributor preferences.

### Data and curation
- Interaction mechanism / field updates tied to dataset tickets (e.g. NEW-60 / NEW-61).
- `use field_notes and timing_guidance` reflected in pipeline/consumption where applicable.

### Housekeeping
- Continual-learning index and memory-updater–driven `AGENTS.md` refinements.
- Git ignore rules for local Supabase CSV snapshot duplicates under `exports/supabase_*/*.csv`.
- Routine merge / branch sync commits (PRs #15–27 and related).
