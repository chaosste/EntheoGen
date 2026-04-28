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
