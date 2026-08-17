import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256 } from "../src/lib/provenance";
import { SnapshotSchema } from "../src/lib/schema";
import { readJson, root } from "./helpers";

describe("offline build inputs and public contract", () => {
  it("has a hash-valid offline snapshot", async () => {
    const snapshot = SnapshotSchema.parse(
      await readJson("data/raw/vibemathed.snapshot.json"),
    );
    expect(snapshot.content_hash).toBe(sha256(snapshot.dataset));
  });

  it("generates all static feeds with metadata and build ids", async () => {
    for (const file of [
      "index",
      "latest",
      "replay-ready",
      "problems",
      "events",
    ]) {
      const feed = await readJson<Record<string, unknown>>(
        `public/api/v1/${file}.json`,
      );
      expect(feed.schema_version).toBe("1.0.0");
      expect(feed.license).toBe("CC BY 4.0");
      expect(feed.generated_at).toBeTruthy();
      expect(feed.build_id).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });

  it("keeps the public independence and bilingual core contracts", async () => {
    const en = await readFile(resolve(root, "README.md"), "utf8");
    const zh = await readFile(resolve(root, "README.zh-CN.md"), "utf8");
    expect(en).toContain(
      "VibeMath is an independent open-source project. It is not affiliated with VibeMathed or BlinkDL/VibeMath.",
    );
    expect(zh).toContain(
      "VibeMath 是独立开源项目，与 VibeMathed 及 BlinkDL/VibeMath 无隶属或官方合作关系。",
    );
    for (const heading of [
      "Replay-ready",
      "Low-Hanging Fruit",
      "JSON API",
      "Agent Skill",
      "MCP",
    ])
      expect(en).toContain(heading);
    for (const heading of [
      "Replay-ready",
      "Low-Hanging Fruit",
      "JSON API",
      "Agent Skill",
      "MCP",
    ])
      expect(zh).toContain(heading);
    expect(en).not.toMatch(/VibeMath is affiliated with VibeMathed/i);
  });

  it("contains no external executable asset or token-printing script", async () => {
    const packageJson = await readFile(resolve(root, "package.json"), "utf8");
    expect(packageJson).not.toMatch(/curl\s|wget\s|printenv|process\.env\s*\)/);
    await expect(
      stat(resolve(root, "data/raw/vibemathed.snapshot.json")),
    ).resolves.toBeDefined();
  });
});
