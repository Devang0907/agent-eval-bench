/**
 * Generates official YAML benchmarks (~50 across 14 categories).
 * Run: bun packages/benchmarks/scripts/generate.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "definitions");

interface Bench {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  category: string;
  prompt: string;
  files?: Record<string, string>;
  expectedFiles?: Array<{ path: string; exists?: boolean; contains?: string }>;
  validators?: Array<{ name: string; params?: Record<string, unknown> }>;
  agentBehavior?: Record<string, unknown>;
  fixture?: string;
  tags?: string[];
}

const benches: Bench[] = [
  // CONTEXT
  {
    id: "context/forgotten-instructions",
    name: "Forgotten Instructions",
    description: "Agent must recall an early instruction after distraction",
    difficulty: "medium",
    category: "context",
    prompt: `Remember this secret code: ALPHA-7.\n\nNow create a file called notes.txt with the word "distraction".\n\nFinally, create secret.txt containing only the secret code.`,
    expectedFiles: [
      { path: "notes.txt", exists: true },
      { path: "secret.txt", exists: true, contains: "ALPHA-7" },
    ],
    validators: [
      { name: "file-exists", params: { path: "secret.txt" } },
      { name: "file-contains", params: { path: "secret.txt", contains: "ALPHA-7" } },
    ],
  },
  {
    id: "context/instruction-conflict",
    name: "Instruction Conflict",
    description: "Prefer the later explicit instruction when they conflict",
    difficulty: "hard",
    category: "context",
    prompt: `Create output.txt with the word RED.\n\nActually, ignore that — write BLUE instead.`,
    expectedFiles: [{ path: "output.txt", exists: true, contains: "BLUE" }],
    validators: [
      { name: "file-contains", params: { path: "output.txt", contains: "BLUE" } },
    ],
  },
  {
    id: "context/multi-file",
    name: "Multi-file Context",
    description: "Use information spread across multiple existing files",
    difficulty: "medium",
    category: "context",
    files: {
      "a.txt": "first=hello",
      "b.txt": "second=world",
    },
    prompt: `Read a.txt and b.txt. Create combined.txt with the values joined by a space.`,
    expectedFiles: [{ path: "combined.txt", exists: true, contains: "hello world" }],
    validators: [
      { name: "file-contains", params: { path: "combined.txt", contains: "hello" } },
    ],
  },
  {
    id: "context/conversation-drift",
    name: "Conversation Drift",
    description: "Stay on the original task despite unrelated digressions",
    difficulty: "medium",
    category: "context",
    prompt: [
      { role: "user", content: "Create target.txt with the word TARGET." },
      { role: "user", content: "By the way, what's your favorite color? Also, write junk.txt." },
      { role: "user", content: "Ensure target.txt still exists with TARGET." },
    ],
    expectedFiles: [{ path: "target.txt", exists: true, contains: "TARGET" }],
    validators: [{ name: "file-exists", params: { path: "target.txt" } }],
  },

  // MEMORY
  {
    id: "memory/session-recall",
    name: "Session Memory",
    description: "Recall a preference stated earlier in the session",
    difficulty: "medium",
    category: "memory",
    prompt: [
      { role: "user", content: "Always name new modules with the prefix ab_." },
      { role: "user", content: "Create a module for logging." },
    ],
    expectedFiles: [{ path: "ab_logging.js", exists: true }],
    validators: [{ name: "file-exists", params: { path: "ab_logging.js" } }],
  },
  {
    id: "memory/coding-style",
    name: "Coding Style Memory",
    description: "Respect stated style conventions",
    difficulty: "medium",
    category: "memory",
    prompt: `Use single quotes and 2-space indent. Create style.js exporting const name = 'agent'.`,
    expectedFiles: [{ path: "style.js", exists: true, contains: "'agent'" }],
    validators: [
      { name: "file-contains", params: { path: "style.js", contains: "'agent'" } },
    ],
  },
  {
    id: "memory/architecture",
    name: "Architecture Memory",
    description: "Place code in the architecture-prescribed folder",
    difficulty: "hard",
    category: "memory",
    files: {
      "ARCHITECTURE.md": "All services live under src/services/.\n",
    },
    prompt: `Read ARCHITECTURE.md and add a hello service accordingly.`,
    expectedFiles: [{ path: "src/services/hello.js", exists: true }],
    validators: [{ name: "file-exists", params: { path: "src/services/hello.js" } }],
  },
  {
    id: "memory/naming-convention",
    name: "Naming Convention Memory",
    description: "Follow kebab-case file naming",
    difficulty: "easy",
    category: "memory",
    prompt: `Create files using kebab-case only. Add user-profile.ts exporting an empty object.`,
    expectedFiles: [{ path: "user-profile.ts", exists: true }],
    validators: [{ name: "file-exists", params: { path: "user-profile.ts" } }],
  },

  // PLANNING
  {
    id: "planning/decomposition",
    name: "Task Decomposition",
    description: "Create milestone files in order",
    difficulty: "medium",
    category: "planning",
    prompt: `Build a tiny project in steps: 1) create plan.md with a checklist, 2) create src/index.js that logs hi, 3) create DONE.md saying complete.`,
    expectedFiles: [
      { path: "plan.md", exists: true },
      { path: "src/index.js", exists: true },
      { path: "DONE.md", exists: true },
    ],
    validators: [
      { name: "file-exists", params: { path: "plan.md" } },
      { name: "file-exists", params: { path: "DONE.md" } },
    ],
  },
  {
    id: "planning/dependency-order",
    name: "Dependency Ordering",
    description: "Create base before dependent module",
    difficulty: "medium",
    category: "planning",
    prompt: `Create lib/base.js exporting const base = 1. Then create lib/dep.js that imports base.`,
    expectedFiles: [
      { path: "lib/base.js", exists: true },
      { path: "lib/dep.js", exists: true, contains: "base" },
    ],
    validators: [{ name: "file-exists", params: { path: "lib/dep.js" } }],
  },
  {
    id: "planning/replan",
    name: "Replanning",
    description: "Adapt plan when requirements change mid-task",
    difficulty: "hard",
    category: "planning",
    prompt: [
      { role: "user", content: "Create app.py as a CLI that prints hello." },
      { role: "user", content: "Change of plans: make it a JS file app.js instead, remove app.py if created." },
    ],
    expectedFiles: [{ path: "app.js", exists: true }],
    validators: [
      { name: "file-exists", params: { path: "app.js" } },
      { name: "file-absent", params: { path: "app.py" } },
    ],
  },

  // LOOP
  {
    id: "loop/no-repeat-edits",
    name: "Avoid Repeated Edits",
    description: "Should not loop on the same write",
    difficulty: "medium",
    category: "loop",
    prompt: `Create once.txt with "once". Do not rewrite it repeatedly.`,
    expectedFiles: [{ path: "once.txt", exists: true }],
    validators: [
      { name: "file-exists", params: { path: "once.txt" } },
      { name: "no-loop-detected" },
      { name: "max-tool-calls", params: { max: 10 } },
    ],
  },
  {
    id: "loop/progress-detection",
    name: "Progress Detection",
    description: "Make forward progress across steps",
    difficulty: "easy",
    category: "loop",
    prompt: `Create step1.txt, then step2.txt, then step3.txt.`,
    expectedFiles: [
      { path: "step1.txt", exists: true },
      { path: "step2.txt", exists: true },
      { path: "step3.txt", exists: true },
    ],
    validators: [{ name: "no-loop-detected" }],
  },
  {
    id: "loop/retry-budget",
    name: "Retry Budget",
    description: "Stay within a reasonable tool budget",
    difficulty: "medium",
    category: "loop",
    prompt: `Create ok.txt with ok.`,
    expectedFiles: [{ path: "ok.txt", exists: true }],
    validators: [
      { name: "max-tool-calls", params: { max: 15 } },
      { name: "max-shell-commands", params: { max: 20 } },
    ],
  },

  // RECOVERY
  {
    id: "recovery/broken-tests",
    name: "Broken Tests",
    description: "Fix a failing test",
    difficulty: "hard",
    category: "recovery",
    fixture: "node-with-tests",
    files: {
      "src/math.js": "export const add = (a, b) => a - b;\n",
      "src/math.test.js":
        'import { test } from "node:test";\nimport assert from "node:assert";\nimport { add } from "./math.js";\ntest("add", () => assert.equal(add(1, 2), 3));\n',
      "package.json": JSON.stringify({
        name: "broken",
        type: "module",
        scripts: { test: "node --test" },
      }),
    },
    prompt: `Tests are failing. Fix src/math.js so tests pass.`,
    validators: [{ name: "tests-pass", params: { cmd: "npm test" } }],
  },
  {
    id: "recovery/missing-dependency",
    name: "Missing Dependency",
    description: "Handle missing package gracefully by creating local shim",
    difficulty: "medium",
    category: "recovery",
    files: {
      "index.js": 'import { helper } from "./helper.js";\nconsole.log(helper());\n',
    },
    prompt: `index.js imports ./helper.js which is missing. Create helper.js exporting helper() returning "ok".`,
    expectedFiles: [{ path: "helper.js", exists: true, contains: "helper" }],
    validators: [{ name: "file-exists", params: { path: "helper.js" } }],
  },
  {
    id: "recovery/permission-denied",
    name: "Permission Denied Recovery",
    description: "Work around a read-only hint by writing elsewhere",
    difficulty: "hard",
    category: "recovery",
    files: { "READONLY": "do not write here\n" },
    prompt: `Assume /etc is not writable. Write your result to workspace/result.txt with "recovered".`,
    expectedFiles: [{ path: "result.txt", exists: true, contains: "recovered" }],
    validators: [{ name: "file-contains", params: { path: "result.txt", contains: "recovered" } }],
  },

  // GIT
  {
    id: "git/commit",
    name: "Git Commit",
    description: "Create a file and commit it",
    difficulty: "easy",
    category: "git",
    prompt: `Create feature.txt with "feature" and commit with message "add feature".`,
    expectedFiles: [{ path: "feature.txt", exists: true }],
    validators: [
      { name: "file-exists", params: { path: "feature.txt" } },
      { name: "git-log-contains", params: { contains: "feature" } },
    ],
  },
  {
    id: "git/branch",
    name: "Git Branch",
    description: "Create and switch to a feature branch",
    difficulty: "easy",
    category: "git",
    prompt: `Create and checkout a branch named feature/demo.`,
    validators: [{ name: "git-branch", params: { branch: "feature/demo" } }],
  },
  {
    id: "git/commit-count",
    name: "Multiple Commits",
    description: "Make at least two commits",
    difficulty: "medium",
    category: "git",
    prompt: `Create a.txt and commit. Then create b.txt and commit again.`,
    validators: [{ name: "git-commit-count", params: { min: 2 } }],
  },

  // SHELL
  {
    id: "shell/correct-directory",
    name: "Correct Working Directory",
    description: "Create a file inside nested/dir",
    difficulty: "easy",
    category: "shell",
    prompt: `Create nested/dir/file.txt with "here".`,
    expectedFiles: [{ path: "nested/dir/file.txt", exists: true }],
    validators: [{ name: "file-exists", params: { path: "nested/dir/file.txt" } }],
  },
  {
    id: "shell/exit-code",
    name: "Respect Exit Codes",
    description: "Create success.txt only after a successful command",
    difficulty: "medium",
    category: "shell",
    prompt: `Run node -e "process.exit(0)" then create success.txt.`,
    expectedFiles: [{ path: "success.txt", exists: true }],
    validators: [{ name: "file-exists", params: { path: "success.txt" } }],
  },
  {
    id: "shell/no-dangerous",
    name: "Avoid Dangerous Commands",
    description: "Complete task without dangerous shell",
    difficulty: "easy",
    category: "shell",
    prompt: `Create safe.txt with "safe". Do not run destructive commands.`,
    expectedFiles: [{ path: "safe.txt", exists: true }],
    validators: [
      { name: "file-exists", params: { path: "safe.txt" } },
      { name: "max-shell-commands", params: { max: 30 } },
    ],
  },

  // FILESYSTEM
  {
    id: "filesystem/create-hello",
    name: "Create Hello File",
    description: "Basic file creation",
    difficulty: "easy",
    category: "filesystem",
    prompt: `Create a file called hello.txt with content hello`,
    expectedFiles: [{ path: "hello.txt", exists: true, contains: "hello" }],
    validators: [{ name: "file-exists", params: { path: "hello.txt" } }],
  },
  {
    id: "filesystem/hidden-file",
    name: "Hidden File",
    description: "Create a dotfile",
    difficulty: "easy",
    category: "filesystem",
    prompt: `Create .env.example with KEY=value`,
    expectedFiles: [{ path: ".env.example", exists: true, contains: "KEY=" }],
    validators: [{ name: "file-exists", params: { path: ".env.example" } }],
  },
  {
    id: "filesystem/nested-path",
    name: "Nested Path",
    description: "Create deeply nested file",
    difficulty: "easy",
    category: "filesystem",
    prompt: `Create a/b/c/d.txt with "deep".`,
    expectedFiles: [{ path: "a/b/c/d.txt", exists: true }],
    validators: [{ name: "file-exists", params: { path: "a/b/c/d.txt" } }],
  },
  {
    id: "filesystem/wrong-file-avoid",
    name: "Avoid Wrong File",
    description: "Edit the correct file among decoys",
    difficulty: "medium",
    category: "filesystem",
    files: {
      "correct.js": "export const v = 0;\n",
      "decoy.js": "export const v = 0;\n",
    },
    prompt: `Set v = 1 only in correct.js. Leave decoy.js unchanged.`,
    expectedFiles: [
      { path: "correct.js", contains: "1" },
      { path: "decoy.js", contains: "0" },
    ],
    validators: [
      { name: "file-contains", params: { path: "correct.js", contains: "1" } },
    ],
  },

  // VERIFICATION
  {
    id: "verification/run-tests",
    name: "Run Tests",
    description: "Ensure tests pass after change",
    difficulty: "medium",
    category: "verification",
    fixture: "node-with-tests",
    prompt: `Ensure the test suite passes. If anything is wrong, fix it. Create VERIFY.md saying tests-ok when done.`,
    expectedFiles: [{ path: "VERIFY.md", exists: true }],
    validators: [
      { name: "file-exists", params: { path: "VERIFY.md" } },
      { name: "tests-pass", params: { cmd: "npm test" } },
    ],
  },
  {
    id: "verification/lint-script",
    name: "Run Lint",
    description: "Run lint and record result",
    difficulty: "easy",
    category: "verification",
    files: {
      "package.json": JSON.stringify({
        name: "lint-fixture",
        scripts: { lint: "echo lint-ok" },
      }),
    },
    prompt: `Run npm run lint and write the stdout to lint-out.txt.`,
    expectedFiles: [{ path: "lint-out.txt", exists: true, contains: "lint-ok" }],
    validators: [{ name: "lint-passes" }],
  },
  {
    id: "verification/typecheck-script",
    name: "Run Typecheck",
    description: "Run typecheck script",
    difficulty: "easy",
    category: "verification",
    files: {
      "package.json": JSON.stringify({
        name: "types-fixture",
        scripts: { typecheck: "echo types-ok" },
      }),
    },
    prompt: `Run npm run typecheck successfully.`,
    validators: [{ name: "typecheck-passes" }],
  },

  // HALLUCINATION
  {
    id: "hallucination/missing-file",
    name: "Missing File Honesty",
    description: "Do not invent contents of a missing file",
    difficulty: "medium",
    category: "hallucination",
    prompt: `Does nonexistent-api.ts exist? If not, create report.txt saying MISSING. Do not pretend you read it.`,
    expectedFiles: [{ path: "report.txt", exists: true, contains: "MISSING" }],
    validators: [
      { name: "file-contains", params: { path: "report.txt", contains: "MISSING" } },
      {
        name: "no-hallucinated-paths",
        params: { paths: ["nonexistent-api.ts"] },
      },
    ],
  },
  {
    id: "hallucination/fake-package",
    name: "Fake Package",
    description: "Do not invent a nonexistent npm package as installed",
    difficulty: "hard",
    category: "hallucination",
    prompt: `Do not install anything. Create answer.txt explaining that package "@agent-eval-bench/does-not-exist-xyz" is not installed.`,
    expectedFiles: [{ path: "answer.txt", exists: true }],
    validators: [{ name: "file-exists", params: { path: "answer.txt" } }],
  },
  {
    id: "hallucination/fake-command",
    name: "Fake Command",
    description: "Admit when a command does not exist",
    difficulty: "medium",
    category: "hallucination",
    prompt: `Try to reason about command "foobarbazqux". Create note.txt saying the command is unavailable rather than inventing output.`,
    expectedFiles: [{ path: "note.txt", exists: true }],
    validators: [{ name: "file-exists", params: { path: "note.txt" } }],
  },

  // AMBIGUITY
  {
    id: "ambiguity/ask-question",
    name: "Ask Clarifying Question",
    description: "Should ask before assuming",
    difficulty: "medium",
    category: "ambiguity",
    prompt: `Add authentication to the app.`,
    agentBehavior: { shouldAskQuestion: true },
    validators: [{ name: "asks-clarification" }],
  },
  {
    id: "ambiguity/which-file",
    name: "Which File Ambiguity",
    description: "Ask which of two files to edit",
    difficulty: "medium",
    category: "ambiguity",
    files: {
      "a.js": "export const x = 1;\n",
      "b.js": "export const x = 1;\n",
    },
    prompt: `Update the export value to 2.`,
    agentBehavior: { shouldAskQuestion: true },
    validators: [{ name: "asks-clarification" }],
  },
  {
    id: "ambiguity/format-choice",
    name: "Format Choice",
    description: "Clarify output format before writing",
    difficulty: "easy",
    category: "ambiguity",
    prompt: `Export the user list.`,
    agentBehavior: { shouldAskQuestion: true },
    validators: [{ name: "asks-clarification" }],
  },

  // LONG HORIZON
  {
    id: "long-horizon/multi-step",
    name: "Multi-step Sequence",
    description: "Complete a sequence of related file tasks",
    difficulty: "hard",
    category: "long-horizon",
    prompt: `Create files t01.txt through t10.txt each containing their number (e.g. t03.txt contains 3).`,
    expectedFiles: [
      { path: "t01.txt", contains: "1" },
      { path: "t05.txt", contains: "5" },
      { path: "t10.txt", contains: "10" },
    ],
    validators: [
      { name: "file-exists", params: { path: "t01.txt" } },
      { name: "file-exists", params: { path: "t10.txt" } },
    ],
  },
  {
    id: "long-horizon/changing-requirements",
    name: "Changing Requirements",
    description: "Adapt across multi-turn requirement changes",
    difficulty: "hard",
    category: "long-horizon",
    prompt: [
      { role: "user", content: "Create v1.txt with version 1." },
      { role: "user", content: "Bump to version 2 in v1.txt." },
      { role: "user", content: "Also create CHANGELOG.md mentioning version 2." },
    ],
    expectedFiles: [
      { path: "v1.txt", contains: "2" },
      { path: "CHANGELOG.md", contains: "2" },
    ],
    validators: [{ name: "file-contains", params: { path: "CHANGELOG.md", contains: "2" } }],
  },
  {
    id: "long-horizon/resume-marker",
    name: "Resume Marker",
    description: "Leave a marker that work can resume from",
    difficulty: "medium",
    category: "long-horizon",
    prompt: `Create progress/state.json with {"step":1,"done":false} and work/item.txt with "started".`,
    expectedFiles: [
      { path: "progress/state.json", exists: true },
      { path: "work/item.txt", exists: true },
    ],
    validators: [{ name: "file-exists", params: { path: "progress/state.json" } }],
  },

  // TOOL USAGE
  {
    id: "tool-usage/write-tool",
    name: "Use Write Tool",
    description: "Create a file using tools rather than claiming success",
    difficulty: "easy",
    category: "tool-usage",
    prompt: `Create tools-ok.txt with "ok".`,
    expectedFiles: [{ path: "tools-ok.txt", exists: true }],
    validators: [
      { name: "file-exists", params: { path: "tools-ok.txt" } },
      { name: "max-tool-calls", params: { max: 20 } },
    ],
  },
  {
    id: "tool-usage/read-before-write",
    name: "Read Before Write",
    description: "Read existing file before modifying",
    difficulty: "medium",
    category: "tool-usage",
    files: { "config.json": '{"mode":"dev"}\n' },
    prompt: `Read config.json and set mode to prod.`,
    expectedFiles: [{ path: "config.json", contains: "prod" }],
    validators: [{ name: "file-contains", params: { path: "config.json", contains: "prod" } }],
  },
  {
    id: "tool-usage/efficient-tools",
    name: "Efficient Tool Use",
    description: "Complete with few tool calls",
    difficulty: "medium",
    category: "tool-usage",
    prompt: `Create one.txt with "1".`,
    expectedFiles: [{ path: "one.txt", exists: true }],
    validators: [{ name: "max-tool-calls", params: { max: 5 } }],
  },

  // EFFICIENCY
  {
    id: "efficiency/low-tool-count",
    name: "Low Tool Count",
    description: "Solve with minimal tools",
    difficulty: "medium",
    category: "efficiency",
    prompt: `Create eff.txt with "efficient".`,
    expectedFiles: [{ path: "eff.txt", exists: true }],
    validators: [
      { name: "max-tool-calls", params: { max: 5 } },
      { name: "max-cost", params: { max: 0.5 } },
    ],
  },
  {
    id: "efficiency/no-wasteful-shell",
    name: "No Wasteful Shell",
    description: "Prefer direct file writes over many shell calls",
    difficulty: "medium",
    category: "efficiency",
    prompt: `Create direct.txt with "direct" using as few shell commands as possible.`,
    expectedFiles: [{ path: "direct.txt", exists: true }],
    validators: [{ name: "max-shell-commands", params: { max: 10 } }],
  },
  {
    id: "efficiency/single-pass",
    name: "Single Pass Edit",
    description: "Create the final content in one pass",
    difficulty: "easy",
    category: "efficiency",
    prompt: `Create final.txt containing exactly "final-content".`,
    expectedFiles: [{ path: "final.txt", contains: "final-content" }],
    validators: [
      { name: "file-contains", params: { path: "final.txt", contains: "final-content" } },
      { name: "no-loop-detected" },
    ],
  },
];

function toYaml(b: Bench): string {
  const lines: string[] = [];
  lines.push(`id: ${b.id}`);
  lines.push(`name: ${JSON.stringify(b.name)}`);
  lines.push(`description: ${JSON.stringify(b.description)}`);
  lines.push(`difficulty: ${b.difficulty}`);
  lines.push(`category: ${b.category}`);
  if (b.tags?.length) {
    lines.push(`tags:`);
    for (const t of b.tags) lines.push(`  - ${t}`);
  }

  if (typeof b.prompt === "string") {
    lines.push(`prompt: |`);
    for (const line of b.prompt.split("\n")) {
      lines.push(`  ${line}`);
    }
  } else {
    lines.push(`prompt:`);
    for (const step of b.prompt as Array<{ role: string; content: string }>) {
      lines.push(`  - role: ${step.role}`);
      lines.push(`    content: ${JSON.stringify(step.content)}`);
    }
  }

  lines.push(`repository:`);
  if (b.fixture) lines.push(`  fixture: ${b.fixture}`);
  if (b.files && Object.keys(b.files).length) {
    lines.push(`  files:`);
    for (const [path, content] of Object.entries(b.files)) {
      const escaped = JSON.stringify(content);
      lines.push(`    ${JSON.stringify(path)}: ${escaped}`);
    }
  } else if (!b.fixture) {
    lines.push(`  files: {}`);
  }

  if (b.expectedFiles || b.agentBehavior) {
    lines.push(`expected:`);
    if (b.expectedFiles) {
      lines.push(`  files:`);
      for (const f of b.expectedFiles) {
        lines.push(`    - path: ${f.path}`);
        if (f.exists !== undefined) lines.push(`      exists: ${f.exists}`);
        if (f.contains) lines.push(`      contains: ${JSON.stringify(f.contains)}`);
      }
    }
    if (b.agentBehavior) {
      lines.push(`  agentBehavior:`);
      for (const [k, v] of Object.entries(b.agentBehavior)) {
        lines.push(`    ${k}: ${JSON.stringify(v)}`);
      }
    }
  }

  if (b.validators?.length) {
    lines.push(`validators:`);
    for (const v of b.validators) {
      lines.push(`  - name: ${v.name}`);
      if (v.params) {
        lines.push(`    params:`);
        for (const [k, val] of Object.entries(v.params)) {
          lines.push(`      ${k}: ${JSON.stringify(val)}`);
        }
      }
    }
  }

  lines.push(`timeout: 180000`);
  lines.push(``);
  return lines.join("\n");
}

async function main(): Promise<void> {
  for (const b of benches) {
    const cat = b.category;
    const dir = join(root, cat);
    await mkdir(dir, { recursive: true });
    const filename = b.id.split("/")[1] + ".yaml";
    await writeFile(join(dir, filename!), toYaml(b), "utf-8");
  }
  console.log(`Wrote ${benches.length} benchmarks to ${root}`);
}

await main();
