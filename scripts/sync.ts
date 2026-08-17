import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { VibeMathedAdapter } from "../adapters/vibemathed";
import { sha256 } from "../src/lib/provenance";
import { SnapshotSchema } from "../src/lib/schema";
import { ROOT, readJson, writeJson } from "./io";

const snapshotPath = "data/raw/vibemathed.snapshot.json";

async function main() {
  try {
    const result = await new VibeMathedAdapter().fetch();
    const snapshot = SnapshotSchema.parse({
      source: "vibemathed",
      retrieved_at: result.retrievedAt,
      generated: result.data.generated,
      content_hash: sha256(result.data),
      license: result.data.license,
      dataset: result.data,
    });
    await writeJson(snapshotPath, snapshot);
    console.log(
      `Synced ${snapshot.dataset.problems.length} VibeMathed records.`,
    );
  } catch (error) {
    try {
      await access(resolve(ROOT, snapshotPath));
      SnapshotSchema.parse(await readJson(snapshotPath));
      console.warn(
        `Live sync unavailable; retained the last validated snapshot. ${error instanceof Error ? error.message : String(error)}`,
      );
    } catch {
      throw error;
    }
  }
}

await main();
