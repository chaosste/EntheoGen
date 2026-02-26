# EntheoGen

EntheoGen is a ceremonial psychedelic interaction guidance app adapted from SeshGuard/NTT.

## What changed

- Rebranded to `EntheoGen`.
- Data model remapped to ceremonial interactions and medication classes.
- Interaction output is now evidence-grounded and rule-based (not speculative free-text AI).
- Added explicit confidence and source traceability in pair readouts.
- Added transparent privacy wording (local favorites vs provider/network processing).

## Antigravity Front-End Handover

If Antigravity is taking the UI pass, this is the safe contract to preserve:

1. Keep the risk engine deterministic.
   - `src/data/drugData.ts` and the `getInteractionEvidence()` lookup are the source of truth.
   - Do not replace risk outputs with free-form generated predictions.
2. Keep unknowns explicit.
   - `UNK` is intentional and safer than guessed classifications.
3. Preserve medical-safety language.
   - Avoid wording that implies clinical advice or certainty of outcomes.
4. Preserve privacy honesty.
   - Do not claim absolute non-storage unless infra policy and logs are verified.
5. Keep source traceability visible.
   - `confidence` and `sources` should remain exposed in the readout.

### UI freedom (safe to change)

- Visual identity, layout, animation, iconography, interaction flow, typography.
- Navigation patterns and component structure.
- Color system, as long as risk levels remain visually distinguishable and accessible.

### High-risk pitfalls to avoid

- Making the app sound prescriptive ("this will happen to you").
- Reintroducing speculative combined-effect prose as if it were evidence.
- Hiding uncertainty states (especially `UNK`).
- Dropping urgent-risk guidance for `DAN/UNS` classes.

### Post-design review gate

After Antigravity's redesign, run a functional safety check:

1. Pair selection still resolves via `getInteractionEvidence()`.
2. Ayahuasca + SSRIs still resolves to contraindicated posture.
3. Unknown pairs still resolve to `UNK`.
4. Privacy disclaimer remains transparent.
5. Build passes with `npm run build`.

## Run locally

1. Install dependencies:
   `npm install`
2. Start development:
   `npm run dev`
3. Build:
   `npm run build`

## Data posture

- If evidence is explicit in the curated dataset, EntheoGen returns a concrete risk classification.
- If evidence is missing, EntheoGen returns `Unknown/Insufficient Data` instead of guessing.

## Safety posture

Educational harm-reduction guidance only; not medical advice.
