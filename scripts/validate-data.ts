import { normalizeSnapshot } from "../src/lib/normalize";
import { sha256 } from "../src/lib/provenance";
import { deriveReplayCandidates } from "../src/lib/replay";
import {
  AttemptSchema,
  MethodFamilySchema,
  OpportunitySignalSchema,
  ProblemSchema,
  ProblemVersionSchema,
  SnapshotSchema,
  SolutionEventSchema,
  SourceAssertionSchema,
  VerificationSchema,
  type Snapshot,
} from "../src/lib/schema";
import { readJson } from "./io";

async function main() {
  const snapshot = SnapshotSchema.parse(
    await readJson<Snapshot>("data/raw/vibemathed.snapshot.json"),
  );
  if (snapshot.content_hash !== sha256(snapshot.dataset)) {
    throw new Error(
      "Snapshot content_hash does not match the embedded dataset.",
    );
  }
  const data = normalizeSnapshot(snapshot);
  const checks = [
    [ProblemSchema, data.problems],
    [ProblemVersionSchema, data.problemVersions],
    [SourceAssertionSchema, data.sourceAssertions],
    [AttemptSchema, data.attempts],
    [SolutionEventSchema, data.solutionEvents],
    [VerificationSchema, data.verifications],
    [MethodFamilySchema, data.methodFamilies],
    [OpportunitySignalSchema, data.opportunitySignals],
  ] as const;
  for (const [schema, records] of checks)
    for (const record of records) schema.parse(record);
  deriveReplayCandidates(data);
  console.log(
    `Validated snapshot and ${data.problems.length} normalized problems.`,
  );
}

await main();
