import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  exportLowHangingFruitHandoff,
  getMathProblem,
  getReplayCandidates,
  getVibeMathMetadata,
  latestAiMathEvents,
  searchMathFrontier,
} from "./tools";
import type { LocalStore } from "./tools";

export function createVibeMathServer(store: LocalStore) {
  const server = new McpServer({ name: "vibemath", version: "0.0.1" });
  const status = z.enum([
    "open",
    "attempted",
    "partial",
    "candidate",
    "resolved",
    "contested",
    "retracted",
  ]);
  const verification = z.enum([
    "unreviewed",
    "source_audited",
    "site_reproduced",
    "mechanically_verified",
    "lean_checked_statement_unaudited",
    "lean_verified_statement_audited",
    "independent_expert_verified",
    "peer_reviewed",
    "contested",
    "rejected",
  ]);
  const ok = (value: unknown) => ({
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  });
  const notFound = (message: string) => ({
    isError: true,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: { code: "NOT_FOUND", message } }),
      },
    ],
  });

  server.registerTool(
    "latest_ai_math_events",
    {
      description:
        "List recent source-reported AI mathematics events from the local snapshot.",
      inputSchema: {
        days: z.number().int().min(1).max(3650).optional(),
        status: status.optional(),
        verification: verification.optional(),
        field: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async (input) => ok(latestAiMathEvents(store, input)),
  );

  server.registerTool(
    "search_math_frontier",
    {
      description:
        "Search normalized problems without claiming complete mathematical coverage.",
      inputSchema: {
        query: z.string().optional(),
        status: status.optional(),
        field: z.string().optional(),
        ai_contribution: z
          .enum([
            "ai_discovered",
            "ai_co_developed",
            "ai_assisted",
            "ai_checked_only",
            "unclear",
            "not_applicable",
          ])
          .optional(),
        verification: verification.optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async (input) =>
      ok(
        searchMathFrontier(store, {
          ...input,
          aiContribution: input.ai_contribution,
        }),
      ),
  );

  server.registerTool(
    "get_math_problem",
    {
      description:
        "Get one problem with attempts, events, evidence, verification, and replay status.",
      inputSchema: { problem_id_or_slug: z.string().min(1) },
    },
    async ({ problem_id_or_slug }) => {
      const result = getMathProblem(store, problem_id_or_slug);
      return result
        ? ok(result)
        : notFound(`Problem not found: ${problem_id_or_slug}`);
    },
  );

  server.registerTool(
    "get_replay_candidates",
    {
      description:
        "List transparent replay-triage candidates; this is not a success probability.",
      inputSchema: {
        days: z.number().int().min(1).max(3650).optional(),
        verification_floor: verification.optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async (input) => ok(getReplayCandidates(store, input)),
  );

  server.registerTool(
    "export_low_hanging_fruit_handoff",
    {
      description:
        "Export a stable candidate-only handoff for Low-Hanging Fruit.",
      inputSchema: {
        problem_id_or_slug: z.string().min(1),
        mode_override: z.enum(["replay", "verify", "expand"]).optional(),
      },
    },
    async ({ problem_id_or_slug, mode_override }) => {
      try {
        return ok(
          exportLowHangingFruitHandoff(
            store,
            problem_id_or_slug,
            mode_override,
          ),
        );
      } catch {
        return notFound(`Problem not found: ${problem_id_or_slug}`);
      }
    },
  );

  server.registerTool(
    "get_vibemath_metadata",
    {
      description:
        "Return source freshness, license, schema, and coverage limits.",
      inputSchema: {},
    },
    async () => ok(getVibeMathMetadata(store)),
  );

  return server;
}
