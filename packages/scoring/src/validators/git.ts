import { defineValidator, ok, fail } from "./util.js";

export const gitLogContains = defineValidator(
  "git-log-contains",
  "Check git log messages contain a substring",
  async (ctx, params) => {
    const needle = String(params?.["contains"] ?? params?.["message"] ?? "");
    const result = await ctx.exec("git", ["log", "--oneline", "-20"]);
    if (result.exitCode !== 0) return fail("git-log-contains", "git log failed");
    if (needle && !result.stdout.includes(needle)) {
      return fail("git-log-contains", `git log missing "${needle}"`);
    }
    return ok("git-log-contains", "git log matches");
  },
);

export const gitBranch = defineValidator(
  "git-branch",
  "Check current git branch name",
  async (ctx, params) => {
    const expected = String(params?.["branch"] ?? params?.["name"] ?? "");
    const result = await ctx.exec("git", ["branch", "--show-current"]);
    const actual = result.stdout.trim();
    if (expected && actual !== expected) {
      return fail("git-branch", `Expected branch ${expected}, got ${actual}`);
    }
    return ok("git-branch", `On branch ${actual}`);
  },
);

export const gitCommitCount = defineValidator(
  "git-commit-count",
  "Check minimum number of commits",
  async (ctx, params) => {
    const min = Number(params?.["min"] ?? 1);
    const result = await ctx.exec("git", ["rev-list", "--count", "HEAD"]);
    const count = Number(result.stdout.trim());
    if (Number.isNaN(count) || count < min) {
      return fail("git-commit-count", `Expected >= ${min} commits, got ${count}`);
    }
    return ok("git-commit-count", `${count} commits`);
  },
);
