<div align="center">
	
<!-- BADGES:START -->
![Schema Version](https://img.shields.io/badge/schema-v2.2.0-blue)
![Interactions](https://img.shields.io/badge/interactions-708-informational)
![Substances](https://img.shields.io/badge/substances-52-informational)
![Validation](https://img.shields.io/badge/validation-strict-brightgreen)
![Build](https://img.shields.io/badge/typescript-compile%20pass-brightgreen)
![Status](https://img.shields.io/badge/status-evidence%20gated-orange)
![Evidence Gate](https://img.shields.io/badge/evidence-gated-red)
![Review Pipeline](https://img.shields.io/badge/review-human--in--loop-blue)
![Claims Status](https://img.shields.io/badge/claims-pending%20enriched-yellow)
![Linking](https://img.shields.io/badge/linking-awaiting%20review-lightgrey)
![Provenance](https://img.shields.io/badge/provenance-citation%20required-blue)
![Sources](https://img.shields.io/badge/sources-peer--review%20preferred-green)
![Uncertainty](https://img.shields.io/badge/uncertainty-explicit-lightgrey)
![Inference](https://img.shields.io/badge/inference-mechanistic-yellow)
![Harm Reduction](https://img.shields.io/badge/harm--reduction-primary-critical)
![Clinical Risk](https://img.shields.io/badge/risk-modelled-important)
![Serotonin Toxicity](https://img.shields.io/badge/focus-serotonergic%20interactions-purple)
![Data Model](https://img.shields.io/badge/model-knowledge%20graph-purple)
![Deterministic](https://img.shields.io/badge/deterministic-enforced-blue)
![Pair Matching](https://img.shields.io/badge/pair--matching-normalized-success)
![Review Status](https://img.shields.io/badge/review-in%20progress-yellow)
![Evidence Coverage](https://img.shields.io/badge/evidence-expanding-blue)
![Knowledge State](https://img.shields.io/badge/state-validated%20%7C%20awaiting%20review-blueviolet)
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

⚙️ Ceremonial-context interaction coverage — models sacramental psychedelic use scenarios

⚙️ Deterministic pharmacological rule engine — reproducible outputs

🛡️ Strict safety posture — missing evidence resolves to Unknown, never speculation

🔍 Source traceability — outputs include confidence and mechanism metadata

🧠 Alignment-aware dataset design — explicit abstention class for hallucination benchmarking

🧪 Mechanism-level labeling — structured taxonomy for causal and ontology research

📊 Slice-based benchmarking infrastructure — evaluate reasoning by mechanism and severity

📦 HuggingFace-ready dataset packaging

🔁 Regression safeguards — detect silent dataset drift

🧱 Local evaluation harness — oracle baseline + leaderboard pipeline

💾 Privacy-first architecture — no remote storage of user inputs

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

# Tech Stack
| Layer | Technology Frontend |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| Risk Engine | Deterministic pharmacological rule engine |
| Dataset Pipeline | Node + TypeScript export tooling |
| Evaluation Harness | Local fixture/scoring framework |
| AI | Google Gemini API (explanatory summarization only) |
| Design | Tailwind CSS, Lucide Icons |
| Deployment | Azure App Service (Linux, Node 22) |

# Quickstart
```
git clone https://github.com/chaosste/EntheoGen.git
cd EntheoGen

npm install
npm run dev
```
Build:
```
npm run build
```

Export dataset:
```
npm run export:interactions
```

Run evaluation harness:
```
npm run eval:fixtures
npm run eval:oracle
```

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
