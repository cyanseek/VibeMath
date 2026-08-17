import type { NormalizedData } from "./normalize";
import {
  LowHangingFruitHandoffSchema,
  type LowHangingFruitHandoff,
  type ReplayCandidate,
} from "./schema";

export function buildHandoff(
  problemIdOrSlug: string,
  data: NormalizedData,
  replayCandidates: ReplayCandidate[],
  modeOverride?: "replay" | "verify" | "expand",
): LowHangingFruitHandoff {
  const problem = data.problems.find(
    (item) => item.id === problemIdOrSlug || item.slug === problemIdOrSlug,
  );
  if (!problem) throw new Error(`Problem not found: ${problemIdOrSlug}`);
  const events = data.solutionEvents.filter(
    (item) => item.problem_id === problem.id,
  );
  const attempts = data.attempts.filter(
    (item) => item.problem_id === problem.id,
  );
  const verifications = data.verifications.filter(
    (item) => item.problem_id === problem.id,
  );
  const signals = data.opportunitySignals.filter(
    (item) => item.problem_id === problem.id,
  );
  const replay = replayCandidates.find(
    (item) => item.problem_id === problem.id,
  );
  const recommendedMode =
    modeOverride ??
    replay?.recommended_lhf_mode ??
    (problem.current_status === "partial" ? "expand" : "verify");
  const uncertainties = [
    "VibeMath has not independently verified the mathematical claim.",
    "AI-attempt independence and training-data exposure are unknown unless explicitly documented.",
  ];
  if (problem.current_status === "candidate") {
    uncertainties.unshift(
      "The source status is candidate and must not be represented as solved.",
    );
  }

  return LowHangingFruitHandoffSchema.parse({
    schema_version: "1.0.0",
    source: "vibemath",
    problem_id: problem.id,
    title: problem.title.original,
    canonical_statement: problem.canonical_statement,
    plain_summary: problem.plain_summary,
    current_status: problem.current_status,
    solution_events: events,
    attempts,
    verifications,
    sources: problem.canonical_sources,
    recommended_mode: recommendedMode,
    recommended_exposure: replay?.required_exposure ?? "result_only",
    opportunity_signals: signals,
    uncertainties,
    generated_at: problem.updated_at,
  });
}

export function handoffPrompt(
  handoff: LowHangingFruitHandoff,
  language: "en" | "zh",
): string {
  if (language === "zh") {
    return `请用 Low-Hanging Fruit 的 ${handoff.recommended_mode} 模式处理问题“${handoff.title}”。先核查精确陈述、来源与验证边界；把现有结论视为 ${handoff.current_status}，不要自动升级为已解决。输入 handoff：${JSON.stringify(handoff)}`;
  }
  return `Use Low-Hanging Fruit in ${handoff.recommended_mode} mode for “${handoff.title}”. Audit the exact statement, sources, and verification boundary first. Treat the current claim as ${handoff.current_status}; do not auto-upgrade it to solved. Handoff: ${JSON.stringify(handoff)}`;
}
