import type {
  AdapterConfig,
  AdapterContext,
  AgentAdapter,
  SandboxHandle,
  SandboxInfo,
  SandboxExecResult,
} from "@agent-eval-bench/core";
import { EventBus } from "@agent-eval-bench/core";

/** In-memory fake sandbox for adapter unit tests */
export class FakeSandbox implements SandboxHandle {
  readonly info: SandboxInfo;
  readonly files = new Map<string, string>();
  readonly commands: Array<{ cmd: string; args: string[] }> = [];

  constructor(workdir = "/workspace") {
    this.info = { id: "fake", workdir, provider: "local" };
  }

  async exec(cmd: string, args: string[] = []): Promise<SandboxExecResult> {
    this.commands.push({ cmd, args });
    return { stdout: "", stderr: "", exitCode: 0, durationMs: 1 };
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string | null> {
    return this.files.get(path) ?? null;
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async listFiles(glob?: string): Promise<string[]> {
    const keys = [...this.files.keys()];
    if (!glob) return keys;
    return keys.filter((k) => k.includes(glob.replace(/\*/g, "")));
  }

  async destroy(): Promise<void> {}
}

export function createTestContext(
  overrides?: Partial<AdapterContext> & { sandbox?: SandboxHandle },
): AdapterContext {
  const sandbox = overrides?.sandbox ?? new FakeSandbox();
  return {
    workdir: sandbox.info.workdir,
    env: {},
    runId: "test-run",
    benchmarkId: "test-bench",
    sandbox,
    bus: new EventBus(),
    ...overrides,
  };
}

/**
 * Minimal conformance checks every adapter must satisfy.
 */
export async function assertAdapterContract(
  adapter: AgentAdapter,
  ctx?: AdapterContext,
): Promise<void> {
  const context = ctx ?? createTestContext();
  await adapter.initialize(context);

  if (!adapter.name) throw new Error("adapter.name is required");
  if (!adapter.config) throw new Error("adapter.config is required");
  if (!adapter.capabilities) throw new Error("adapter.capabilities is required");

  const response = await adapter.sendPrompt("Say hello.");
  if (typeof response.content !== "string") {
    throw new Error("sendPrompt must return content: string");
  }

  const tool = await adapter.toolCall("list_files", {});
  if (!tool.toolCallId || !tool.name) {
    throw new Error("toolCall must return toolCallId and name");
  }

  if (adapter.capabilities.supportsInterrupt) {
    await adapter.interrupt();
  }

  if (adapter.capabilities.supportsResume) {
    const resumed = await adapter.resume("Continue.");
    if (typeof resumed.content !== "string") {
      throw new Error("resume must return content: string");
    }
  }

  await adapter.shutdown();
}

export function mockConfig(overrides?: Partial<AdapterConfig>): AdapterConfig {
  return {
    name: "mock",
    type: "mock",
    ...overrides,
  };
}
