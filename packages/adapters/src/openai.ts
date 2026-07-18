import type { AdapterConfig, AgentResponse, ToolCallResult } from "@agent-eval-bench/core";
import { AdapterError } from "@agent-eval-bench/core";
import { BaseAdapter } from "./base.js";
import { executeSandboxTool, STANDARD_TOOLS } from "./tools.js";

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

/**
 * OpenAI-compatible chat completions adapter with tool-call loop.
 */
export class OpenAIAdapter extends BaseAdapter {
  private messages: ChatMessage[] = [];

  constructor(config: AdapterConfig, capabilities?: ConstructorParameters<typeof BaseAdapter>[1]) {
    super(config, {
      supportsInterrupt: true,
      supportsResume: true,
      supportsToolCalls: true,
      supportsStreaming: false,
      ...capabilities,
    });
  }

  protected override async onInitialize(): Promise<void> {
    this.messages = [];
  }

  protected async onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse> {
    for (const step of steps) {
      if (step.delayMs) await Bun.sleep(step.delayMs);
      this.messages.push({ role: step.role, content: step.content });
    }

    const allToolCalls: ToolCallResult[] = [];
    let lastContent = "";
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };
    const maxRounds = Number(this.config.options?.["maxRounds"] ?? 20);

    for (let round = 0; round < maxRounds; round++) {
      if (this.aborted) {
        return { content: lastContent, toolCalls: allToolCalls, finishReason: "interrupt", usage };
      }

      const data = await this.chatCompletion(this.messages);
      const choice = data.choices?.[0];
      const msg = choice?.message;
      if (!msg) {
        return { content: lastContent, toolCalls: allToolCalls, finishReason: "error", usage };
      }

      if (data.usage) {
        usage = {
          promptTokens: usage.promptTokens + (data.usage.prompt_tokens ?? 0),
          completionTokens: usage.completionTokens + (data.usage.completion_tokens ?? 0),
          totalTokens: usage.totalTokens + (data.usage.total_tokens ?? 0),
          costUsd: usage.costUsd,
        };
      }

      lastContent = msg.content ?? lastContent;
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: msg.content,
      };
      if (msg.tool_calls) assistantMsg.tool_calls = msg.tool_calls;
      this.messages.push(assistantMsg);

      if (!msg.tool_calls?.length) {
        return {
          content: lastContent ?? "",
          toolCalls: allToolCalls,
          finishReason: choice?.finish_reason === "length" ? "length" : "stop",
          usage,
          raw: data,
        };
      }

      for (const tc of msg.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(tc.function.arguments || "{}") as Record<string, unknown>;
        } catch {
          args = {};
        }
        const result = await executeSandboxTool(this.context, tc.function.name, args);
        allToolCalls.push(result);
        this.messages.push({
          role: "tool",
          content: JSON.stringify(result.result ?? { error: result.error }),
          tool_call_id: tc.id,
        });
      }
    }

    return {
      content: lastContent,
      toolCalls: allToolCalls,
      finishReason: "length",
      usage,
    };
  }

  protected override async onToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolCallResult> {
    return executeSandboxTool(this.context, name, args);
  }

  protected override async onResume(prompt?: string): Promise<AgentResponse> {
    if (prompt) return this.sendPrompt(prompt);
    return this.sendPrompt("Please continue.");
  }

  private async chatCompletion(messages: ChatMessage[]): Promise<{
    choices?: Array<{
      finish_reason?: string;
      message?: {
        content: string | null;
        tool_calls?: ChatMessage["tool_calls"];
      };
    }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  }> {
    const baseUrl = (this.config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const apiKey = this.config.apiKey ?? process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      throw new AdapterError("OpenAI adapter requires apiKey or OPENAI_API_KEY");
    }

    const init: RequestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        ...this.config.headers,
      },
      body: JSON.stringify({
        model: this.config.model ?? "gpt-4o-mini",
        messages,
        tools: STANDARD_TOOLS,
        tool_choice: "auto",
      }),
    };
    if (this.context.signal) init.signal = this.context.signal;

    const res = await fetch(`${baseUrl}/chat/completions`, init);

    if (!res.ok) {
      throw new AdapterError(`OpenAI API error: ${res.status}`, {
        body: await res.text(),
      });
    }

    return (await res.json()) as {
      choices?: Array<{
        finish_reason?: string;
        message?: {
          content: string | null;
          tool_calls?: ChatMessage["tool_calls"];
        };
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
      };
    };
  }
}
