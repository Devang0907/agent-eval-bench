import { defineValidator, ok, fail } from "./util.js";

export const maxToolCalls = defineValidator(
  "max-tool-calls",
  "Limit number of tool calls",
  async (ctx, params) => {
    const max = Number(params?.["max"] ?? ctx.expected?.agentBehavior?.maxToolCalls ?? 50);
    const count = ctx.events.filter((e) => e.type === "tool.call").length;
    return count <= max
      ? ok("max-tool-calls", `${count}/${max} tool calls`)
      : fail("max-tool-calls", `Too many tool calls: ${count} > ${max}`, Math.max(0, 100 - (count - max) * 5));
  },
);

export const maxCost = defineValidator(
  "max-cost",
  "Limit USD cost",
  async (ctx, params) => {
    const max = Number(params?.["max"] ?? 1);
    const cost = ctx.events
      .filter((e) => e.type === "cost" || e.type === "token.usage")
      .reduce((acc, e) => acc + Number(e.data["costUsd"] ?? 0), 0);
    return cost <= max
      ? ok("max-cost", `Cost $${cost.toFixed(4)} <= $${max}`)
      : fail("max-cost", `Cost $${cost.toFixed(4)} exceeds $${max}`);
  },
);

export const noLoopDetected = defineValidator(
  "no-loop-detected",
  "Fail if the runner detected an infinite loop",
  async (ctx) => {
    const loops = ctx.events.filter((e) => e.type === "loop.detected");
    return loops.length === 0
      ? ok("no-loop-detected", "No loops detected")
      : fail("no-loop-detected", `Loop detected ${loops.length} time(s)`);
  },
);

export const maxShellCommands = defineValidator(
  "max-shell-commands",
  "Limit shell command count",
  async (ctx, params) => {
    const max = Number(params?.["max"] ?? 100);
    const count = ctx.events.filter((e) => e.type === "shell.exec").length;
    return count <= max
      ? ok("max-shell-commands", `${count}/${max} shell commands`)
      : fail("max-shell-commands", `Too many shell commands: ${count} > ${max}`);
  },
);
