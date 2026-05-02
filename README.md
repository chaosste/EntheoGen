<div align="center">
	
<!-- BADGES:START -->
![Dataset](https://img.shields.io/badge/Dataset-beta--0.1-blue)
![Interactions](https://img.shields.io/badge/Interactions-693-informational)
![Substances](https://img.shields.io/badge/Substances-37-informational)
![App data](https://img.shields.io/badge/App%20data-static%20JSON%20snapshot-lightgrey)
![TypeScript](https://img.shields.io/badge/TypeScript-compile%20pass-brightgreen)
![Checks](https://img.shields.io/badge/Checks-adapter%20%2B%20mapping%20scripts-green)
![KB parallel](https://img.shields.io/badge/KB%20parallel-schema%20v2-blue)
![Review stance](https://img.shields.io/badge/Review%20stance-human--in--loop-orange)
![Use](https://img.shields.io/badge/Use-educational%20%E2%80%94%20not%20clinical%20advice-critical)
<!-- BADGES:END -->
	
# 🌿 EntheoGen Plant Medicine Interaction Guide

**Evidence-Grounded Interaction Engine + Alignment-Aware Comparison Dataset**

*Deterministic pharmacological safety modeling for intentional psychedelic use*

**Live demos:** 

[www.entheogen.newpsychonaut.com](https://www.entheogen.newpsychonaut.com/) 
· 
[www.entheogen.azurewebsites.net](https://entheogen.azurewebsites.net)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

  <img src="docs/assets/entheogen-asset-beta-0.1.gif" width="600" alt="EntheoGen release demo" />
</div>

---

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

Community expertise helps prioritize future rule additions and dataset extensions.

Please leave feedback in [Discussions](https://github.com/chaosste/EntheoGen/discussions/1)

# Beta-0-1 data visualisations

### 28.04.2026

## Class-to-Class Interaction Matrix

![Class-to-Class Interaction Matrix](https://github.com/chaosste/EntheoGen-Dataset-Beta-0-1/blob/main/content_downloads/beta-v-1-0-release-graphs/Class-to-Class%20Interaction%20Matrix-28_04_2026%2C%2017_58_06.png)

## Most Complex Interactions

![Most Complex Interactions (Multi-Mechanism](https://github.com/chaosste/EntheoGen-Dataset-Beta-0-1/blob/main/content_downloads/beta-v-1-0-release-graphs/Most%20Complex%20Interactions%20(Multi-Mechanism)-28_04_2026%2C%2017_58_25.png)

## High-risk interaction rate

![High-risk interaction rate](https://github.com/chaosste/EntheoGen-Dataset-Beta-0-1/blob/main/content_downloads/beta-v-1-0-release-graphs/High-risk%20interaction%20rate-28_04_2026%2C%2017_59_24.png)

## Average Risk per Substance

![Average Risk per Substance](https://github.com/chaosste/EntheoGen-Dataset-Beta-0-1/blob/main/content_downloads/beta-v-1-0-release-graphs/Average%20Risk%20per%20Substance-28_04_2026.png)

## Risk vs Mechanism Diversity per Substance

![Risk vs Mechanism Diversity per Substance](https://github.com/chaosste/EntheoGen-Dataset-Beta-0-1/blob/main/content_downloads/beta-v-1-0-release-graphs/Risk%20vs%20Mechanism%20Diversity%20per%20Substance-28_04_2026%2C%2017_58_34.png)

## Mechanism Category Frequency

![Mechanism Category Frequency](https://github.com/chaosste/EntheoGen-Dataset-Beta-0-1/blob/main/content_downloads/beta-v-1-0-release-graphs/Mechanism%20Category%20Frequency-28_04_2026%2C%2017_58_42.png)

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

# Quickstart
```
git clone https://github.com/chaosste/EntheoGen.git
cd EntheoGen

npm install
npm run dev
```

## Verification commands

Build:
```
npm run build
```

Typecheck:
```
npm run typecheck
```

Knowledge-base and interaction validation:
```
npm test
```

Targeted knowledge-base script checks:
```
npm run kb:test
```

Coverage labels and command mapping are documented in
`docs/testing/TEST_SUITE_MAP.md`.

Related Projects

# SeshGuard — broader interaction safety checker
https://github.com/chaosste/SeshGuard

# NeuroPhenom-AI — diachronic subjective-experience clinical interface
https://github.com/chaosste/NeuroPhenom-AI

# Anubis — psychedelic trip-report interview system
https://github.com/chaosste/Anubis

Safety Posture & Disclaimer

EntheoGen provides educational harm-reduction guidance only.

It is not a substitute for professional medical, psychological, or therapeutic advice.

If no explicit interaction evidence exists, EntheoGen returns:

Unknown / Insufficient Data

In moments of clinical emergency, seek urgent professional medical care.

<div align="center">

Built by Steve Beale
[www.newpsychonaut.com](https://www.newpsychonaut.com/)

© 2026 Stephen Beale · MIT License

</div>
```
