import {
  VibeMathedDatasetSchema,
  type VibeMathedDataset,
} from "../src/lib/schema";
import type { AdapterResult, SourceAdapter } from "./base";

export const VIBEMATHED_DATASET_URL = "https://vibemathed.com/api/dataset";
export const VIBEMATHED_USER_AGENT =
  "VibeMath/0.0.1 (+https://github.com/cyanseek/VibeMath; read-only dataset sync)";

export class VibeMathedAdapter implements SourceAdapter<VibeMathedDataset> {
  readonly id = "vibemathed";
  readonly sourceUrl = VIBEMATHED_DATASET_URL;

  constructor(
    private readonly fetcher: typeof fetch = fetch,
    private readonly timeoutMs = 15_000,
  ) {}

  async fetch(): Promise<AdapterResult<VibeMathedDataset>> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await this.fetcher(this.sourceUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": VIBEMATHED_USER_AGENT,
          },
          signal: AbortSignal.timeout(this.timeoutMs),
          redirect: "follow",
        });
        if (!response.ok)
          throw new Error(`VibeMathed returned HTTP ${response.status}`);
        const parsed = VibeMathedDatasetSchema.parse(await response.json());
        return {
          data: parsed,
          retrievedAt: new Date().toISOString(),
          sourceUrl: this.sourceUrl,
        };
      } catch (error) {
        lastError = error;
        if (attempt === 0)
          await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
    throw new Error("VibeMathed sync failed after one retry", {
      cause: lastError,
    });
  }
}
