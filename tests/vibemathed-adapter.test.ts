import { describe, expect, it, vi } from "vitest";
import {
  VibeMathedAdapter,
  VIBEMATHED_USER_AGENT,
} from "../adapters/vibemathed";
import { fixtureDataset } from "./helpers";

describe("VibeMathed adapter", () => {
  it("uses explicit headers, parses a fixture, and preserves its license", async () => {
    const dataset = await fixtureDataset();
    const fetcher = vi.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        expect(new Headers(init?.headers).get("User-Agent")).toBe(
          VIBEMATHED_USER_AGENT,
        );
        return new Response(JSON.stringify(dataset), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    ) as unknown as typeof fetch;
    const result = await new VibeMathedAdapter(fetcher, 1000).fetch();
    expect(result.data.problems).toHaveLength(4);
    expect(result.data.license).toContain("CC BY 4.0");
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("retries once after a transient failure", async () => {
    const dataset = await fixtureDataset();
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify(dataset), { status: 200 }),
      ) as typeof fetch;
    await expect(
      new VibeMathedAdapter(fetcher, 1000).fetch(),
    ).resolves.toBeDefined();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
