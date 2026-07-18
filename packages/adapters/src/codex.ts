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
 * OpenAI Codex CLI adapter (`codex exec --json`).
 */
export class CodexAdapter extends BaseAdapter {
  private child: ChildHandle | null = null;

  constructor(config: AdapterConfig) {
    super(config, {
      supportsInterrupt: true,
      supportsResume: false,
      supportsStreaming: true,
      supportsToolCalls: true,
    });
  }

  protected async onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse> {
    const command = this.config.command ?? "codex";
    const prompt = steps.map((s) => s.content).join("\n\n");
    const args = [...(this.config.args ?? ["exec", "--json"]), prompt];

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
    const parsed = parseCodexJson(stdout);

    if (this.aborted) {
      return { content: parsed.content, finishReason: "interrupt" };
    }
    return {
      content: parsed.content || stdout || "",
      toolCalls: parsed.toolCalls,
      finishReason: result.exitCode === 0 ? "stop" : "error",
      ...(parsed.usage ? { usage: parsed.usage } : {}),
      raw: { stderr, exitCode: result.exitCode },
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
      error: "Codex executes tools inside its own process",
    };
  }
}

function parseCodexJson(stdout: string): {
  content: string;
  toolCalls: ToolCallResult[];
  usage?: AgentResponse["usage"];
} {
  const toolCalls: ToolCallResult[] = [];
  let content = "";
  let usage: AgentResponse["usage"];

  for (const line of stdout.split("\n")) {
    const t = line.trim();
    if (!t.startsWith("{")) continue;
    try {
      const ev = JSON.parse(t) as Record<string, unknown>;
      const type = String(ev["type"] ?? ev["event"] ?? "");
      if (type.includes("message") || type === "agent_message" || type === "item.completed") {
        const text =
          (typeof ev["text"] === "string" ? ev["text"] : null) ??
          (typeof ev["content"] === "string" ? ev["content"] : null) ??
          (typeof (ev["item"] as { text?: string } | undefined)?.text === "string"
            ? (ev["item"] as { text: string }).text
            : null);
        if (text) content += text;
      }
      if (type.includes("tool") || type === "command") {
        toolCalls.push({
          toolCallId: String(ev["id"] ?? crypto.randomUUID()),
          name: String(ev["name"] ?? ev["command"] ?? "tool"),
          arguments: (ev["arguments"] as Record<string, unknown>) ?? {},
        });
      }
      if (ev["usage"]) {
        const u = ev["usage"] as Record<string, number>;
        usage = {
          promptTokens: u["input_tokens"] ?? u["prompt_tokens"] ?? 0,
          completionTokens: u["output_tokens"] ?? u["completion_tokens"] ?? 0,
          totalTokens: u["total_tokens"] ?? 0,
        };
      }
    } catch {
      // ignore
    }
  }

  if (!content) content = stdout.trim();
  return { content, toolCalls, usage };
}
