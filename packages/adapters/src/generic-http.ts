import type { AdapterConfig, AgentResponse, ToolCallResult } from "@agent-eval-bench/core";
import { AdapterError } from "@agent-eval-bench/core";
import { BaseAdapter } from "./base.js";

interface HttpSession {
  sessionId: string;
}

function fetchInit(init: {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}): RequestInit {
  const out: RequestInit = {
    method: init.method,
    headers: init.headers,
  };
  if (init.body !== undefined) out.body = init.body;
  if (init.signal) out.signal = init.signal;
  return out;
}

/**
 * Generic HTTP adapter for agents exposing a simple REST session API.
 */
export class GenericHttpAdapter extends BaseAdapter {
  private session: HttpSession | null = null;

  constructor(config: AdapterConfig) {
    super(config, {
      supportsInterrupt: true,
      supportsResume: true,
      supportsStreaming: false,
    });
  }

  protected override async onInitialize(): Promise<void> {
    const baseUrl = this.requireBaseUrl();
    const res = await fetch(
      `${baseUrl}/sessions`,
      fetchInit({
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          workdir: this.context.workdir,
          runId: this.context.runId,
          benchmarkId: this.context.benchmarkId,
        }),
        signal: this.context.signal,
      }),
    );
    if (!res.ok) {
      throw new AdapterError(`HTTP session create failed: ${res.status}`, {
        body: await res.text(),
      });
    }
    const data = (await res.json()) as { sessionId: string };
    this.session = { sessionId: data.sessionId };
  }

  protected async onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse> {
    if (!this.session) throw new AdapterError("HTTP session not initialized");
    const baseUrl = this.requireBaseUrl();
    const prompt = steps.map((s) => s.content).join("\n\n");

    const res = await fetch(
      `${baseUrl}/sessions/${this.session.sessionId}/prompt`,
      fetchInit({
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ prompt, steps }),
        signal: this.context.signal,
      }),
    );

    if (!res.ok) {
      return {
        content: await res.text(),
        finishReason: "error",
      };
    }

    const data = (await res.json()) as AgentResponse;
    const response: AgentResponse = {
      content: data.content ?? "",
      finishReason: data.finishReason ?? "stop",
      raw: data,
    };
    if (data.toolCalls) response.toolCalls = data.toolCalls;
    if (data.usage) response.usage = data.usage;
    return response;
  }

  protected override async onInterrupt(): Promise<void> {
    if (!this.session) return;
    const baseUrl = this.requireBaseUrl();
    await fetch(
      `${baseUrl}/sessions/${this.session.sessionId}/interrupt`,
      fetchInit({ method: "POST", headers: this.headers() }),
    ).catch(() => undefined);
  }

  protected override async onResume(prompt?: string): Promise<AgentResponse> {
    if (prompt) return this.sendPrompt(prompt);
    return { content: "", finishReason: "stop" };
  }

  protected override async onToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolCallResult> {
    if (!this.session) {
      return { toolCallId: crypto.randomUUID(), name, arguments: args, error: "No session" };
    }
    const baseUrl = this.requireBaseUrl();
    const res = await fetch(
      `${baseUrl}/sessions/${this.session.sessionId}/tools`,
      fetchInit({
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ name, arguments: args }),
      }),
    );
    if (!res.ok) {
      return {
        toolCallId: crypto.randomUUID(),
        name,
        arguments: args,
        error: await res.text(),
      };
    }
    return (await res.json()) as ToolCallResult;
  }

  protected override async onShutdown(): Promise<void> {
    if (!this.session) return;
    const baseUrl = this.config.baseUrl;
    if (!baseUrl) return;
    await fetch(
      `${baseUrl.replace(/\/$/, "")}/sessions/${this.session.sessionId}`,
      fetchInit({ method: "DELETE", headers: this.headers() }),
    ).catch(() => undefined);
    this.session = null;
  }

  private requireBaseUrl(): string {
    if (!this.config.baseUrl) {
      throw new AdapterError("HTTP adapter requires config.baseUrl");
    }
    return this.config.baseUrl.replace(/\/$/, "");
  }

  private headers(): Record<string, string> {
    return {
      "content-type": "application/json",
      ...(this.config.apiKey ? { authorization: `Bearer ${this.config.apiKey}` } : {}),
      ...this.config.headers,
    };
  }
}
