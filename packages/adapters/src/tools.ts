import type { AdapterContext, ToolCallResult } from "@agent-eval-bench/core";
import { uniqueId } from "@agent-eval-bench/core";

/**
 * Execute standard sandbox-backed tools (shell, read/write/list files).
 * Used by MockAdapter, OpenAI tool loops, and conformance tests.
 */
export async function executeSandboxTool(
  ctx: AdapterContext,
  name: string,
  args: Record<string, unknown>,
): Promise<ToolCallResult> {
  const id = uniqueId();
  const sandbox = ctx.sandbox;
  if (!sandbox) {
    return {
      toolCallId: id,
      name,
      arguments: args,
      error: "No sandbox available for tool execution",
    };
  }

  const start = Date.now();
  try {
    switch (name) {
      case "run_shell":
      case "shell": {
        const cmd = String(args["command"] ?? args["cmd"] ?? "");
        const parts = cmd.split(/\s+/).filter(Boolean);
        const bin = parts[0] ?? "true";
        const argv = parts.slice(1);
        const result = await sandbox.exec(bin, argv);
        return {
          toolCallId: id,
          name,
          arguments: args,
          result: {
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
          },
          durationMs: Date.now() - start,
        };
      }
      case "read_file":
      case "read": {
        const path = String(args["path"] ?? "");
        const content = await sandbox.readFile(path);
        return {
          toolCallId: id,
          name,
          arguments: args,
          result: { content },
          durationMs: Date.now() - start,
          ...(content === null ? { error: `File not found: ${path}` } : {}),
        };
      }
      case "write_file":
      case "write": {
        const path = String(args["path"] ?? "");
        const content = String(args["content"] ?? "");
        await sandbox.writeFile(path, content);
        ctx.bus?.emit({
          type: "file.edit",
          runId: ctx.runId,
          benchmarkId: ctx.benchmarkId,
          data: { path, op: "write" },
        });
        return {
          toolCallId: id,
          name,
          arguments: args,
          result: { ok: true },
          durationMs: Date.now() - start,
        };
      }
      case "list_files":
      case "list": {
        const pattern = args["pattern"] ? String(args["pattern"]) : undefined;
        const files = await sandbox.listFiles(pattern);
        return {
          toolCallId: id,
          name,
          arguments: args,
          result: { files },
          durationMs: Date.now() - start,
        };
      }
      default:
        return {
          toolCallId: id,
          name,
          arguments: args,
          error: `Unknown tool: ${name}`,
          durationMs: Date.now() - start,
        };
    }
  } catch (err) {
    return {
      toolCallId: id,
      name,
      arguments: args,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    };
  }
}

export const STANDARD_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "run_shell",
      description: "Run a shell command in the workspace",
      parameters: {
        type: "object",
        properties: { command: { type: "string" } },
        required: ["command"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_file",
      description: "Read a file from the workspace",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "write_file",
      description: "Write a file in the workspace",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          content: { type: "string" },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_files",
      description: "List files matching a glob pattern",
      parameters: {
        type: "object",
        properties: { pattern: { type: "string" } },
      },
    },
  },
];
