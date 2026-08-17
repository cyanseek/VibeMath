import { z } from "zod";

export const SCHEMA_VERSION = "1.0.0";

export const AggregatedStatusSchema = z.enum([
  "open",
  "attempted",
  "partial",
  "candidate",
  "resolved",
  "contested",
  "retracted",
]);

export const VerificationLevelSchema = z.enum([
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

export const AIContributionSchema = z.enum([
  "ai_discovered",
  "ai_co_developed",
  "ai_assisted",
  "ai_checked_only",
  "unclear",
  "not_applicable",
]);

export const SolutionEventTypeSchema = z.enum([
  "proved",
  "disproved",
  "counterexample",
  "construction",
  "computation",
  "new_bound",
  "partial_result",
  "variant_only",
  "formalized",
  "replicated",
  "retracted",
  "contested",
]);

export const OpportunitySignalKindSchema = z.enum([
  "verify_now",
  "replay_ready",
  "formalization_ready",
  "open_with_few_ai_attempts",
  "status_conflict",
  "recent_partial_result",
  "possible_aftershock",
  "watch_only",
]);

export const SourceReferenceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
  kind: z.string().min(1),
  license: z.string().nullable().default(null),
});

export const ProblemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  title: z.object({
    original: z.string().min(1),
    en: z.string().nullable().default(null),
    zh_cn: z.string().nullable().default(null),
  }),
  canonical_statement: z.string().min(1),
  plain_summary: z.string().min(1),
  why_it_matters: z.string().nullable(),
  what_ai_did: z.string().nullable(),
  what_is_verified: z.string().nullable(),
  what_remains_uncertain: z.string().nullable(),
  how_a_non_expert_can_check: z.string().nullable(),
  expert_boundary: z.string().nullable(),
  fields: z.array(z.string().min(1)).min(1),
  posed_by: z.array(z.string()),
  year_posed: z.number().int().min(0).max(9999).nullable(),
  canonical_sources: z.array(SourceReferenceSchema),
  key_definitions: z.array(z.string()),
  confusing_variants: z.array(z.string()),
  current_status: AggregatedStatusSchema,
  current_status_confidence: z.number().min(0).max(1),
  source_assertion_ids: z.array(z.string()),
  related_problem_ids: z.array(z.string()),
  updated_at: z.iso.datetime(),
});

export const ProblemVersionSchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  version: z.string().min(1),
  original_text: z.string().min(1),
  normalized_text: z.string().min(1),
  domain: z.string().nullable(),
  quantifiers: z.array(z.string()),
  assumptions: z.array(z.string()),
  source: SourceReferenceSchema,
  effective_at: z.iso.datetime(),
  is_canonical: z.boolean(),
});

export const SourceAssertionSchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  source_id: z.string().min(1),
  external_id: z.string().min(1),
  retrieved_at: z.iso.datetime(),
  source_updated_at: z.iso.datetime().nullable(),
  assertion_type: z.string().min(1),
  status: AggregatedStatusSchema,
  raw: z.record(z.string(), z.unknown()),
  normalized: z.record(z.string(), z.unknown()),
  supporting_evidence: z.array(SourceReferenceSchema),
  confidence: z.number().min(0).max(1),
  data_license: z.string().min(1),
  content_hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});

export const AttemptSchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  model: z.string().nullable(),
  provider: z.string().nullable(),
  attempted_at: z.iso.datetime().nullable(),
  human_collaborators: z.array(z.string()),
  exposure: z.enum(["unknown", "result_only", "method_aware", "full_context"]),
  prompt_public: z.boolean().nullable(),
  outcome: z.string().nullable(),
  failed_routes: z.array(z.string()),
  artifacts: z.array(SourceReferenceSchema),
  sources: z.array(SourceReferenceSchema),
  cost_usd: z.number().nonnegative().nullable(),
  independence: z.enum(["yes", "no", "unknown"]),
});

export const SolutionEventSchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  type: SolutionEventTypeSchema,
  status: AggregatedStatusSchema,
  occurred_at: z.iso.datetime().nullable(),
  title: z.string().min(1),
  summary: z.string().min(1),
  ai_contribution: AIContributionSchema,
  attempt_ids: z.array(z.string()),
  method_family_ids: z.array(z.string()),
  source_assertion_ids: z.array(z.string()),
});

export const VerificationSchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  solution_event_id: z.string().min(1),
  level: VerificationLevelSchema,
  mathematical_correctness: z.enum([
    "unknown",
    "supported",
    "challenged",
    "rejected",
  ]),
  statement_fidelity: z.enum(["unknown", "unaudited", "audited"]),
  peer_review: z.enum(["none", "submitted", "reviewed"]),
  verifier: z.string().nullable(),
  verified_at: z.iso.datetime().nullable(),
  note: z.string().nullable(),
  sources: z.array(SourceReferenceSchema),
});

