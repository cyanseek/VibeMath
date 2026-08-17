import { normalizeSnapshot, type NormalizedData } from "../src/lib/normalize";
import { buildHandoff } from "../src/lib/lhf-handoff";
import { sha256 } from "../src/lib/provenance";
import { deriveReplayCandidates } from "../src/lib/replay";
import { SnapshotSchema, type Snapshot } from "../src/lib/schema";
import { readJson, writeJson } from "./io";

function feed<T>(generatedAt: string, sourceCount: number, data: T) {
  const payload = {
    schema_version: "1.0.0",
    generated_at: generatedAt,
    sources: [
      {
        id: "vibemathed",
        url: "https://vibemathed.com/api/dataset",
        license: "CC BY 4.0",
      },
    ],
    license: "CC BY 4.0",
    coverage: `Federated schema with ${sourceCount} records in the bundled VibeMathed snapshot; not a complete map of mathematics.`,
    data,
  };
  return { ...payload, build_id: sha256(payload) };
}

async function writeNormalized(data: NormalizedData) {
  await Promise.all([
    writeJson("data/normalized/problems.json", data.problems),
    writeJson("data/normalized/problem-versions.json", data.problemVersions),
    writeJson("data/normalized/source-assertions.json", data.sourceAssertions),
    writeJson("data/normalized/attempts.json", data.attempts),
    writeJson("data/normalized/solution-events.json", data.solutionEvents),
    writeJson("data/normalized/verifications.json", data.verifications),
    writeJson("data/normalized/method-families.json", data.methodFamilies),
    writeJson(
      "data/normalized/opportunity-signals.json",
      data.opportunitySignals,
    ),
  ]);
}

async function main() {
  const snapshot = SnapshotSchema.parse(
    await readJson<Snapshot>("data/raw/vibemathed.snapshot.json"),
  );
  const data = normalizeSnapshot(snapshot);
  const replay = deriveReplayCandidates(data);
  const latestEvents = [...data.solutionEvents].sort((a, b) =>
    (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""),
  );
  const frontier = data.problems.map((problem) => ({
    ...problem,
    solution_events: data.solutionEvents.filter(
      (event) => event.problem_id === problem.id,
    ),
    verifications: data.verifications.filter(
      (item) => item.problem_id === problem.id,
    ),
    opportunity_signals: data.opportunitySignals.filter(
      (item) => item.problem_id === problem.id,
    ),
  }));
  const pulse = {
    totals: Object.fromEntries(
      [
        "open",
        "attempted",
        "partial",
        "candidate",
        "resolved",
        "contested",
        "retracted",
      ].map((status) => [
        status,
        data.problems.filter((problem) => problem.current_status === status)
          .length,
      ]),
    ),
    replay_ready: replay.length,
    latest: latestEvents.slice(0, 20),
  };

  await writeNormalized(data);
  await Promise.all([
    writeJson("data/derived/latest.json", latestEvents),
    writeJson("data/derived/replay-ready.json", replay),
    writeJson("data/derived/frontier.json", frontier),
    writeJson("data/derived/pulse.json", pulse),
    writeJson(
      "public/api/v1/index.json",
      feed(snapshot.generated, data.problems.length, {
        endpoints: [
          "latest.json",
          "replay-ready.json",
          "problems.json",
          "events.json",
        ],
        counts: {
          problems: data.problems.length,
          events: data.solutionEvents.length,
        },
      }),
    ),
    writeJson(
      "public/api/v1/latest.json",
      feed(snapshot.generated, data.problems.length, latestEvents),
    ),
    writeJson(
      "public/api/v1/replay-ready.json",
      feed(snapshot.generated, data.problems.length, replay),
    ),
    writeJson(
      "public/api/v1/problems.json",
      feed(snapshot.generated, data.problems.length, data.problems),
    ),
    writeJson(
      "public/api/v1/events.json",
      feed(snapshot.generated, data.problems.length, data.solutionEvents),
    ),
  ]);

  for (const problem of data.problems) {
    await writeJson(
      `public/api/v1/handoffs/${problem.slug}.json`,
      buildHandoff(problem.id, data, replay),
    );
  }
  console.log(
    `Derived ${data.problems.length} problems, ${data.solutionEvents.length} events, and ${replay.length} replay candidates.`,
  );
}

await main();
