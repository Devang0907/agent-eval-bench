import { mkdtemp, rm, mkdir, writeFile, readFile, access, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { constants } from "node:fs";
import { execa } from "execa";
import type {
  Environment,
  Repository,
  SandboxHandle,
  SandboxInfo,
  SandboxProvider,
  SandboxExecResult,
  Registry,
} from "@agent-eval-bench/core";
import { SandboxError, shortId, errorMessage } from "@agent-eval-bench/core";
import { seedRepository, assertInsideWorkdir } from "./seed.js";

export class LocalSandbox implements SandboxHandle {
  readonly info: SandboxInfo;
  private destroyed = false;

  constructor(workdir: string, id: string) {
    this.info = { id, workdir, provider: "local" };
  }

  private ensureAlive(): void {
    if (this.destroyed) {
      throw new SandboxError("Sandbox has been destroyed", { id: this.info.id });
    }
  }

  async exec(
    cmd: string,
    args: string[] = [],
    opts?: { timeout?: number; cwd?: string },
  ): Promise<SandboxExecResult> {
    this.ensureAlive();
    const cwd = opts?.cwd
      ? assertInsideWorkdir(this.info.workdir, opts.cwd)
      : this.info.workdir;
    const start = Date.now();
    try {
      const result = await execa(cmd, args, {
        cwd,
        reject: false,
        timeout: opts?.timeout ?? 60_000,
        env: { ...process.env, HOME: this.info.workdir },
        all: false,
      });
      return {
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
        exitCode: result.exitCode ?? 1,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      return {
        stdout: "",
        stderr: errorMessage(err),
        exitCode: 1,
        durationMs: Date.now() - start,
      };
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.ensureAlive();
    const full = assertInsideWorkdir(this.info.workdir, path);
    await mkdir(join(full, ".."), { recursive: true });
    await writeFile(full, content, "utf-8");
  }

  async readFile(path: string): Promise<string | null> {
    this.ensureAlive();
    const full = assertInsideWorkdir(this.info.workdir, path);
    try {
      return await readFile(full, "utf-8");
    } catch {
      return null;
    }
  }

  async exists(path: string): Promise<boolean> {
    this.ensureAlive();
    const full = assertInsideWorkdir(this.info.workdir, path);
    try {
      await access(full, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(globPattern?: string): Promise<string[]> {
    this.ensureAlive();
    const files: string[] = [];
    await walk(this.info.workdir, this.info.workdir, files);
    if (!globPattern) return files;
    const re = globToRegExp(globPattern);
    return files.filter((f) => re.test(f));
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    try {
      await rm(this.info.workdir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
}

export class LocalSandboxProvider implements SandboxProvider {
  readonly name = "local";

  async create(opts: {
    environment?: Partial<Environment>;
    repository?: Repository;
    runId: string;
    benchmarkId: string;
  }): Promise<SandboxHandle> {
    const id = `local-${shortId()}`;
    const workdir = await mkdtemp(join(tmpdir(), `agent-eval-bench-${id}-`));
    const sandbox = new LocalSandbox(workdir, id);
    await seedRepository(sandbox, opts.repository);
    return sandbox;
  }
}

async function walk(root: string, dir: string, out: string[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(root, full, out);
    } else if (entry.isFile()) {
      out.push(relative(root, full).split(sep).join("/"));
    }
  }
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/{{GLOBSTAR}}/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

export function registerLocalSandbox(registry: Registry): void {
  registry.registerSandbox(new LocalSandboxProvider(), { default: true });
}
