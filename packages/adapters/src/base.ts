import type {
  AdapterCapabilities,
  AdapterConfig,
  AdapterContext,
  AgentAdapter,
  AgentResponse,
  Prompt,
  ToolCallResult,
} from "@agent-eval-bench/core";
import { AdapterError, promptSteps } from "@agent-eval-bench/core";

const DEFAULT_CAPABILITIES: AdapterCapabilities = {
  supportsInterrupt: false,
  supportsResume: false,
  supportsMcp: false,
  supportsStreaming: false,
  supportsToolCalls: true,
  supportsMultiTurn: true,
  supportsFiles: true,
  supportsShell: true,
};

/**
 * Shared lifecycle helpers for all adapters.
 */
export abstract class BaseAdapter implements AgentAdapter {
  readonly name: string;
  readonly config: AdapterConfig;
  readonly capabilities: AdapterCapabilities;

  protected ctx: AdapterContext | null = null;
  protected aborted = false;
  protected initialized = false;

  constructor(config: AdapterConfig, capabilities?: Partial<AdapterCapabilities>) {
    this.name = config.name;
    this.config = config;
    this.capabilities = {
      ...DEFAULT_CAPABILITIES,
      ...config.capabilities,
      ...capabilities,
    };
  }

  async initialize(ctx: AdapterContext): Promise<void> {
    this.ctx = ctx;
    this.aborted = false;
    this.initialized = true;
    await this.onInitialize(ctx);
  }

  async sendPrompt(prompt: Prompt): Promise<AgentResponse> {
    this.ensureReady();
    if (this.aborted) {
      throw new AdapterError("Adapter was interrupted", { adapter: this.name });
    }
    const steps = promptSteps(prompt);
    return this.onSendPrompt(steps);
  }

  async toolCall(name: string, args: Record<string, unknown>): Promise<ToolCallResult> {
    this.ensureReady();
    return this.onToolCall(name, args);
  }

  async interrupt(): Promise<void> {
    this.aborted = true;
    await this.onInterrupt();
  }

  async resume(prompt?: string): Promise<AgentResponse> {
    this.aborted = false;
    if (!this.capabilities.supportsResume) {
      throw new AdapterError(`Adapter "${this.name}" does not support resume`);
    }
    return this.onResume(prompt);
  }

  async shutdown(): Promise<void> {
    await this.onShutdown();
    this.initialized = false;
    this.ctx = null;
  }

  protected ensureReady(): void {
    if (!this.initialized || !this.ctx) {
      throw new AdapterError(`Adapter "${this.name}" is not initialized`);
    }
  }

  protected get context(): AdapterContext {
    this.ensureReady();
    return this.ctx!;
  }

  protected abstract onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse>;

  protected async onInitialize(_ctx: AdapterContext): Promise<void> {}
  protected async onToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolCallResult> {
    return {
      toolCallId: crypto.randomUUID(),
      name,
      arguments: args,
      error: `Tool "${name}" not supported by ${this.name}`,
    };
  }
  protected async onInterrupt(): Promise<void> {}
  protected async onResume(prompt?: string): Promise<AgentResponse> {
    if (prompt) return this.sendPrompt(prompt);
    return { content: "", finishReason: "stop" };
  }
  protected async onShutdown(): Promise<void> {}
}
