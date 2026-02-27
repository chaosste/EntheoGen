<div align="center">

# 🌿 EntheoGen Mixed Modality Guide

**Ceremonial Psychedelic Interaction Guidance**

*Evidence-grounded risk engine and strict safety posture for pre-reflective exploration*

**Live demo:** [www.entheogen.newpsychonaut.com](https://www.entheogen.newpsychonaut.com/) · [entheogen.azurewebsites.net](https://entheogen.azurewebsites.net)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<img src="docs/assets/entheogen-release-screen-1.png" width="900" alt="EntheoGen release interface screenshot" />

<img src="docs/assets/entheogen-release-demo.gif" width="900" alt="EntheoGen release demo" />

</div>

---

## What it is

EntheoGen Mixed Modality Guide (formerly NTT) is a ceremonial psychedelic interaction guidance app adapted from SeshGuard. Taking a rigorous approach to harm reduction, EntheoGen’s data model is mapped specifically to ceremonial substances and medication classes.

Unlike purely generative AI tools, the interaction output here is strictly evidence-grounded and rule-based. It offers explicit confidence ratings and transparent source traceability. If pharmacological evidence is missing, the engine strictly returns `Unknown` rather than generating speculative predictions.
## Why it is different

- ⚙️ **Evidence-Grounded Risk Engine** — deterministic output based on curated pharmacological rules
- 🛡️ **Strict Safety Posture** — missing-data pairs explicitly resolve to `UNK` (Unknown) rather than guessing
- 🔍 **Source Traceability** — readouts expose confidence and evidentiary source metadata
- 💾 **Privacy Focused** — favorites are stored in local browser storage; hosting/CDN logs may still exist
- 🖤 **Minimalist & Accessible** — clean UI with distinguishable risk levels and non-prescriptive language

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Risk Engine | Deterministic rule-based assessor |
| AI | Google Gemini API (explanatory summarization only) |
| Design | Tailwind CSS, Lucide Icons |
| Deployment | Azure App Service (Linux) |

## Quickstart

```bash
# Clone the repository
git clone https://github.com/chaosste/EntheoGen.git
cd EntheoGen

# Install dependencies
npm install

# Configure Gemini API key for explanatory text features
cp .env.example .env.local
# set GEMINI_API_KEY in .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## Related Projects

- [SeshGuard](https://github.com/chaosste/SeshGuard) — broader interaction safety checker
- [NeuroPhenom-AI](https://github.com/chaosste/NeuroPhenom-AI) — high-fidelity clinical interface for diachronic slicing and subjective reporting
- [Anubis](https://github.com/chaosste/Anubis) — psychedelic trip-report interview system

## Safety Posture & Disclaimer

EntheoGen provides educational harm-reduction guidance only. It is **not** a substitute for professional medical, psychological, or therapeutic advice. If there is no explicit evidence for an interaction combination, EntheoGen classifies it as `Unknown/Insufficient Data`.

In moments of clinical emergency, seek urgent professional medical help.

---

<div align="center">

**Built by [Steve Beale](https://newpsychonaut.com)**

[newpsychonaut.com](https://newpsychonaut.com)

© 2026 Stephen Beale. MIT License.

</div>
