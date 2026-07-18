import type { AdapterCapabilities, AdapterConfig } from "../schemas/adapter.js";
import type { Prompt } from "../schemas/benchmark.js";

/** Message exchanged with an agent */
export interface AgentMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCallId?: string;
  name?: string;
  timestamp?: number;
}

/** Result of a tool call invocation */
export interface ToolCallResult {
  toolCallId: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
  durationMs?: number;
}

/** Response from sendPrompt */
export interface AgentResponse {
  content: string;
  toolCalls?: ToolCallResult[];
  finishReason?: "stop" | "tool_calls" | "length" | "interrupt" | "error";
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd?: number;
  };
  raw?: unknown;
}

/** Context provided when initializing an adapter inside a sandbox */
export interface AdapterContext {
  workdir: string;
  env: Record<string, string>;
  runId: string;
  benchmarkId: string;
  signal?: AbortSignal;
  /** Sandbox handle for adapters that execute tools locally */
  sandbox?: import("./sandbox.js").SandboxHandle;
  /** Event bus for emitting adapter-level telemetry */
  bus?: import("../events/event-bus.js").EventBus;
}

/**
 * Abstract adapter contract.
 * Every coding agent (CLI, HTTP, MCP, OpenAI-compatible) implements this.
 */
export interface AgentAdapter {
  readonly name: string;
  readonly config: AdapterConfig;
  readonly capabilities: AdapterCapabilities;

  /** Prepare the adapter (spawn process, open connection, etc.) */
  initialize(ctx: AdapterContext): Promise<void>;

  /** Send a prompt (string or multi-turn) and await the response */
  sendPrompt(prompt: Prompt): Promise<AgentResponse>;

  /** Invoke a tool call on behalf of the agent (optional mid-loop) */
  toolCall(name: string, args: Record<string, unknown>): Promise<ToolCallResult>;

  /** Interrupt the current agent turn */
  interrupt(): Promise<void>;

  /** Resume after an interrupt */
  resume(prompt?: string): Promise<AgentResponse>;

  /** Tear down resources */
  shutdown(): Promise<void>;
}

/** Factory that creates an adapter from config */
export type AdapterFactory = (config: AdapterConfig) => AgentAdapter;
