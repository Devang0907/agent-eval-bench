import type { Environment, Repository } from "../schemas/benchmark.js";

export interface SandboxExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface SandboxInfo {
  id: string;
  workdir: string;
  provider: "docker" | "local";
}

/**
 * Sandbox provider contract.
 * Every test runs in an isolated environment (Docker or Local).
 */
export interface SandboxProvider {
  readonly name: string;

  /** Create a fresh sandbox with optional repo fixture */
  create(opts: {
    environment?: Partial<Environment>;
    repository?: Repository;
    runId: string;
    benchmarkId: string;
  }): Promise<SandboxHandle>;
}

export interface SandboxHandle {
  readonly info: SandboxInfo;

  exec(cmd: string, args?: string[], opts?: { timeout?: number; cwd?: string }): Promise<SandboxExecResult>;
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string | null>;
  exists(path: string): Promise<boolean>;
  listFiles(glob?: string): Promise<string[]>;
  destroy(): Promise<void>;
}
