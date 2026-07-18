import type { AdapterConfig } from "@agent-eval-bench/core";
import { OpenAIAdapter } from "./openai.js";

/** OpenRouter — OpenAI-compatible with OpenRouter defaults */
export class OpenRouterAdapter extends OpenAIAdapter {
  constructor(config: AdapterConfig) {
    super(
      {
        ...config,
        baseUrl: config.baseUrl ?? "https://openrouter.ai/api/v1",
        apiKey: config.apiKey ?? process.env["OPENROUTER_API_KEY"],
        model: config.model ?? "anthropic/claude-sonnet-4",
        headers: {
          "HTTP-Referer": "https://github.com/agent-eval-bench/agent-eval-bench",
          "X-Title": "Agent Eval Bench",
          ...config.headers,
        },
      },
      { supportsToolCalls: true, supportsResume: true, supportsInterrupt: true },
    );
  }
}
