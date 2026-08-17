import { describe, expect, it } from "vitest";
import { deriveReplayCandidates } from "../src/lib/replay";
import { fixtureNormalized } from "./helpers";

describe("replay-ready rule", () => {
  it("accepts a sourced, audited resolved event", async () => {
    const data = await fixtureNormalized();
    const candidates = deriveReplayCandidates(data);
    expect(candidates.map((item) => item.problem_id)).toContain(
      "vibemathed:resolved-item",
    );
  });

  it("excludes candidate and retracted events even with strong labels", async () => {
    const data = await fixtureNormalized();
    const candidates = deriveReplayCandidates(data);
    expect(candidates.map((item) => item.problem_id)).not.toContain(
      "vibemathed:candidate-item",
    );
    expect(candidates.map((item) => item.problem_id)).not.toContain(
      "vibemathed:retracted-item",
    );
  });
});
