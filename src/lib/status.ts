import type { z } from "zod";
import {
  AIContributionSchema,
  AggregatedStatusSchema,
  SolutionEventTypeSchema,
  VerificationLevelSchema,
} from "./schema";

export type AggregatedStatus = z.infer<typeof AggregatedStatusSchema>;
export type VerificationLevel = z.infer<typeof VerificationLevelSchema>;

export function mapResolution(value: string): AggregatedStatus {
  const normalized = value.toLowerCase().replaceAll("_", "-").trim();
  if (["resolved", "solved"].includes(normalized)) return "resolved";
  if (["partial", "partially-resolved"].includes(normalized)) return "partial";
  if (
    ["candidate", "candidate-under-review", "under-review", "claimed"].includes(
      normalized,
    )
  )
    return "candidate";
  if (["retracted", "withdrawn"].includes(normalized)) return "retracted";
  if (["contested", "disputed", "rejected"].includes(normalized))
    return "contested";
  if (["attempted", "attempt"].includes(normalized)) return "attempted";
  return "open";
}

export function mapAIContribution(value?: string | null) {
  const normalized = (value ?? "").toLowerCase().replaceAll("-", "_").trim();
  const aliases: Record<string, z.infer<typeof AIContributionSchema>> = {
    ai_discovered: "ai_discovered",
    ai_co_developed: "ai_co_developed",
    ai_assisted: "ai_assisted",
    ai_checked_only: "ai_checked_only",
    not_applicable: "not_applicable",
  };
  return aliases[normalized] ?? "unclear";
}

export function mapVerification(value?: string | null): VerificationLevel {
  const normalized = (value ?? "").toLowerCase().replaceAll("_", "-").trim();
  if (["rejected", "false"].includes(normalized)) return "rejected";
  if (["contested", "disputed"].includes(normalized)) return "contested";
  if (["peer-reviewed", "published-reviewed"].includes(normalized))
    return "peer_reviewed";
  if (["expert-verified", "independent-expert-verified"].includes(normalized))
    return "independent_expert_verified";
  if (["lean-verified", "lean-audited"].includes(normalized))
    return "lean_verified_statement_audited";
  if (["lean-checked", "formalized"].includes(normalized))
    return "lean_checked_statement_unaudited";
  if (["mechanically-verified", "machine-checked"].includes(normalized))
    return "mechanically_verified";
  if (["site-reproduced", "reproduced"].includes(normalized))
    return "site_reproduced";
  if (["source-audited", "audited"].includes(normalized))
    return "source_audited";
  return "unreviewed";
}

export function mapSolutionType(
  solveType?: string | null,
  resolution?: string | null,
): z.infer<typeof SolutionEventTypeSchema> {
  const value = (solveType ?? resolution ?? "")
    .toLowerCase()
    .replaceAll("-", "_");
  if (value.includes("disprov")) return "disproved";
  if (value.includes("counterexample")) return "counterexample";
  if (value.includes("construct")) return "construction";
  if (value.includes("comput")) return "computation";
  if (value.includes("bound")) return "new_bound";
  if (value.includes("variant")) return "variant_only";
  if (value.includes("formal")) return "formalized";
  if (value.includes("retract")) return "retracted";
  if (value.includes("contest")) return "contested";
  if (value.includes("partial")) return "partial_result";
  return "proved";
}

export const verificationRank: Record<VerificationLevel, number> = {
  rejected: -2,
  contested: -1,
  unreviewed: 0,
  source_audited: 1,
  site_reproduced: 2,
  mechanically_verified: 3,
  lean_checked_statement_unaudited: 3,
  lean_verified_statement_audited: 4,
  independent_expert_verified: 5,
  peer_reviewed: 5,
};
