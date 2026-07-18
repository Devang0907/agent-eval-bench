import { execa } from "execa";
import type { AdapterConfig, AgentResponse, ToolCallResult } from "@agent-eval-bench/core";
import { BaseAdapter } from "./base.js";

type ChildHandle = { kill: (signal?: string) => void };

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

/**
 * Claude Code CLI adapter.
 * Invokes `claude -p --output-format stream-json` (or configured command).
 */
export class ClaudeCodeAdapter extends BaseAdapter {
  private child: ChildHandle | null = null;

  constructor(config: AdapterConfig) {
    super(config, {
      supportsInterrupt: true,
      supportsResume: true,
      supportsStreaming: true,
      supportsToolCalls: true,
    });
  }

  protected async onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse> {
    const command = this.config.command ?? "claude";
    const prompt = steps.map((s) => s.content).join("\n\n");
    const args = [
      ...(this.config.args ?? ["-p", "--output-format", "stream-json", "--verbose"]),
      prompt,
    ];

    const proc = execa(command, args, {
      cwd: this.context.workdir,
      env: { ...process.env, ...this.config.env, ...this.context.env },
      reject: false,
      timeout: this.config.timeout ?? 600_000,
    });
    this.child = proc as unknown as ChildHandle;

    const result = await proc;
    this.child = null;

    const stdout = asString(result.stdout);
    const stderr = asString(result.stderr);
    const parsed = parseStreamJson(stdout);

    if (this.aborted) {
      return {
        content: parsed.content,
        finishReason: "interrupt",
        ...(parsed.usage ? { usage: parsed.usage } : {}),
      };
    }
    if (result.exitCode !== 0) {
      return {
        content: parsed.content || stderr || "",
        finishReason: "error",
        raw: { exitCode: result.exitCode, stderr },
      };
    }
    return {
      content: parsed.content,
      toolCalls: parsed.toolCalls,
      finishReason: "stop",
      ...(parsed.usage ? { usage: parsed.usage } : {}),
      raw: parsed.raw,
    };
  }

  protected override async onInterrupt(): Promise<void> {
    this.child?.kill("SIGTERM");
  }

  protected override async onToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolCallResult> {
    return {
      toolCallId: crypto.randomUUID(),
      name,
      arguments: args,
      error: "Claude Code executes tools inside its own process",
    };
  }

  protected override async onResume(prompt?: string): Promise<AgentResponse> {
    const command = this.config.command ?? "claude";
    const args = ["--continue", ...(prompt ? ["-p", prompt] : [])];
    const result = await execa(command, args, {
      cwd: this.context.workdir,
      env: { ...process.env, ...this.config.env },
      reject: false,
      timeout: this.config.timeout ?? 600_000,
    });
    const parsed = parseStreamJson(asString(result.stdout));
    return {
      content: parsed.content || asString(result.stdout) || "",
      finishReason: result.exitCode === 0 ? "stop" : "error",
      ...(parsed.usage ? { usage: parsed.usage } : {}),
    };
  }
}

function parseStreamJson(stdout: string): {
  content: string;
  toolCalls: ToolCallResult[];
  usage?: AgentResponse["usage"];
  raw: unknown[];
} {
  const lines = stdout.split("\n").filter((l) => l.trim().startsWith("{"));
  const events: unknown[] = [];
  let content = "";
  const toolCalls: ToolCallResult[] = [];
  let usage: AgentResponse["usage"];

  for (const line of lines) {
    try {
      const ev = JSON.parse(line) as Record<string, unknown>;
      events.push(ev);
      const type = String(ev["type"] ?? "");
      if (type === "assistant" || type === "text" || type === "result") {
        const msg = ev["message"] as { content?: unknown } | undefined;
        const text =
          (typeof ev["result"] === "string" ? ev["result"] : null) ??
          (typeof ev["content"] === "string" ? ev["content"] : null) ??
          (typeof msg?.content === "string" ? msg.content : null);
        if (text) content += text;
      }
      if (type === "tool_use" || type === "tool_call") {
        toolCalls.push({
          toolCallId: String(ev["id"] ?? crypto.randomUUID()),
          name: String(ev["name"] ?? "unknown"),
          arguments: (ev["input"] as Record<string, unknown>) ?? {},
        });
      }
      if (ev["usage"] && typeof ev["usage"] === "object") {
        const u = ev["usage"] as Record<string, number>;
        usage = {
          promptTokens: u["input_tokens"] ?? u["prompt_tokens"] ?? 0,
          completionTokens: u["output_tokens"] ?? u["completion_tokens"] ?? 0,
          totalTokens:
            (u["input_tokens"] ?? 0) +
            (u["output_tokens"] ?? 0) +
            (u["total_tokens"] ?? 0),
        };
      }
    } catch {
      // skip non-json lines
    }
  }

  if (!content && stdout.trim() && lines.length === 0) {
    content = stdout.trim();
  }

  return { content, toolCalls, usage, raw: events };
}
