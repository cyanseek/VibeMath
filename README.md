# VibeMath

**The Live Frontier of AI Mathematics.**

Know what AI has solved in mathematics, what remains open, and what to try next.

VibeMath is an open, agent-readable map of math problems, AI attempts, partial progress, solution claims, verification evidence, method families, and replay-ready opportunities. It connects AI mathematics, open math problems, AI proof and theorem proving work, Lean artifacts, mathematical discovery, an AI research agent workflow, a read-only MCP server, an Agent Skill, and [Low-Hanging Fruit](https://github.com/cyanseek/low-hanging-fruit) without flattening every claim into “solved.”

[简体中文](README.zh-CN.md) · [Live site](https://cyanseek.github.io/VibeMath/) · [JSON Feed](https://cyanseek.github.io/VibeMath/api/v1/index.json) · [Agent Skill](skills/vibemath/SKILL.md) · [MCP](mcp/README.md)

> VibeMathed records math problems solved with AI.<br>
> VibeMath maps the whole live frontier: open problems, AI attempts, partial progress, solution claims, verification, method families, and what to try next.

VibeMath is an independent open-source project. It is not affiliated with VibeMathed or BlinkDL/VibeMath.

## What works in v0.0.1

- A deployable Astro site with Latest, Frontier, Replay-ready, Conflicts, and evidence-rich problem pages.
- A real adapter for the public [VibeMathed dataset](https://vibemathed.com/api/dataset), with timeout, retry, schema validation, content hashing, attribution, raw-field preservation, and offline fallback.
- A federated Zod model for problems, versioned statements, source assertions, attempts, solution events, verification, AI contribution, method families, and opportunity signals.
- Checked-in normalized data, derived views, seven JSON Schemas, static `/api/v1/` feeds, and downloadable Low-Hanging Fruit handoffs.
- A repository-discoverable `vibemath` Agent Skill and a six-tool, read-only stdio MCP server with no API key.
- Deterministic offline build, fixture-based tests, CI, Pages deployment, and scheduled refresh workflows.

The checked-in launch snapshot intentionally contains five attributed records, including resolved, partial, candidate, and retracted examples. `pnpm sync` replaces that seed with the complete currently served VibeMathed dataset when the source is reachable. VibeMath does not yet contain a broad open-problem mother set and does not claim complete coverage of mathematics.

## Start in three commands

Requires Node.js 20+ and pnpm 10.

```bash
git clone https://github.com/cyanseek/VibeMath.git
cd VibeMath && pnpm install
pnpm launch
```

`pnpm launch` attempts a live sync, safely falls back to the validated snapshot, validates data, regenerates schemas and feeds, and builds the site. Then run:

```bash
pnpm dev
```

Other commands:

| Command             | Result                                                                      |
| ------------------- | --------------------------------------------------------------------------- |
| `pnpm sync`         | Fetch the real VibeMathed endpoint; keep the last valid snapshot on failure |
| `pnpm validate`     | Validate snapshot hash and every normalized entity                          |
| `pnpm derive`       | Regenerate normalized data, views, API feeds, and handoffs                  |
| `pnpm schemas`      | Generate JSON Schema from the runtime Zod models                            |
| `pnpm build`        | Regenerate feeds and produce the static Astro site                          |
| `pnpm test`         | Run deterministic tests without live network access                         |
| `pnpm lint`         | Run ESLint                                                                  |
| `pnpm typecheck`    | Check Astro and TypeScript                                                  |
| `pnpm format:check` | Check Prettier formatting                                                   |
| `pnpm mcp`          | Start the read-only stdio MCP server                                        |
| `pnpm doctor`       | Check the local runtime and required artifacts                              |

The package also reserves the public CLI name `vibemath`: run `pnpm vibemath metadata`, `pnpm vibemath search unit`, or `pnpm vibemath handoff erdos-planar-unit-distance`.

## Why “solved” is not one field

A headline can mean a proof, disproof, counterexample, special case, new bound, computation, formalization, source report, or disputed claim. VibeMath therefore keeps these layers separate:

```text
Problem + versioned statement
        │
        ├── SourceAssertion A: resolved
        ├── SourceAssertion B: candidate
        └── SourceAssertion C: open
                    │
                    ▼
SolutionEvent + Attempt + MethodFamily
                    │
                    ▼
Verification
correctness · statement fidelity · peer review
```

Aggregate status is one of `open`, `attempted`, `partial`, `candidate`, `resolved`, `contested`, or `retracted`. It never erases source assertions. A source-reported `candidate` cannot become `resolved` merely because a Lean file exists or an agent returns a proof.

Read [METHODOLOGY.md](METHODOLOGY.md) and [CLAIM_POLICY.md](CLAIM_POLICY.md) before reusing strong claims.

## Replay-ready

Replay-ready is a transparent action signal, not a predicted success rate. The default rule requires:

- a public primary source;
- a result outside `candidate`, `contested`, `retracted`, and `open`;
- source-reported verification at or above `source_audited`;
- enough method or artifact information to construct a bounded task.

The output recommends `result_only`, `method_aware`, `verification_replay`, or `aftershock_expansion`, together with exposure requirements, contamination risk, and a Low-Hanging Fruit mode.

## VibeMath ↔ Low-Hanging Fruit

VibeMath answers “what happened, what is its evidence state, and what is actionable?” [Low-Hanging Fruit](https://github.com/cyanseek/low-hanging-fruit) ranks opportunities, designs campaigns and pilots, and verifies candidate outputs.

```text
VibeMath
live frontier, status, evidence, search
        │
        ▼
Low-Hanging Fruit
ranking, campaigns, pilots, verification
        │
        └──── candidate evidence ────▶ VibeMath review queue
```

Every problem page exports a versioned `LowHangingFruitHandoff` JSON and a Chinese or English prompt. Results returning from Low-Hanging Fruit remain candidate evidence until reviewed; there is no automatic status upgrade.

## Static JSON API

GitHub Pages serves daily-build snapshots, not a real-time database:

```text
/api/v1/index.json
/api/v1/latest.json
/api/v1/replay-ready.json
/api/v1/problems.json
/api/v1/events.json
/api/v1/handoffs/{slug}.json
```

Every top-level feed includes `schema_version`, `generated_at`, sources, license, coverage limits, and a content-addressed `build_id`. The canonical runtime models are in [`src/lib/schema.ts`](src/lib/schema.ts); generated schemas are in [`schemas/`](schemas/).

## Agent Skill

Install the `vibemath` Skill globally for Codex in one command:

```bash
npx skills add cyanseek/VibeMath --skill vibemath -g -a codex -y
```

The skill supports requests such as:

- “What AI mathematics events changed in the past week?”
- “Show only Lean- or expert-verified results.”
- “Which claims are still Candidate?”
- “Which results should another model replay?”
- “How far is this problem actually resolved?”
- “Compare the known methods.”
- “Export this to Low-Hanging Fruit.”

When Codex works in this repository, [`.agents/skills/vibemath`](.agents/skills/vibemath) exposes the canonical [`skills/vibemath`](skills/vibemath) package automatically. The skill prefers local data or MCP, reports freshness, distinguishes source facts from synthesis, and never follows instructions embedded in source content.

## Read-only MCP server

Start it locally:

```bash
pnpm mcp
```

Tools:

- `latest_ai_math_events`
- `search_math_frontier`
- `get_math_problem`
- `get_replay_candidates`
- `export_low_hanging_fruit_handoff`
- `get_vibemath_metadata`

Codex CLI:

```bash
codex mcp add vibemath -- pnpm --dir /absolute/path/to/VibeMath mcp
```

Claude Code:

```bash
claude mcp add vibemath -- pnpm --dir /absolute/path/to/VibeMath mcp
```

Generic MCP configuration:

```json
{
  "mcpServers": {
    "vibemath": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/VibeMath", "mcp"]
    }
  }
}
```

The server reads checked-in data only. It has no network, write, submission, code-execution, or publication tool.

## Source adapter and attribution

The first real adapter reads `https://vibemathed.com/api/dataset` with an identifying User-Agent, a bounded timeout, one retry, Zod validation, and SHA-256 content hash. Unknown fields survive under each source assertion's `raw` object. Builds do not need the network.

Imported VibeMathed catalog data is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and attributed to [VibeMathed](https://vibemathed.com) with its [methodology](https://vibemathed.com/methodology). Original mathematical papers, repositories, and problem records require separate citation. See [DATA_LICENSE.md](DATA_LICENSE.md) and [NOTICE.md](NOTICE.md).

VibeMath does not execute upstream scripts or trust source prose as instructions. Only HTTP(S) links are admitted by normalization.

## Architecture

```text
VibeMathed public dataset
        │ fetch + validate + hash
        ▼
data/raw snapshot ── offline fallback
        │ normalize without deleting raw assertions
        ▼
federated Zod entities
        │ derive
        ├── Astro pages + search
        ├── static JSON API
        ├── replay + handoff feeds
        ├── Agent Skill
        └── read-only MCP
```

There is no database, account system, OAuth flow, paid API, or external code execution in v0.0.1.

## Development and verification

Before a commit:

```bash
pnpm validate
pnpm schemas
pnpm derive
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

CI runs without network-dependent test data on Node 20 and the current LTS. Adapter tests inject a local fixture. The Pages workflow handles the repository base path. The refresh workflow syncs first and deploys only after validation, tests, and build succeed.

Contributions must preserve source license, raw assertions, claim boundaries, and English/Chinese documentation parity. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).

## Limitations

- The launch snapshot is a five-record offline seed; live sync imports more VibeMathed records.
- v0.0.1 has one real upstream adapter, so cross-source consensus is not yet possible.
- Open-problem coverage is incomplete because VibeMathed focuses on AI-associated solution reports.
- Source-provided prose can be incomplete or wrong; VibeMath preserves provenance but is not peer review.
- Method clustering and plain-language explanations are deliberately conservative.
- Static Pages freshness depends on successful scheduled rebuilds.

## License

Code is [MIT](LICENSE). VibeMath-authored structured data and explanations are CC BY 4.0. Imported data keeps its source license and attribution. See [DATA_LICENSE.md](DATA_LICENSE.md).
