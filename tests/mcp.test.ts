import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createVibeMathServer } from "../mcp/create-server";
import {
  exportLowHangingFruitHandoff,
  getMathProblem,
  getReplayCandidates,
  getVibeMathMetadata,
  latestAiMathEvents,
  loadLocalStore,
  searchMathFrontier,
} from "../mcp/tools";

describe("MCP query functions", () => {
  it("completes a real MCP handshake and exposes exactly six read-only tools", async () => {
    const store = await loadLocalStore();
    const server = createVibeMathServer(store);
    const client = new Client({ name: "vibemath-test", version: "0.0.1" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
    const listed = await client.listTools();
    expect(listed.tools.map((tool) => tool.name).sort()).toEqual(
      [
        "export_low_hanging_fruit_handoff",
        "get_math_problem",
        "get_replay_candidates",
        "get_vibemath_metadata",
        "latest_ai_math_events",
        "search_math_frontier",
      ].sort(),
    );
    const result = await client.callTool({
      name: "get_vibemath_metadata",
      arguments: {},
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toBeDefined();
    await client.close();
    await server.close();
  });

  it("returns all six expected result shapes from local data", async () => {
    const store = await loadLocalStore();
    expect(Array.isArray(latestAiMathEvents(store, { days: 3650 }))).toBe(true);
    expect(Array.isArray(searchMathFrontier(store, { query: "unit" }))).toBe(
      true,
    );
    expect(
      getMathProblem(store, "erdos-planar-unit-distance")?.problem.slug,
    ).toBe("erdos-planar-unit-distance");
    expect(Array.isArray(getReplayCandidates(store, { days: 3650 }))).toBe(
      true,
    );
    expect(
      exportLowHangingFruitHandoff(store, "erdos-planar-unit-distance").source,
    ).toBe("vibemath");
    expect(getVibeMathMetadata(store).read_only).toBe(true);
  });

  it("caps search and event results at 100", async () => {
    const store = await loadLocalStore();
    const repeated = Array.from({ length: 150 }, (_, index) => ({
      ...store.data.problems[0]!,
      id: `repeat:${index}`,
      slug: `repeat-${index}`,
    }));
    store.data.problems = repeated;
    expect(searchMathFrontier(store, { limit: 1000 })).toHaveLength(100);
  });
});
