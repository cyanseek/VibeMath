import { describe, expect, it } from "vitest";
import { safeExternalUrl } from "../src/lib/provenance";
import {
  mapAIContribution,
  mapResolution,
  mapVerification,
} from "../src/lib/status";
import { fixtureNormalized } from "./helpers";

describe("normalization", () => {
  it("maps status without promoting candidates", () => {
    expect(mapResolution("resolved")).toBe("resolved");
    expect(mapResolution("partial")).toBe("partial");
    expect(mapResolution("candidate")).toBe("candidate");
    expect(mapResolution("retracted")).toBe("retracted");
  });

  it("maps AI contribution and verification explicitly", () => {
    expect(mapAIContribution("ai-discovered")).toBe("ai_discovered");
    expect(mapAIContribution("ai-co-developed")).toBe("ai_co_developed");
    expect(mapAIContribution("ai-assisted")).toBe("ai_assisted");
    expect(mapVerification("lean-checked")).toBe(
      "lean_checked_statement_unaudited",
    );
    expect(mapVerification("expert-verified")).toBe(
      "independent_expert_verified",
    );
    expect(mapVerification("peer-reviewed")).toBe("peer_reviewed");
  });

  it("keeps provenance, raw unknown fields, and source license", async () => {
    const data = await fixtureNormalized();
    const assertion = data.sourceAssertions[0]!;
    expect(assertion.source_id).toBe("vibemathed");
    expect(assertion.data_license).toBe("CC BY 4.0");
    expect(assertion.raw.unknownProblemField).toEqual({ kept: true });
    expect(assertion.content_hash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("rejects executable URL protocols", () => {
    expect(() => safeExternalUrl("javascript:alert(1)")).toThrow(
      /Unsupported URL/,
    );
    expect(safeExternalUrl("https://example.org/path")).toBe(
      "https://example.org/path",
    );
  });
});
