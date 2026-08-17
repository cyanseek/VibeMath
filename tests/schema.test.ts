import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  AttemptSchema,
  LowHangingFruitHandoffSchema,
  MethodFamilySchema,
  ProblemSchema,
  SolutionEventSchema,
  SourceAssertionSchema,
  VerificationSchema,
  VibeMathedDatasetSchema,
} from "../src/lib/schema";
import { stableStringify } from "../src/lib/provenance";
import { fixtureDataset, fixtureNormalized, root } from "./helpers";

describe("runtime and published schemas", () => {
  it("parses the VibeMathed fixture and preserves unknown fields", async () => {
    const parsed = VibeMathedDatasetSchema.parse(
      await fixtureDataset(),
    ) as Record<string, unknown>;
    expect(parsed.unknownTopLevel).toBe("preserve me");
    expect(
      (parsed.problems as Array<Record<string, unknown>>)[0]
        ?.unknownProblemField,
    ).toEqual({
      kept: true,
    });
  });

  it("validates every normalized entity", async () => {
    const data = await fixtureNormalized();
    expect(() => ProblemSchema.array().parse(data.problems)).not.toThrow();
    expect(() =>
      SourceAssertionSchema.array().parse(data.sourceAssertions),
    ).not.toThrow();
    expect(() => AttemptSchema.array().parse(data.attempts)).not.toThrow();
    expect(() =>
      SolutionEventSchema.array().parse(data.solutionEvents),
    ).not.toThrow();
    expect(() =>
      VerificationSchema.array().parse(data.verifications),
    ).not.toThrow();
    expect(() =>
      MethodFamilySchema.array().parse(data.methodFamilies),
    ).not.toThrow();
  });

  it("keeps generated JSON Schemas equal to their Zod source", async () => {
    const pairs = [
      ["problem.schema.json", ProblemSchema],
      ["source-assertion.schema.json", SourceAssertionSchema],
      ["attempt.schema.json", AttemptSchema],
      ["solution-event.schema.json", SolutionEventSchema],
      ["verification.schema.json", VerificationSchema],
      ["method-family.schema.json", MethodFamilySchema],
      ["low-hanging-fruit-handoff.schema.json", LowHangingFruitHandoffSchema],
    ] as const;
    for (const [file, schema] of pairs) {
      const checkedIn = JSON.parse(
        await readFile(resolve(root, "schemas", file), "utf8"),
      );
      expect(stableStringify(checkedIn)).toBe(
        stableStringify(z.toJSONSchema(schema, { target: "draft-7" })),
      );
    }
  });
});
