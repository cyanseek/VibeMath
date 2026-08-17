import {
  type Attempt,
  AttemptSchema,
  type MethodFamily,
  MethodFamilySchema,
  type OpportunitySignal,
  OpportunitySignalSchema,
  type Problem,
  ProblemSchema,
  type ProblemVersion,
  ProblemVersionSchema,
  type Snapshot,
  type SolutionEvent,
  SolutionEventSchema,
  type SourceAssertion,
  SourceAssertionSchema,
  type Verification,
  VerificationSchema,
} from "./schema";
import { safeExternalUrl, sha256 } from "./provenance";
import {
  mapAIContribution,
  mapResolution,
  mapSolutionType,
  mapVerification,
} from "./status";

export interface NormalizedData {
  problems: Problem[];
  problemVersions: ProblemVersion[];
  sourceAssertions: SourceAssertion[];
  attempts: Attempt[];
  solutionEvents: SolutionEvent[];
  verifications: Verification[];
  methodFamilies: MethodFamily[];
  opportunitySignals: OpportunitySignal[];
}

function isoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(
    value.length === 10 ? `${value}T00:00:00.000Z` : value,
  );
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function splitPeople(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeSnapshot(snapshot: Snapshot): NormalizedData {
  const data: NormalizedData = {
    problems: [],
    problemVersions: [],
    sourceAssertions: [],
    attempts: [],
    solutionEvents: [],
    verifications: [],
    methodFamilies: [],
    opportunitySignals: [],
  };

  for (const source of snapshot.dataset.problems) {
    const id = `vibemathed:${source.slug}`;
    const assertionId = `${id}:assertion`;
    const eventId = `${id}:event`;
    const attemptId = `${id}:attempt`;
    const methodId = `${id}:method`;
    const verificationId = `${id}:verification`;
    const status = mapResolution(source.resolution);
    const verificationLevel = mapVerification(source.verification);
    const sourceUrl = safeExternalUrl(source.sourceUrl);
    const vibemathedUrl = safeExternalUrl(
      `https://vibemathed.com/problem/${source.slug}`,
    );
    const canonicalSource = {
      label: source.sourceName,
      url: sourceUrl,
      kind: "primary-mathematical-source",
      license: null,
    };
    const trackerSource = {
      label: `VibeMathed: ${source.name}`,
      url: vibemathedUrl,
      kind: "source-assertion",
      license: snapshot.license,
    };
    const otherLinks = source.links.map((link) => ({
      label: link.label,
      url: safeExternalUrl(link.url),
      kind: link.kind ?? "supporting-artifact",
      license: null,
    }));
    const eventAt = isoDate(source.solveDate);

    const assertion = SourceAssertionSchema.parse({
      id: assertionId,
      problem_id: id,
      source_id: "vibemathed",
      external_id: source.slug,
      retrieved_at: snapshot.retrieved_at,
      source_updated_at: snapshot.generated,
      assertion_type: "solution-status-report",
      status,
      raw: source,
      normalized: {
        status,
        solution_event_type: mapSolutionType(
          source.solveType,
          source.resolution,
        ),
        ai_contribution: mapAIContribution(source.aiContribution),
        verification: verificationLevel,
      },
      supporting_evidence: [canonicalSource, trackerSource, ...otherLinks],
      confidence: status === "candidate" || status === "contested" ? 0.5 : 0.7,
      data_license: snapshot.license,
      content_hash: sha256(source),
    });

    const plainSummary = `VibeMathed reports this item as ${status}. VibeMath preserves that report as a source assertion and has not independently authored a plain-language mathematical explanation.`;
    const problem = ProblemSchema.parse({
      id,
      slug: source.slug,
      title: { original: source.name, en: source.name, zh_cn: null },
      canonical_statement: source.statement,
      plain_summary: plainSummary,
      why_it_matters: null,
      what_ai_did: source.aiRole ?? null,
      what_is_verified: source.verificationNote ?? null,
      what_remains_uncertain:
        source.claimIssueNote ??
        "VibeMath has not independently audited the mathematical statement, proof, or novelty claim.",
      how_a_non_expert_can_check:
        "Follow the primary source and the VibeMathed entry; compare the exact statement, assumptions, and verification label.",
      expert_boundary:
        "The source statement is reproduced for indexing with attribution. Mathematical correctness requires domain-expert or mechanical review.",
      fields: [source.field, ...(source.fieldGroup ? [source.fieldGroup] : [])],
      posed_by: splitPeople(source.posedBy),
      year_posed: source.yearPosed ?? null,
      canonical_sources: [canonicalSource, trackerSource],
      key_definitions: [],
      confusing_variants: source.resultNote ? [source.resultNote] : [],
      current_status: status,
      current_status_confidence:
        status === "candidate" || status === "contested" ? 0.5 : 0.7,
      source_assertion_ids: [assertionId],
      related_problem_ids: source.relations.map(
        (relation) => `vibemathed:${relation.to}`,
      ),
      updated_at: snapshot.generated,
    });

    const version = ProblemVersionSchema.parse({
      id: `${id}:version:1`,
      problem_id: id,
      version: "1",
      original_text: source.statement,
      normalized_text: source.statement.trim(),
      domain: source.field,
      quantifiers: [],
      assumptions: [],
      source: trackerSource,
      effective_at: snapshot.generated,
      is_canonical: true,
    });

    const attempt = AttemptSchema.parse({
      id: attemptId,
      problem_id: id,
      model: source.model ?? null,
      provider: source.modelMaker ?? null,
      attempted_at: eventAt,
      human_collaborators: source.humanCollaborators,
      exposure: "unknown",
      prompt_public: null,
      outcome: source.aiRole ?? null,
      failed_routes: [],
      artifacts: otherLinks,
      sources: [canonicalSource, trackerSource],
      cost_usd: source.solveCostUsd ?? null,
      independence: "unknown",
    });

    const methodFamily = MethodFamilySchema.parse({
      id: methodId,
      problem_id: id,
      name: source.resolutionMethod
        ? `${source.resolutionMethod} (source-reported)`
        : "Method not yet classified",
      core_representation: null,
      core_reduction: null,
      key_lemmas: [],
      main_tools: source.resolutionMethod ? [source.resolutionMethod] : [],
      relationships: [],
      difference_confidence: 0,
      independent: "unknown",
      evidence: [canonicalSource, trackerSource],
    });

    const event = SolutionEventSchema.parse({
      id: eventId,
      problem_id: id,
      type: mapSolutionType(source.solveType, source.resolution),
      status,
      occurred_at: eventAt,
      title: source.sourceName,
      summary: source.resultNote ?? plainSummary,
      ai_contribution: mapAIContribution(source.aiContribution),
      attempt_ids: [attemptId],
      method_family_ids: [methodId],
      source_assertion_ids: [assertionId],
    });

    const verification = VerificationSchema.parse({
      id: verificationId,
      problem_id: id,
      solution_event_id: eventId,
      level: verificationLevel,
      mathematical_correctness:
        verificationLevel === "rejected"
          ? "rejected"
          : verificationLevel === "contested"
            ? "challenged"
            : verificationLevel === "unreviewed"
              ? "unknown"
              : "supported",
      statement_fidelity: verificationLevel.includes("audited")
        ? "audited"
        : "unaudited",
      peer_review: verificationLevel === "peer_reviewed" ? "reviewed" : "none",
      verifier: "VibeMathed (source-reported label)",
      verified_at: null,
      note: source.verificationNote ?? null,
      sources: [trackerSource, canonicalSource],
    });

    const signals: OpportunitySignal[] = [];
    const signal = (kind: OpportunitySignal["kind"], reason: string) =>
      signals.push(
        OpportunitySignalSchema.parse({
          id: `${id}:signal:${kind}`,
          problem_id: id,
          kind,
          reason,
          generated_at: snapshot.generated,
        }),
      );
    if (status === "candidate")
      signal(
        "verify_now",
        "The source labels this result as a candidate; verification should precede reuse.",
      );
    else if (status === "partial")
      signal(
        "recent_partial_result",
        "A source-reported partial result may support bounded expansion.",
      );
    else if (status === "resolved" && verificationLevel !== "unreviewed")
      signal(
        "replay_ready",
        "A public source and a non-unreviewed verification label support replay triage.",
      );
    else
      signal(
        "watch_only",
        "Current public evidence does not meet the default replay threshold.",
      );

    data.problems.push(problem);
    data.problemVersions.push(version);
    data.sourceAssertions.push(assertion);
    data.attempts.push(attempt);
    data.solutionEvents.push(event);
    data.verifications.push(verification);
    data.methodFamilies.push(methodFamily);
    data.opportunitySignals.push(...signals);
  }

  return data;
}
