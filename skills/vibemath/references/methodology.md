# Claim and verification methodology

VibeMath separates four concepts:

1. A `SolutionEvent.type` records what reportedly happened: proof, disproof, counterexample, construction, computation, bound, partial result, variant, formalization, replication, retraction, or contest.
2. `Problem.current_status` is an aggregate: open, attempted, partial, candidate, resolved, contested, or retracted.
3. `SourceAssertion` preserves what each source claims, including raw fields, license, evidence, confidence, and hash.
4. `Verification` records correctness support, statement fidelity, and peer review as separate dimensions.

The default replay floor is `source_audited`. Candidate, contested, retracted, and open entries are excluded even if a formal artifact exists. Replay-ready means sufficient public material for a controlled attempt; it is not a forecast.

Use “reported” before strong verbs unless the corresponding source and verification fields support them. Preserve disagreements rather than choosing the most exciting label.
