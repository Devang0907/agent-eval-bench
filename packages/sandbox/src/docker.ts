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
import { seedRepository } from "./seed.js";
import { shellQuote, shellQuoteAll } from "./quote.js";

const DEFAULT_IMAGE = "agent-eval-bench/sandbox:latest";
const FALLBACK_IMAGE = "node:22-bookworm-slim";

export class DockerSandbox implements SandboxHandle {
  readonly info: SandboxInfo;
  private destroyed = false;
  private readonly containerId: string;

  constructor(containerId: string, workdir: string, id: string) {
    this.containerId = containerId;
    this.info = { id, workdir, provider: "docker" };
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
    const cwd = opts?.cwd ?? this.info.workdir;
    const start = Date.now();
    const quoted = shellQuoteAll([cmd, ...args]);
    try {
      const result = await execa(
        "docker",
        ["exec", "-w", cwd, this.containerId, "bash", "-lc", quoted],
        {
          reject: false,
          timeout: opts?.timeout ?? 120_000,
        },
      );
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
    const full = path.startsWith("/") ? path : `${this.info.workdir}/${path}`;
    const dir = full.includes("/") ? full.slice(0, full.lastIndexOf("/")) : this.info.workdir;
    await this.exec("mkdir", ["-p", dir]);
    // Use docker exec with a here-doc via printf/base64 to avoid injection
    const b64 = Buffer.from(content, "utf-8").toString("base64");
    const result = await this.exec("bash", [
      "-lc",
      `echo ${shellQuote(b64)} | base64 -d > ${shellQuote(full)}`,
    ]);
    if (result.exitCode !== 0) {
      throw new SandboxError(`Failed to write file: ${path}`, {
        stderr: result.stderr,
      });
    }
  }

  async readFile(path: string): Promise<string | null> {
    this.ensureAlive();
    const full = path.startsWith("/") ? path : `${this.info.workdir}/${path}`;
    const result = await this.exec("cat", [full]);
    if (result.exitCode !== 0) return null;
    return result.stdout;
  }

  async exists(path: string): Promise<boolean> {
    this.ensureAlive();
    const full = path.startsWith("/") ? path : `${this.info.workdir}/${path}`;
    const result = await this.exec("test", ["-e", full]);
    return result.exitCode === 0;
  }

  async listFiles(globPattern?: string): Promise<string[]> {
    this.ensureAlive();
    const pattern = globPattern ?? "**/*";
    const result = await this.exec("bash", [
      "-lc",
      `cd ${shellQuote(this.info.workdir)} && find . -type f ! -path './.git/*' | sed 's|^\\./||'`,
    ]);
    const files = result.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!globPattern || pattern === "**/*") return files;
    const re = globToRegExp(globPattern);
    return files.filter((f) => re.test(f));
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    try {
      await execa("docker", ["rm", "-f", this.containerId], { reject: false });
    } catch {
      // best-effort
    }
  }
}

export class DockerSandboxProvider implements SandboxProvider {
  readonly name = "docker";

  async isAvailable(): Promise<boolean> {
    try {
      const r = await execa("docker", ["info"], { reject: false, timeout: 10_000 });
      return r.exitCode === 0;
    } catch {
      return false;
    }
  }

  async create(opts: {
    environment?: Partial<Environment>;
    repository?: Repository;
    runId: string;
    benchmarkId: string;
  }): Promise<SandboxHandle> {
    const env = opts.environment ?? {};
    const workdir = env.workdir ?? "/workspace";
    const id = `ab-${shortId()}`;
    const image = env.image ?? DEFAULT_IMAGE;
    const resolvedImage = await resolveImage(image);

    const dockerArgs = [
      "run",
      "-d",
      "--name",
      id,
      "--rm",
      "-w",
      workdir,
      "--cpus",
      String(env.cpus ?? 2),
      "--memory",
      env.memory ?? "2g",
    ];

    if (env.network === "none" || env.network === undefined) {
      dockerArgs.push("--network", "none");
    } else if (env.network === "full") {
      dockerArgs.push("--network", "bridge");
    }

    for (const [k, v] of Object.entries(env.env ?? {})) {
      dockerArgs.push("-e", `${k}=${v}`);
    }

    dockerArgs.push(resolvedImage, "sleep", "infinity");

    const create = await execa("docker", dockerArgs, { reject: false });
    if (create.exitCode !== 0) {
      throw new SandboxError(`Failed to create Docker container: ${create.stderr}`, {
        stderr: create.stderr,
      });
    }

    const containerId = (create.stdout || id).trim();
    const sandbox = new DockerSandbox(containerId, workdir, id);

    // Ensure workdir + git exist
    await sandbox.exec("mkdir", ["-p", workdir]);
    await sandbox.exec("bash", [
      "-lc",
      "command -v git >/dev/null || (apt-get update -qq && apt-get install -y -qq git >/dev/null)",
    ]);

    await seedRepository(sandbox, opts.repository);
    return sandbox;
  }
}

async function resolveImage(preferred: string): Promise<string> {
  const check = await execa("docker", ["image", "inspect", preferred], { reject: false });
  if (check.exitCode === 0) return preferred;

  if (preferred !== FALLBACK_IMAGE) {
    const fallback = await execa("docker", ["image", "inspect", FALLBACK_IMAGE], {
      reject: false,
    });
    if (fallback.exitCode === 0) return FALLBACK_IMAGE;

    // Pull fallback
    const pull = await execa("docker", ["pull", FALLBACK_IMAGE], {
      reject: false,
      timeout: 300_000,
    });
    if (pull.exitCode === 0) return FALLBACK_IMAGE;
  }

  throw new SandboxError(
    `Docker image not available: ${preferred}. Pull ${FALLBACK_IMAGE} or build agent-eval-bench/sandbox:latest`,
  );
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

export function registerDockerSandbox(registry: Registry): void {
  registry.registerSandbox(new DockerSandboxProvider());
}
