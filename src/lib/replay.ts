import { type NormalizedData } from "./normalize";
import {
  ReplayCandidateSchema,
  type ReplayCandidate,
  type Verification,
  type VerificationLevelSchema,
} from "./schema";
import { verificationRank } from "./status";
import type { z } from "zod";

export const DEFAULT_REPLAY_FLOOR: z.infer<typeof VerificationLevelSchema> =
  "source_audited";

export function deriveReplayCandidates(
  data: NormalizedData,
  floor: z.infer<typeof VerificationLevelSchema> = DEFAULT_REPLAY_FLOOR,
): ReplayCandidate[] {
  const candidates: ReplayCandidate[] = [];
  const verificationsByEvent = new Map<string, Verification>();
  for (const verification of data.verifications) {
    const current = verificationsByEvent.get(verification.solution_event_id);
    if (
      !current ||
      verificationRank[verification.level] > verificationRank[current.level]
    ) {
      verificationsByEvent.set(verification.solution_event_id, verification);
    }
  }

  for (const event of data.solutionEvents) {
    if (["contested", "retracted", "candidate", "open"].includes(event.status))
      continue;
    const verification = verificationsByEvent.get(event.id);
    if (
      !verification ||
      verificationRank[verification.level] < verificationRank[floor]
    )
      continue;
    const method = data.methodFamilies.find((item) =>
      event.method_family_ids.includes(item.id),
    );
    const assertion = data.sourceAssertions.find((item) =>
      event.source_assertion_ids.includes(item.id),
    );
    if (
      !assertion?.supporting_evidence.some(
        (source) => source.kind === "primary-mathematical-source",
      )
    )
      continue;

    const replayType =
      verification.level === "lean_checked_statement_unaudited"
        ? "verification_replay"
        : method?.main_tools.length
          ? "method_aware"
          : "result_only";
    candidates.push(
      ReplayCandidateSchema.parse({
        problem_id: event.problem_id,
        replay_type: replayType,
        reason:
          "Public evidence is available and the source-reported verification meets the configured floor; this is a triage signal, not a success forecast.",
        required_exposure:
          replayType === "method_aware" ? "method_aware" : "result_only",
        contamination_risks: [
          "The model may have seen the public result during training.",
          "Statement fidelity and method independence require separate checks.",
        ],
        recommended_lhf_mode:
          replayType === "verification_replay" ? "verify" : "replay",
        verification_level: verification.level,
        event_date: event.occurred_at,
      }),
    );
  }
  return candidates.sort((a, b) =>
    (b.event_date ?? "").localeCompare(a.event_date ?? ""),
  );
}
