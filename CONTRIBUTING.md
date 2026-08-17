# Contributing

VibeMath welcomes source adapters, evidence corrections, UI improvements, tests, and documentation. Scientific claims require unusually careful provenance.

## Before changing data

- Link the primary mathematical source and the tracker/source assertion.
- Record the data license and retrieval time.
- Preserve unknown upstream fields in `raw`; do not translate source prose into stronger claims.
- Keep candidate, contested, retracted, and variant states distinct.
- Never execute source code as part of ingestion.

Schema changes require a migration plan, generated JSON Schema update, fixture update, and tests. Update English and Chinese public documentation together.

## Local checks

```bash
pnpm install
pnpm validate
pnpm schemas
pnpm derive
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Tests and normal builds must pass offline. A refresh workflow may use the network only through a reviewed adapter.
