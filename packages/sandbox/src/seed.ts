import type { Repository, SandboxHandle } from "@agent-eval-bench/core";
import { SandboxError } from "@agent-eval-bench/core";
import { join, relative, resolve, sep } from "node:path";

/**
 * Seed a sandbox workdir with repository fixtures.
 * Supports inline files map, fixture templates, and optional git init.
 */
export async function seedRepository(
  sandbox: SandboxHandle,
  repository?: Repository,
  opts?: { initGit?: boolean },
): Promise<void> {
  if (!repository) {
    if (opts?.initGit !== false) {
      await initGitRepo(sandbox);
    }
    return;
  }

  if (repository.files) {
    for (const [path, content] of Object.entries(repository.files)) {
      await sandbox.writeFile(path, content);
    }
  }

  if (repository.fixture) {
    await seedFixture(sandbox, repository.fixture);
  }

  if (opts?.initGit !== false) {
    await initGitRepo(sandbox);
  }
}

async function seedFixture(sandbox: SandboxHandle, fixture: string): Promise<void> {
  // Built-in minimal fixtures
  const fixtures: Record<string, Record<string, string>> = {
    "empty": {},
    "node-basic": {
      "package.json": JSON.stringify(
        { name: "fixture", version: "1.0.0", type: "module", scripts: { test: "echo ok" } },
        null,
        2,
      ),
      "src/index.js": 'export function hello() { return "hello"; }\n',
      "README.md": "# Fixture\n",
    },
    "node-with-tests": {
      "package.json": JSON.stringify(
        {
          name: "fixture-tests",
          version: "1.0.0",
          type: "module",
          scripts: { test: "node --test", lint: "echo lint-ok", typecheck: "echo types-ok" },
        },
        null,
        2,
      ),
      "src/math.js": "export const add = (a, b) => a + b;\n",
      "src/math.test.js":
        'import { test } from "node:test";\nimport assert from "node:assert";\nimport { add } from "./math.js";\ntest("add", () => assert.equal(add(1, 2), 3));\n',
    },
    "git-conflict": {
      "README.md": "# Conflict Fixture\n",
      "src/app.js": "console.log('main');\n",
    },
  };

  const files = fixtures[fixture];
  if (!files) {
    throw new SandboxError(`Unknown fixture: ${fixture}`, { fixture });
  }
  for (const [path, content] of Object.entries(files)) {
    await sandbox.writeFile(path, content);
  }
}

async function initGitRepo(sandbox: SandboxHandle): Promise<void> {
  await sandbox.exec("git", ["init", "-b", "main"]);
  await sandbox.exec("git", ["config", "user.email", "bench@agent-eval-bench.dev"]);
  await sandbox.exec("git", ["config", "user.name", "Agent Eval Bench"]);
  await sandbox.exec("git", ["add", "-A"]);
  const status = await sandbox.exec("git", ["status", "--porcelain"]);
  if (status.stdout.trim()) {
    await sandbox.exec("git", ["commit", "-m", "initial commit", "--allow-empty"]);
  } else {
    await sandbox.exec("git", ["commit", "-m", "initial commit", "--allow-empty"]);
  }
}

/** Ensure a path stays inside the sandbox workdir */
export function assertInsideWorkdir(workdir: string, targetPath: string): string {
  const full = resolve(workdir, targetPath);
  const rel = relative(workdir, full);
  if (rel.startsWith("..") || resolve(full) === resolve(sep)) {
    // Allow if full is still under workdir
    const normalizedWorkdir = resolve(workdir);
    if (!full.startsWith(normalizedWorkdir + sep) && full !== normalizedWorkdir) {
      throw new SandboxError(`Path escapes sandbox workdir: ${targetPath}`, {
        workdir,
        targetPath,
      });
    }
  }
  return full;
}

export function joinWorkdir(workdir: string, ...parts: string[]): string {
  return join(workdir, ...parts);
}
