# VibeMath MCP

Read-only stdio MCP over the checked-in VibeMath snapshot. It has six tools and no network, write, publication, or external-execution capability.

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

The same entry works in clients using the common `mcpServers` format, including Claude Code. In Codex, add an equivalent stdio server named `vibemath` using `pnpm --dir /absolute/path/to/VibeMath mcp`. Run `pnpm derive` after changing a snapshot.
