import type { NormalizedData } from "./normalize";
import type { Problem, VerificationLevelSchema } from "./schema";
import type { z } from "zod";

export interface SearchOptions {
  query?: string;
  status?: Problem["current_status"];
  field?: string;
  aiContribution?: string;
  verification?: z.infer<typeof VerificationLevelSchema>;
  limit?: number;
}

export function searchProblems(
  data: NormalizedData,
  options: SearchOptions,
): Problem[] {
  const query = options.query?.trim().toLocaleLowerCase();
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
  return data.problems
    .filter((problem) => {
      if (options.status && problem.current_status !== options.status)
        return false;
      if (
        options.field &&
        !problem.fields.some((field) => field === options.field)
      )
        return false;
      if (query) {
        const haystack = [
          problem.title.original,
          problem.canonical_statement,
          problem.plain_summary,
          ...problem.fields,
        ]
          .join(" ")
          .toLocaleLowerCase();
        if (!haystack.includes(query)) return false;
      }
      const events = data.solutionEvents.filter(
        (event) => event.problem_id === problem.id,
      );
      if (
        options.aiContribution &&
        !events.some((e) => e.ai_contribution === options.aiContribution)
      )
        return false;
      if (
        options.verification &&
        !data.verifications.some(
          (verification) =>
            verification.problem_id === problem.id &&
            verification.level === options.verification,
        )
      )
        return false;
      return true;
    })
    .slice(0, limit);
}
