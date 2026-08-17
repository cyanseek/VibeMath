import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeSnapshot } from "../src/lib/normalize";
import { sha256 } from "../src/lib/provenance";
import {
  SnapshotSchema,
  VibeMathedDatasetSchema,
  type Snapshot,
  type VibeMathedDataset,
} from "../src/lib/schema";

export const root = resolve(import.meta.dirname, "..");
export const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(resolve(root, path), "utf8")) as T;

export async function fixtureDataset(): Promise<VibeMathedDataset> {
  return VibeMathedDatasetSchema.parse(
    await readJson("tests/fixtures/vibemathed.dataset.json"),
  );
}

export async function fixtureSnapshot(): Promise<Snapshot> {
  const dataset = await fixtureDataset();
  return SnapshotSchema.parse({
    source: "vibemathed",
    retrieved_at: "2026-08-18T00:00:00.000Z",
    generated: dataset.generated,
    content_hash: sha256(dataset),
    license: dataset.license,
    dataset,
  });
}

export async function fixtureNormalized() {
  return normalizeSnapshot(await fixtureSnapshot());
}
