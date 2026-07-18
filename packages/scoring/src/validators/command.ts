import { defineValidator, ok, fail } from "./util.js";

export const commandExitCode = defineValidator(
  "command-exit-code",
  "Run a command and check exit code",
  async (ctx, params) => {
    const cmd = String(params?.["cmd"] ?? params?.["command"] ?? "");
    const expected = Number(params?.["exitCode"] ?? 0);
    if (!cmd) return fail("command-exit-code", "Missing cmd param");
    const parts = cmd.split(/\s+/).filter(Boolean);
    const result = await ctx.exec(parts[0]!, parts.slice(1));
    if (result.exitCode !== expected) {
      return fail(
        "command-exit-code",
        `Expected exit ${expected}, got ${result.exitCode}: ${result.stderr.slice(0, 200)}`,
      );
    }
    const stdoutContains = params?.["stdoutContains"];
    if (stdoutContains && !result.stdout.includes(String(stdoutContains))) {
      return fail("command-exit-code", `stdout missing "${String(stdoutContains)}"`);
    }
    return ok("command-exit-code", `Command succeeded: ${cmd}`);
  },
);

export const testsPass = defineValidator(
  "tests-pass",
  "Run the project test script",
  async (ctx, params) => {
    const cmd = String(params?.["cmd"] ?? "npm test");
    const parts = cmd.split(/\s+/).filter(Boolean);
    const result = await ctx.exec(parts[0]!, parts.slice(1));
    return result.exitCode === 0
      ? ok("tests-pass", "Tests passed")
      : fail("tests-pass", `Tests failed: ${result.stderr.slice(0, 300)}`);
  },
);

export const lintPasses = defineValidator(
  "lint-passes",
  "Run lint script",
  async (ctx, params) => {
    const cmd = String(params?.["cmd"] ?? "npm run lint");
    const parts = cmd.split(/\s+/).filter(Boolean);
    const result = await ctx.exec(parts[0]!, parts.slice(1));
    return result.exitCode === 0
      ? ok("lint-passes", "Lint passed")
      : fail("lint-passes", `Lint failed: ${result.stderr.slice(0, 200)}`);
  },
);

export const typecheckPasses = defineValidator(
  "typecheck-passes",
  "Run typecheck script",
  async (ctx, params) => {
    const cmd = String(params?.["cmd"] ?? "npm run typecheck");
    const parts = cmd.split(/\s+/).filter(Boolean);
    const result = await ctx.exec(parts[0]!, parts.slice(1));
    return result.exitCode === 0
      ? ok("typecheck-passes", "Typecheck passed")
      : fail("typecheck-passes", `Typecheck failed: ${result.stderr.slice(0, 200)}`);
  },
);
