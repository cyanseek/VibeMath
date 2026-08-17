import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NormalizedData } from "../src/lib/normalize";
import { buildHandoff } from "../src/lib/lhf-handoff";
import { searchProblems } from "../src/lib/search";
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
  type ReplayCandidate,
  type Snapshot,
} from "../src/lib/schema";
import { verificationRank, type VerificationLevel } from "../src/lib/status";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = async (path: string) =>
  JSON.parse(await readFile(resolve(root, path), "utf8"));

export interface LocalStore {
  data: NormalizedData;
  replay: ReplayCandidate[];
  snapshot: Snapshot;
}

export async function loadLocalStore(): Promise<LocalStore> {
  const [
    problems,
    problemVersions,
    sourceAssertions,
    attempts,
    solutionEvents,
    verifications,
    methodFamilies,
    opportunitySignals,
    replay,
    snapshot,
  ] = await Promise.all([
    read("data/normalized/problems.json"),
    read("data/normalized/problem-versions.json"),
    read("data/normalized/source-assertions.json"),
    read("data/normalized/attempts.json"),
    read("data/normalized/solution-events.json"),
    read("data/normalized/verifications.json"),
    read("data/normalized/method-families.json"),
    read("data/normalized/opportunity-signals.json"),
    read("data/derived/replay-ready.json"),
    read("data/raw/vibemathed.snapshot.json"),
  ]);
  return {
    data: {
      problems: ProblemSchema.array().parse(problems),
      problemVersions: ProblemVersionSchema.array().parse(problemVersions),
      sourceAssertions: SourceAssertionSchema.array().parse(sourceAssertions),
      attempts: AttemptSchema.array().parse(attempts),
      solutionEvents: SolutionEventSchema.array().parse(solutionEvents),
      verifications: VerificationSchema.array().parse(verifications),
      methodFamilies: MethodFamilySchema.array().parse(methodFamilies),
      opportunitySignals:
        OpportunitySignalSchema.array().parse(opportunitySignals),
    },
    replay: ReplayCandidateSchema.array().parse(replay),
    snapshot: SnapshotSchema.parse(snapshot),
  };
}

const capped = (limit?: number) => Math.max(1, Math.min(limit ?? 20, 100));

export function latestAiMathEvents(
  store: LocalStore,
  options: {
    days?: number;
    status?: string;
    verification?: string;
    field?: string;
    limit?: number;
  },
) {
  const days = Math.max(1, Math.min(options.days ?? 7, 3650));
  const cutoff = Date.now() - days * 86_400_000;
  return store.data.solutionEvents
    .filter((event) => {
      if (options.status && event.status !== options.status) return false;
      if (event.occurred_at && new Date(event.occurred_at).valueOf() < cutoff)
        return false;
      const problem = store.data.problems.find(
        (item) => item.id === event.problem_id,
      );
      if (options.field && !problem?.fields.includes(options.field))
        return false;
      if (
        options.verification &&
        !store.data.verifications.some(
          (item) =>
            item.solution_event_id === event.id &&
            item.level === options.verification,
        )
      )
        return false;
      return true;
    })
    .sort((a, b) => (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""))
    .slice(0, capped(options.limit));
}

export function searchMathFrontier(
  store: LocalStore,
  options: Parameters<typeof searchProblems>[1],
) {
  return searchProblems(store.data, options);
}

export function getMathProblem(store: LocalStore, idOrSlug: string) {
  const problem = store.data.problems.find(
    (item) => item.id === idOrSlug || item.slug === idOrSlug,
  );
  if (!problem) return null;
  return {
    problem,
    events: store.data.solutionEvents.filter(
      (item) => item.problem_id === problem.id,
    ),
    attempts: store.data.attempts.filter(
      (item) => item.problem_id === problem.id,
    ),
    verifications: store.data.verifications.filter(
      (item) => item.problem_id === problem.id,
    ),
    methods: store.data.methodFamilies.filter(
      (item) => item.problem_id === problem.id,
    ),
    source_assertions: store.data.sourceAssertions.filter(
      (item) => item.problem_id === problem.id,
    ),
    replay: store.replay.find((item) => item.problem_id === problem.id) ?? null,
  };
}

export function getReplayCandidates(
  store: LocalStore,
  options: {
    days?: number;
    verification_floor?: VerificationLevel;
    limit?: number;
  },
) {
  const cutoff =
    Date.now() - Math.max(1, Math.min(options.days ?? 365, 3650)) * 86_400_000;
  const floor = options.verification_floor ?? "source_audited";
  return store.replay
    .filter(
      (item) =>
        verificationRank[item.verification_level] >= verificationRank[floor] &&
        (!item.event_date || new Date(item.event_date).valueOf() >= cutoff),
    )
    .slice(0, capped(options.limit));
}

export function exportLowHangingFruitHandoff(
  store: LocalStore,
  idOrSlug: string,
  modeOverride?: "replay" | "verify" | "expand",
) {
  return buildHandoff(idOrSlug, store.data, store.replay, modeOverride);
}

export function getVibeMathMetadata(store: LocalStore) {
  return {
    schema_version: "1.0.0",
    generated_at: store.snapshot.generated,
    retrieved_at: store.snapshot.retrieved_at,
    sources: [
      {
        id: "vibemathed",
        url: store.snapshot.dataset.url,
        methodology: store.snapshot.dataset.methodology,
      },
    ],
    license: store.snapshot.license,
    coverage: `Bundled snapshot: ${store.data.problems.length} VibeMathed records. VibeMath does not cover all mathematics.`,
    read_only: true,
  };
}
