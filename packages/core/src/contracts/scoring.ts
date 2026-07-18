import type { BenchmarkDefinition, Expected } from "../schemas/benchmark.js";
import type { ScoreCard } from "../schemas/score.js";
import type { TelemetryEvent } from "../schemas/telemetry.js";

/** Context passed to validators during scoring */
export interface ValidatorContext {
  benchmark: BenchmarkDefinition;
  workdir: string;
  events: readonly TelemetryEvent[];
  expected: Expected | undefined;
  agentName: string;
  runId: string;
  /** Read a file from the sandbox workdir */
  readFile: (path: string) => Promise<string | null>;
  /** Check if a path exists in the sandbox */
  exists: (path: string) => Promise<boolean>;
  /** Run a command in the sandbox and return stdout/stderr/exitCode */
  exec: (
    cmd: string,
    args?: string[],
  ) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

/** Result of a single validator */
export interface ValidatorResult {
  name: string;
  passed: boolean;
  score: number;
  message: string;
  details?: Record<string, unknown>;
}

/** Validator contract — plugin-extensible */
export interface Validator {
  readonly name: string;
  readonly description: string;
  validate(
    ctx: ValidatorContext,
    params?: Record<string, unknown>,
  ): Promise<ValidatorResult>;
}

/** Scorer contract — turns validator results + events into a ScoreCard */
export interface Scorer {
  score(
    results: ValidatorResult[],
    events: readonly TelemetryEvent[],
    benchmark: BenchmarkDefinition,
  ): ScoreCard;
}