export const MethodFamilySchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  name: z.string().min(1),
  core_representation: z.string().nullable(),
  core_reduction: z.string().nullable(),
  key_lemmas: z.array(z.string()),
  main_tools: z.array(z.string()),
  relationships: z.array(z.string()),
  difference_confidence: z.number().min(0).max(1),
  independent: z.enum(["yes", "no", "unknown"]),
  evidence: z.array(SourceReferenceSchema),
});

export const OpportunitySignalSchema = z.object({
  id: z.string().min(1),
  problem_id: z.string().min(1),
  kind: OpportunitySignalKindSchema,
  reason: z.string().min(1),
  generated_at: z.iso.datetime(),
});

export const ReplayCandidateSchema = z.object({
  problem_id: z.string().min(1),
  replay_type: z.enum([
    "result_only",
    "method_aware",
    "verification_replay",
    "aftershock_expansion",
  ]),
  reason: z.string().min(1),
  required_exposure: z.enum(["result_only", "method_aware", "full_context"]),
  contamination_risks: z.array(z.string()),
  recommended_lhf_mode: z.enum(["replay", "verify", "expand"]),
  verification_level: VerificationLevelSchema,
  event_date: z.iso.datetime().nullable(),
});

export const LowHangingFruitHandoffSchema = z.object({
  schema_version: z.literal("1.0.0"),
  source: z.literal("vibemath"),
  problem_id: z.string().min(1),
  title: z.string().min(1),
  canonical_statement: z.string().min(1),
  plain_summary: z.string().min(1),
  current_status: AggregatedStatusSchema,
  solution_events: z.array(SolutionEventSchema),
  attempts: z.array(AttemptSchema),
  verifications: z.array(VerificationSchema),
  sources: z.array(SourceReferenceSchema),
  recommended_mode: z.enum(["replay", "verify", "expand"]),
  recommended_exposure: z.enum(["result_only", "method_aware", "full_context"]),
  opportunity_signals: z.array(OpportunitySignalSchema),
  uncertainties: z.array(z.string()),
  generated_at: z.iso.datetime(),
});

export const VibeMathedLinkSchema = z.looseObject({
  label: z.string(),
  url: z.url(),
  kind: z.string().nullable().optional(),
});

export const VibeMathedRelationSchema = z.looseObject({
  to: z.string(),
  kind: z.string(),
  note: z.string().nullable().optional(),
});

export const VibeMathedProblemSchema = z.looseObject({
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().nullable().optional(),
  problemNumber: z.union([z.string(), z.number()]).nullable().optional(),
  field: z.string().min(1),
  fieldGroup: z.string().nullable().optional(),
  statement: z.string().min(1),
  posedBy: z.string().nullable().optional(),
  yearPosed: z.number().int().nullable().optional(),
  solveType: z.string().nullable().optional(),
  resolution: z.string().min(1),
  aiContribution: z.string().nullable().optional(),
  resultNote: z.string().nullable().optional(),
  claimIssueNote: z.string().nullable().optional(),
  solveDate: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  modelMaker: z.string().nullable().optional(),
  humanCollaborators: z.array(z.string()).default([]),
  aiRole: z.string().nullable().optional(),
  verification: z.string().nullable().optional(),
  verificationNote: z.string().nullable().optional(),
  publication: z.string().nullable().optional(),
  resolutionMethod: z.string().nullable().optional(),
  significance: z.number().nullable().optional(),
  significanceNote: z.string().nullable().optional(),
  solveCostUsd: z.number().nullable().optional(),
  sourceUrl: z.url(),
  sourceName: z.string().min(1),
  links: z.array(VibeMathedLinkSchema).default([]),
  relations: z.array(VibeMathedRelationSchema).default([]),
});

export const VibeMathedDatasetSchema = z.looseObject({
  title: z.string(),
  url: z.url(),
  license: z.string(),
  methodology: z.url(),
  generated: z.iso.datetime(),
  count: z.number().int().nonnegative(),
  problems: z.array(VibeMathedProblemSchema),
});

export const SnapshotSchema = z.object({
  source: z.literal("vibemathed"),
  retrieved_at: z.iso.datetime(),
  generated: z.iso.datetime(),
  content_hash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  license: z.string().min(1),
  dataset: VibeMathedDatasetSchema,
});

export type Problem = z.infer<typeof ProblemSchema>;
export type ProblemVersion = z.infer<typeof ProblemVersionSchema>;
export type SourceAssertion = z.infer<typeof SourceAssertionSchema>;
export type Attempt = z.infer<typeof AttemptSchema>;
export type SolutionEvent = z.infer<typeof SolutionEventSchema>;
export type Verification = z.infer<typeof VerificationSchema>;
export type MethodFamily = z.infer<typeof MethodFamilySchema>;
export type OpportunitySignal = z.infer<typeof OpportunitySignalSchema>;
export type ReplayCandidate = z.infer<typeof ReplayCandidateSchema>;
export type LowHangingFruitHandoff = z.infer<
  typeof LowHangingFruitHandoffSchema
>;
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type VibeMathedDataset = z.infer<typeof VibeMathedDatasetSchema>;
export type VibeMathedProblem = z.infer<typeof VibeMathedProblemSchema>;
