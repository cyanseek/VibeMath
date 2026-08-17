# Replay candidate: Erdős's Planar Unit Distance Conjecture

Snapshot date: 2026-08-17. Source coverage: VibeMathed plus the linked primary paper.

## Result boundary

The source reports that the conjectured `n^(1+o(1))` upper bound was disproved by a construction with more than `n^1.014` unit-distance pairs. This does **not** determine the exact maximum number of unit distances among `n` planar points; that broader extremal problem remains open.

- Status: source-reported `resolved` for the stated asymptotic conjecture
- Verification: source-reported `independent_expert_verified`
- AI contribution: source-reported `ai_co_developed`
- Primary source: [Remarks on the disproof of the unit distance conjecture](https://arxiv.org/abs/2605.20695)

## Result-only replay

Expose the exact conjecture, domain, quantifiers, and the fact that a counterexample exists. Withhold the construction and method. Ask for a checkable family beating `n^(1+o(1))`, then audit novelty and training-data contamination.

## Method-aware replay

Expose the construction category and primary paper only after a clean result-only attempt. Require an explicit account of which ideas were newly derived versus recalled.

## Risks

- The public May 2026 result may be present in model training or retrieval.
- “Unit distance conjecture” is easily confused with the still-open exact extremal problem.
- Independent expert verification is a source assertion in VibeMath, not a fresh VibeMath audit.

Download the matching handoff from `examples/low-hanging-fruit-handoff.json` and run Low-Hanging Fruit in replay mode.
