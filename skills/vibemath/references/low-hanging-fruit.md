# Low-Hanging Fruit handoff

Export with MCP tool `export_low_hanging_fruit_handoff` or download `/api/v1/handoffs/{slug}.json`.

The handoff includes the exact statement, current status, source-reported events and attempts, verifications, sources, recommended mode/exposure, signals, and uncertainty. Recommended modes:

- `replay`: reproduce a reported result under controlled exposure.
- `verify`: audit correctness, statement fidelity, certificates, or source claims.
- `expand`: test variants, boundaries, aftershocks, or open remainder after partial progress.

Any output returning from Low-Hanging Fruit is candidate evidence. It must enter a VibeMath review queue as a new source assertion; it never auto-upgrades aggregate status.
