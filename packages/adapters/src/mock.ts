import type { AdapterConfig, AgentResponse, ToolCallResult } from "@agent-eval-bench/core";
import { BaseAdapter } from "./base.js";
import { executeSandboxTool } from "./tools.js";

export type MockScriptAction =
  | { type: "respond"; content: string }
  | { type: "tool"; name: string; args: Record<string, unknown> }
  | { type: "write"; path: string; content: string }
  | { type: "ask"; content: string }
  | { type: "fail"; message: string }
  | { type: "delay"; ms: number };

export interface MockAdapterOptions {
  /** Scripted actions executed in order across sendPrompt calls */
  script?: MockScriptAction[];
  /** If true, auto-write expected files from benchmark when no script */
  autoSucceed?: boolean;
}

/**
 * Deterministic mock adapter for tests and CI — never calls a real agent.
 */
export class MockAdapter extends BaseAdapter {
  private readonly script: MockScriptAction[];
  private cursor = 0;
  private readonly autoSucceed: boolean;

  constructor(config: AdapterConfig) {
    super(config, {
      supportsInterrupt: true,
      supportsResume: true,
      supportsToolCalls: true,
    });
    const opts = (config.options ?? {}) as MockAdapterOptions;
    this.script = opts.script ?? [];
    this.autoSucceed = opts.autoSucceed ?? true;
  }

  protected async onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse> {
    const toolCalls: ToolCallResult[] = [];

    if (this.script.length > 0) {
      while (this.cursor < this.script.length) {
        const action = this.script[this.cursor]!;
        this.cursor++;

        switch (action.type) {
          case "delay":
            await Bun.sleep(action.ms);
            break;
          case "respond":
            return { content: action.content, toolCalls, finishReason: "stop" };
          case "ask":
            return { content: action.content, toolCalls, finishReason: "stop" };
          case "fail":
            return {
              content: action.message,
              toolCalls,
              finishReason: "error",
            };
          case "write": {
            const result = await executeSandboxTool(this.context, "write_file", {
              path: action.path,
              content: action.content,
            });
            toolCalls.push(result);
            break;
          }
          case "tool": {
            const result = await executeSandboxTool(this.context, action.name, action.args);
            toolCalls.push(result);
            break;
          }
        }
      }
      return {
        content: toolCalls.length ? "Completed scripted actions." : "Done.",
        toolCalls,
        finishReason: "stop",
      };
    }

    // Auto-succeed: best-effort file creation from prompt text (CI / demos)
    if (this.autoSucceed) {
      const last = steps[steps.length - 1]?.content ?? "";
      const allText = steps.map((s) => s.content).join("\n");
      if (this.context.sandbox) {
        for (const { path, content } of extractFileWrites(allText)) {
          const result = await executeSandboxTool(this.context, "write_file", {
            path,
            content,
          });
          toolCalls.push(result);
        }
      }
      // Ambiguity: ask a clarifying question when the prompt is vague
      if (
        /add authentication|update the export|export the user list/i.test(last) &&
        !/create\s+/i.test(last)
      ) {
        return {
          content: "Could you clarify which file/format you want me to use?",
          toolCalls,
          finishReason: "stop",
        };
      }
      return {
        content: `Mock agent processed: ${last.slice(0, 200)}`,
        toolCalls,
        finishReason: "stop",
        usage: {
          promptTokens: Math.ceil(last.length / 4),
          completionTokens: 50,
          totalTokens: Math.ceil(last.length / 4) + 50,
          costUsd: 0,
        },
      };
    }

    return { content: "No script configured.", finishReason: "stop" };
  }

  protected override async onToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolCallResult> {
    return executeSandboxTool(this.context, name, args);
  }

  protected override async onResume(prompt?: string): Promise<AgentResponse> {
    if (prompt) return this.sendPrompt(prompt);
    return { content: "Resumed.", finishReason: "stop" };
  }
}

/** Extract plausible file write operations from natural-language prompts */
function extractFileWrites(text: string): Array<{ path: string; content: string }> {
  const out: Array<{ path: string; content: string }> = [];
  const seen = new Set<string>();

  const patterns: RegExp[] = [
    /create\s+(?:a\s+)?(?:file\s+)?(?:called\s+)?[`"']?([.\w/-]+\.[\w]+)[`"']?(?:\s+with(?:\s+content)?\s+[`"']?([^`"'\n.]+)[`"']?)?/gi,
    /create\s+[`"']?([.\w/-]+\.[\w]+)[`"']?\s+containing\s+(?:exactly\s+)?[`"']?([^`"'\n]+)[`"']?/gi,
    /write\s+(?:to\s+)?[`"']?([.\w/-]+\.[\w]+)[`"']?\s+with\s+[`"']?([^`"'\n]+)[`"']?/gi,
    /(?:add|create)\s+[`"']?([.\w/-]+\.[\w]+)[`"']?/gi,
  ];

  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const path = m[1];
      if (!path || seen.has(path)) continue;
      seen.add(path);
      const content = (m[2] ?? path).trim();
      out.push({ path, content: content + (content.endsWith("\n") ? "" : "\n") });
    }
  }

  // Special cases used by official suite
  if (/set mode to prod/i.test(text) && !seen.has("config.json")) {
    out.push({ path: "config.json", content: '{"mode":"prod"}\n' });
  }
  if (/set v = 1 only in correct\.js/i.test(text)) {
    out.push({ path: "correct.js", content: "export const v = 1;\n" });
  }
  if (/secret code:\s*([A-Z0-9-]+)/i.test(text) && /secret\.txt/i.test(text)) {
    const code = text.match(/secret code:\s*([A-Z0-9-]+)/i)?.[1] ?? "ALPHA-7";
    out.push({ path: "secret.txt", content: `${code}\n` });
  }

  return out;
}
