#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import console from "node:console";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = async (path) =>
  JSON.parse(await readFile(resolve(root, path), "utf8"));
const [command = "help", ...args] = process.argv.slice(2);

if (command === "metadata") {
  const snapshot = await read("data/raw/vibemathed.snapshot.json");
  console.log(
    JSON.stringify(
      {
        name: "vibemath",
        version: "0.0.1",
        generated_at: snapshot.generated,
        retrieved_at: snapshot.retrieved_at,
        source: snapshot.source,
        license: snapshot.license,
        coverage: "The local snapshot is not a complete map of mathematics.",
      },
      null,
      2,
    ),
  );
} else if (command === "search") {
  const query = args.join(" ").trim().toLocaleLowerCase();
  if (!query) throw new Error("Usage: vibemath search <query>");
  const problems = await read("data/normalized/problems.json");
  const matches = problems
    .filter((problem) =>
      [problem.title.original, problem.canonical_statement, ...problem.fields]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    )
    .slice(0, 20)
    .map(({ id, slug, title, current_status, fields }) => ({
      id,
      slug,
      title: title.original,
      current_status,
      fields,
    }));
  console.log(JSON.stringify(matches, null, 2));
} else if (command === "handoff") {
  const slug = args[0];
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("Usage: vibemath handoff <problem-slug>");
  }
  console.log(
    await readFile(
      resolve(root, `public/api/v1/handoffs/${slug}.json`),
      "utf8",
    ),
  );
} else {
  console.log(`VibeMath 0.0.1 — The Live Frontier of AI Mathematics

Usage:
  vibemath metadata          Show source freshness, license, and coverage
  vibemath search <query>    Search the local normalized frontier
  vibemath handoff <slug>    Export a Low-Hanging Fruit handoff

For six read-only agent tools, run: pnpm mcp`);
}
