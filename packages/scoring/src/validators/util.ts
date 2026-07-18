import type { Validator, ValidatorContext, ValidatorResult } from "@agent-eval-bench/core";

export function defineValidator(
  name: string,
  description: string,
  fn: (ctx: ValidatorContext, params?: Record<string, unknown>) => Promise<ValidatorResult> | ValidatorResult,
): Validator {
  return {
    name,
    description,
    async validate(ctx, params) {
      try {
        return await fn(ctx, params);
      } catch (err) {
        return {
          name,
          passed: false,
          score: 0,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

export function ok(name: string, message: string, score = 100): ValidatorResult {
  return { name, passed: true, score, message };
}

export function fail(name: string, message: string, score = 0): ValidatorResult {
  return { name, passed: false, score, message };
}
