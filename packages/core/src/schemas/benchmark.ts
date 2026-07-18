import { z } from "zod";

/** Benchmark difficulty levels */
export const DifficultySchema = z.enum(["easy", "medium", "hard", "expert"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

/** All official benchmark categories */
export const CategorySchema = z.enum([
  "context",
  "memory",
  "planning",
  "loop",
  "recovery",
  "git",
  "shell",
  "filesystem",
  "verification",
  "hallucination",
  "ambiguity",
  "long-horizon",
  "tool-usage",
  "efficiency",
]);
export type Category = z.infer<typeof CategorySchema>;

/** Sandbox resource limits */
export const EnvironmentSchema = z.object({
  network: z.enum(["none", "allowlist", "full"]).default("none"),
  cpus: z.number().positive().default(2),
  memory: z.string().default("2g"),
  timeout: z.number().positive().default(300_000),
  image: z.string().default("agent-eval-bench/sandbox:latest"),
  workdir: z.string().default("/workspace"),
  env: z.record(z.string()).optional(),
});
export type Environment = z.infer<typeof EnvironmentSchema>;

/** Repository fixture reference */
export const RepositorySchema = z.object({
  fixture: z.string().optional(),
  url: z.string().url().optional(),
  branch: z.string().optional(),
  commit: z.string().optional(),
  files: z
    .record(z.string())
    .optional()
    .describe("Inline file map: path → content"),
});
export type Repository = z.infer<typeof RepositorySchema>;

/** Expected outcomes for a benchmark */
export const ExpectedSchema = z.object({
  files: z
    .array(
      z.object({
        path: z.string(),
        exists: z.boolean().optional(),
        contains: z.string().optional(),
        matches: z.string().optional(),
      }),
    )
    .optional(),
  commands: z
    .array(
      z.object({
        cmd: z.string(),
        exitCode: z.number().default(0),
        stdoutContains: z.string().optional(),
      }),
    )
    .optional(),
  git: z
    .object({
      commits: z.number().optional(),
      branch: z.string().optional(),
      messageContains: z.string().optional(),
      hasConflict: z.boolean().optional(),
    })
    .optional(),
  agentBehavior: z
    .object({
      shouldAskQuestion: z.boolean().optional(),
      shouldNotAssume: z.boolean().optional(),
      maxToolCalls: z.number().optional(),
      maxRetries: z.number().optional(),
      mustUseTools: z.array(z.string()).optional(),
      mustNotUseTools: z.array(z.string()).optional(),
    })
    .optional(),
  custom: z.record(z.unknown()).optional(),
});
export type Expected = z.infer<typeof ExpectedSchema>;

/** Validator reference in a benchmark definition */
export const ValidatorRefSchema = z.object({
  name: z.string(),
  params: z.record(z.unknown()).optional(),
  weight: z.number().min(0).max(1).optional(),
});
export type ValidatorRef = z.infer<typeof ValidatorRefSchema>;

/** Per-dimension scoring weights */
export const ScoringWeightsSchema = z.object({
  success: z.number().min(0).max(1).default(0.25),
  accuracy: z.number().min(0).max(1).default(0.15),
  planning: z.number().min(0).max(1).default(0.1),
  efficiency: z.number().min(0).max(1).default(0.1),
  verification: z.number().min(0).max(1).default(0.1),
  recovery: z.number().min(0).max(1).default(0.1),
  memory: z.number().min(0).max(1).default(0.05),
  safety: z.number().min(0).max(1).default(0.15),
});
export type ScoringWeights = z.infer<typeof ScoringWeightsSchema>;

/** Prompt — single string or multi-turn conversation */
export const PromptSchema = z.union([
  z.string(),
  z.array(
    z.object({
      role: z.enum(["user", "system"]),
      content: z.string(),
      delayMs: z.number().optional(),
    }),
  ),
]);
export type Prompt = z.infer<typeof PromptSchema>;

/** Full benchmark definition (YAML/JSON → this) */
export const BenchmarkDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  difficulty: DifficultySchema.default("medium"),
  category: CategorySchema,
  tags: z.array(z.string()).default([]),
  repository: RepositorySchema.optional(),
  prompt: PromptSchema,
  environment: EnvironmentSchema.optional(),
  expected: ExpectedSchema.optional(),
  validators: z.array(ValidatorRefSchema).default([]),
  timeout: z.number().positive().optional(),
  scoring: ScoringWeightsSchema.optional(),
  requiresCapabilities: z.array(z.string()).default([]),
  skip: z.boolean().default(false),
  skipReason: z.string().optional(),
});
export type BenchmarkDefinition = z.infer<typeof BenchmarkDefinitionSchema>;
