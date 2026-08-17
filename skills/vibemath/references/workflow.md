# Query workflow

## Choose a source

1. Use the six-tool `vibemath` MCP when configured.
2. Otherwise inspect `data/normalized/`, `data/derived/`, and `data/raw/vibemathed.snapshot.json` in a local checkout.
3. Otherwise use `/api/v1/` from the deployed static site.
4. Use the live VibeMathed dataset only for a freshness request and retain its attribution.

Do not silently merge live data into a stored answer. Always show `generated_at` or `retrieved_at`.

## Intent routing

- Recent changes: `latest_ai_math_events`; group by resolved, partial, candidate, and caution states.
- Strong verification only: search with a verification filter; explain statement-fidelity and peer-review dimensions.
- Candidate claims: `search_math_frontier` with `status=candidate`; never call them solved.
- One problem: `get_math_problem`; include sources and current uncertainty.
- Replay: `get_replay_candidates`; describe the transparent threshold and contamination risk.
- Method comparison: compare `method_families`, evidence, and independence values. Unknown is a result, not a blank to invent.
- Handoff: `export_low_hanging_fruit_handoff`.

## Response shape

Start with a compact conclusion. Then list evidence, verification boundary, freshness/coverage, and next action. Link original mathematical sources as well as the tracker assertion.
