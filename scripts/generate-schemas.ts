import { z } from "zod";
import {
  AttemptSchema,
  LowHangingFruitHandoffSchema,
  MethodFamilySchema,
  ProblemSchema,
  SolutionEventSchema,
  SourceAssertionSchema,
  VerificationSchema,
} from "../src/lib/schema";
import { writeJson } from "./io";

const schemas = {
  "problem.schema.json": ProblemSchema,
  "source-assertion.schema.json": SourceAssertionSchema,
  "attempt.schema.json": AttemptSchema,
  "solution-event.schema.json": SolutionEventSchema,
  "verification.schema.json": VerificationSchema,
  "method-family.schema.json": MethodFamilySchema,
  "low-hanging-fruit-handoff.schema.json": LowHangingFruitHandoffSchema,
};

for (const [name, schema] of Object.entries(schemas)) {
  await writeJson(
    `schemas/${name}`,
    z.toJSONSchema(schema, { target: "draft-7" }),
  );
}
console.log(`Generated ${Object.keys(schemas).length} JSON Schemas from Zod.`);
