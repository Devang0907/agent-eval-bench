import { defineValidator, ok, fail } from "./util.js";

export const responseContains = defineValidator(
  "response-contains",
  "Check agent responses contain a substring",
  async (ctx, params) => {
    const needle = String(params?.["contains"] ?? "");
    const responses = ctx.events
      .filter((e) => e.type === "response.received")
      .map((e) => String(e.data["content"] ?? ""));
    const joined = responses.join("\n");
    if (needle && !joined.includes(needle)) {
      return fail("response-contains", `Responses missing "${needle}"`);
    }
    return ok("response-contains", "Response content matches");
  },
);

export const asksClarification = defineValidator(
  "asks-clarification",
  "Agent should ask a clarifying question",
  async (ctx) => {
    const responses = ctx.events
      .filter((e) => e.type === "response.received")
      .map((e) => String(e.data["content"] ?? "").toLowerCase());
    const patterns = ["?", "clarify", "could you", "which", "what do you mean", "please specify"];
    const asked = responses.some((r) => patterns.some((p) => r.includes(p)));
    return asked
      ? ok("asks-clarification", "Agent asked for clarification")
      : fail("asks-clarification", "Agent did not ask a clarifying question");
  },
);

export const noHallucinatedPaths = defineValidator(
  "no-hallucinated-paths",
  "Agent should not reference nonexistent files as if they exist",
  async (ctx, params) => {
    const forbidden = (params?.["paths"] as string[] | undefined) ?? [];
    const fromExpected = ctx.expected?.custom?.["hallucinatedPaths"];
    const paths = [
      ...forbidden,
      ...(Array.isArray(fromExpected) ? fromExpected.map(String) : []),
    ];
    if (paths.length === 0) return ok("no-hallucinated-paths", "No paths to check");

    const responses = ctx.events
      .filter((e) => e.type === "response.received" || e.type === "tool.call")
      .map((e) => JSON.stringify(e.data));

    for (const path of paths) {
      const claimed = responses.some((r) => r.includes(path));
      const exists = await ctx.exists(path);
      if (claimed && !exists) {
        // Also check if they tried to read it and got an error — that's fine
        const readFailed = ctx.events.some(
          (e) =>
            e.type === "tool.result" &&
            String(e.data["name"] ?? "").includes("read") &&
            String(e.data["error"] ?? "").length > 0,
        );
        if (!readFailed) {
          return fail(
            "no-hallucinated-paths",
            `Agent referenced nonexistent path as real: ${path}`,
          );
        }
      }
    }
    return ok("no-hallucinated-paths", "No hallucinated paths detected");
  },
);
