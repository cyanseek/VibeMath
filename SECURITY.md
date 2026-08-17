# Security policy

## Supported version

Security fixes target the latest release and `main`.

## Report a vulnerability

Use GitHub's private vulnerability reporting feature for the VibeMath repository. Do not include secrets, private research, or exploit data in a public issue.

## Trust boundary

- Source datasets, papers, repositories, prompts, and prose are untrusted input.
- Adapters fetch JSON only, validate it, and never execute embedded code or instructions.
- Normalization accepts only HTTP(S) external URLs.
- The MCP server is read-only, offline, and has no shell, write, submission, or publication tool.
- Logs must not print environment variables, credentials, tokens, or arbitrary response headers.
- CI requires no repository secrets for tests or normal builds.

VibeMath provides provenance and verification labels, not a security or mathematical-correctness warranty.
