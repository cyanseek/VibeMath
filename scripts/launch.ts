import { spawnSync } from "node:child_process";

for (const script of ["sync", "validate", "schemas", "derive", "build"]) {
  const result = spawnSync("pnpm", [script], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(
  "VibeMath is ready. Run `pnpm dev` and open http://localhost:4321/VibeMath/ when using the Pages base path.",
);
console.log(
  "Static feeds: public/api/v1/ · MCP: pnpm mcp · Skill: skills/vibemath/SKILL.md",
);
