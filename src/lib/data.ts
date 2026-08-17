import attemptsJson from "../../data/normalized/attempts.json";
import methodsJson from "../../data/normalized/method-families.json";
import signalsJson from "../../data/normalized/opportunity-signals.json";
import problemsJson from "../../data/normalized/problems.json";
import versionsJson from "../../data/normalized/problem-versions.json";
import assertionsJson from "../../data/normalized/source-assertions.json";
import eventsJson from "../../data/normalized/solution-events.json";
import verificationsJson from "../../data/normalized/verifications.json";
import replayJson from "../../data/derived/replay-ready.json";
import snapshotJson from "../../data/raw/vibemathed.snapshot.json";
import type { NormalizedData } from "./normalize";
import {
  AttemptSchema,
  MethodFamilySchema,
  OpportunitySignalSchema,
  ProblemSchema,
  ProblemVersionSchema,
  ReplayCandidateSchema,
  SnapshotSchema,
  SolutionEventSchema,
  SourceAssertionSchema,
  VerificationSchema,
} from "./schema";

export const normalizedData: NormalizedData = {
  problems: ProblemSchema.array().parse(problemsJson),
  problemVersions: ProblemVersionSchema.array().parse(versionsJson),
  sourceAssertions: SourceAssertionSchema.array().parse(assertionsJson),
  attempts: AttemptSchema.array().parse(attemptsJson),
  solutionEvents: SolutionEventSchema.array().parse(eventsJson),
  verifications: VerificationSchema.array().parse(verificationsJson),
  methodFamilies: MethodFamilySchema.array().parse(methodsJson),
  opportunitySignals: OpportunitySignalSchema.array().parse(signalsJson),
};

export const replayCandidates = ReplayCandidateSchema.array().parse(replayJson);
export const snapshot = SnapshotSchema.parse(snapshotJson);

export function problemBundle(problemIdOrSlug: string) {
  const problem = normalizedData.problems.find(
    (item) => item.id === problemIdOrSlug || item.slug === problemIdOrSlug,
  );
  if (!problem) return null;
  return {
    problem,
    versions: normalizedData.problemVersions.filter(
      (item) => item.problem_id === problem.id,
    ),
    assertions: normalizedData.sourceAssertions.filter(
      (item) => item.problem_id === problem.id,
    ),
    attempts: normalizedData.attempts.filter(
      (item) => item.problem_id === problem.id,
    ),
    events: normalizedData.solutionEvents.filter(
      (item) => item.problem_id === problem.id,
    ),
    verifications: normalizedData.verifications.filter(
      (item) => item.problem_id === problem.id,
    ),
    methods: normalizedData.methodFamilies.filter(
      (item) => item.problem_id === problem.id,
    ),
    signals: normalizedData.opportunitySignals.filter(
      (item) => item.problem_id === problem.id,
    ),
    replay:
      replayCandidates.find((item) => item.problem_id === problem.id) ?? null,
  };
}
