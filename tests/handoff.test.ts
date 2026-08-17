import { describe, expect, it } from "vitest";
import { buildHandoff, handoffPrompt } from "../src/lib/lhf-handoff";
import { deriveReplayCandidates } from "../src/lib/replay";
import { LowHangingFruitHandoffSchema } from "../src/lib/schema";
import { fixtureNormalized } from "./helpers";

describe("Low-Hanging Fruit handoff", () => {
  it("exports a schema-valid, provenance-preserving package", async () => {
    const data = await fixtureNormalized();
    const handoff = buildHandoff(
      "resolved-item",
      data,
      deriveReplayCandidates(data),
    );
    expect(() => LowHangingFruitHandoffSchema.parse(handoff)).not.toThrow();
    expect(handoff.source).toBe("vibemath");
    expect(
      handoff.sources.some(
        (source) => source.kind === "primary-mathematical-source",
      ),
    ).toBe(true);
    expect(handoff.uncertainties.length).toBeGreaterThan(0);
  });

  it("warns against candidate promotion in both prompts", async () => {
    const data = await fixtureNormalized();
    const handoff = buildHandoff(
      "candidate-item",
      data,
      deriveReplayCandidates(data),
    );
    expect(handoffPrompt(handoff, "en")).toContain("do not auto-upgrade");
    expect(handoffPrompt(handoff, "zh")).toContain("不要自动升级");
  });
});
