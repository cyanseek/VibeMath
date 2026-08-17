# Methodology

## Scope

VibeMath indexes a live frontier: problems, attempts, partial results, solution claims, verification evidence, method families, and actionable follow-ups. v0.0.1 has one real upstream adapter and therefore cannot establish a complete open-problem universe or cross-source consensus.

## Evidence model

`Problem` is a canonical identity. `ProblemVersion` fixes the statement text, assumptions, quantifiers, source, and effective time. A `SourceAssertion` stores exactly what one source reports, including raw and normalized fields, evidence, confidence, license, timestamps, and hash.

`SolutionEvent.type` describes what reportedly happened; it is not the status. `Attempt` records model, provider, collaborators, exposure, prompt availability, outcome, artifacts, cost, and independence only when public data supports them. Unknown values remain unknown. `MethodFamily` is evidence-backed and may remain unclassified.

## Aggregation

Statuses are `open`, `attempted`, `partial`, `candidate`, `resolved`, `contested`, and `retracted`. Adapter mapping is deterministic and tested. Candidate is never mapped to resolved. When multiple sources arrive, their assertions remain separate. A future aggregation policy may prefer stronger or newer evidence, but it may not delete disagreement.

The current status confidence describes confidence that the aggregate reflects the indexed assertions; it is not a probability that a theorem is true.

## Verification

The controlled vocabulary is:

1. `unreviewed`
2. `source_audited`
3. `site_reproduced`
4. `mechanically_verified`
5. `lean_checked_statement_unaudited`
6. `lean_verified_statement_audited`
7. `independent_expert_verified`
8. `peer_reviewed`
9. `contested`
10. `rejected`

This is not treated as one universal ladder. Each verification also records mathematical-correctness support, statement fidelity, and peer-review state. A Lean kernel check cannot by itself show that the formal theorem matches the original informal problem.

## Replay-ready rule

An event is a default candidate only when it:

- is not candidate, contested, retracted, or open;
- has a public primary mathematical source;
- meets the configured verification floor, normally `source_audited`;
- provides enough source material to construct a bounded replay.

The rule emits a replay type, reason, required exposure, contamination risks, suggested Low-Hanging Fruit mode, verification level, and event date. It does not estimate model success or require a shorter proof or fewer assumptions.

## Plain-language explanations

The launch release does not call a paid model. When no independent explanation exists, a template explicitly says the source-reported status and that VibeMath has not authored an independent mathematical explanation. Source role and verification notes remain attributed.

## Sync and reproducibility

`pnpm sync` identifies itself, times out, retries once, validates the full response, computes a stable SHA-256 content hash, and atomically replaces the snapshot. If the source is unavailable, the last validated snapshot remains in place. Fixture tests never use the network. `pnpm derive` deterministically derives all normalized and public artifacts from snapshot timestamps.
