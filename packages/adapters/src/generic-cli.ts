import { execa } from "execa";
import type { AdapterConfig, AgentResponse, ToolCallResult } from "@agent-eval-bench/core";
import { AdapterError, errorMessage } from "@agent-eval-bench/core";
import { BaseAdapter } from "./base.js";

type ChildHandle = {
  kill: (signal?: string) => void;
  then: Promise<{
    stdout: string;
    stderr: string;
    exitCode: number | null;
  }>["then"];
};

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

/**
 * Generic CLI adapter — spawns a command with the prompt on stdin / as arg.
 * Config: { command, args?, env? }
 */
export class GenericCliAdapter extends BaseAdapter {
  private child: ChildHandle | null = null;

  constructor(config: AdapterConfig) {
    super(config, {
      supportsInterrupt: true,
      supportsResume: false,
      supportsStreaming: false,
    });
  }

  protected async onSendPrompt(
    steps: Array<{ role: "user" | "system"; content: string; delayMs?: number }>,
  ): Promise<AgentResponse> {
    const command = this.config.command;
    if (!command) {
      throw new AdapterError("CLI adapter requires config.command");
    }

    const prompt = steps.map((s) => s.content).join("\n\n");
    const args = [...(this.config.args ?? [])];
    const passAsArg = this.config.options?.["promptAsArg"] === true;

    if (passAsArg) {
      args.push(prompt);
    }

    const start = Date.now();
    const proc = execa(command, args, {
      cwd: this.context.workdir,
      env: { ...process.env, ...this.config.env, ...this.context.env },
      input: passAsArg ? undefined : prompt,
      reject: false,
      timeout: this.config.timeout ?? 300_000,
    });
    this.child = proc as unknown as ChildHandle;

    const result = await proc;
    this.child = null;
    const stdout = asString(result.stdout);
    const stderr = asString(result.stderr);

    if (this.aborted) {
      return { content: stdout, finishReason: "interrupt" };
    }

    if (result.exitCode !== 0 && result.exitCode !== null) {
      return {
        content: stdout,
        finishReason: "error",
        raw: { stderr, exitCode: result.exitCode },
      };
    }

    return {
      content: stdout,
      finishReason: "stop",
      usage: {
        promptTokens: Math.ceil(prompt.length / 4),
        completionTokens: Math.ceil(stdout.length / 4),
        totalTokens: Math.ceil((prompt.length + stdout.length) / 4),
      },
      raw: { durationMs: Date.now() - start, exitCode: result.exitCode },
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
      error: `Generic CLI adapter does not execute tools inline: ${name}`,
    };
  }

  protected override async onShutdown(): Promise<void> {
    if (this.child) {
      try {
        this.child.kill("SIGTERM");
      } catch (err) {
        void errorMessage(err);
      }
      this.child = null;
    }
  }
}
