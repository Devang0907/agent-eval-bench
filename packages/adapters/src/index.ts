import type { AdapterConfig, Registry } from "@agent-eval-bench/core";
import { MockAdapter } from "./mock.js";
import { GenericCliAdapter } from "./generic-cli.js";
import { GenericHttpAdapter } from "./generic-http.js";
import { OpenAIAdapter } from "./openai.js";
import { OpenRouterAdapter } from "./openrouter.js";
import { ClaudeCodeAdapter } from "./claude-code.js";
import { CodexAdapter } from "./codex.js";
import { OpenCodeAdapter } from "./opencode.js";

export { BaseAdapter } from "./base.js";
export { MockAdapter, type MockScriptAction, type MockAdapterOptions } from "./mock.js";
export { GenericCliAdapter } from "./generic-cli.js";
export { GenericHttpAdapter } from "./generic-http.js";
export { OpenAIAdapter } from "./openai.js";
export { OpenRouterAdapter } from "./openrouter.js";
export { ClaudeCodeAdapter } from "./claude-code.js";
export { CodexAdapter } from "./codex.js";
export { OpenCodeAdapter } from "./opencode.js";
export { executeSandboxTool, STANDARD_TOOLS } from "./tools.js";
export {
  FakeSandbox,
  createTestContext,
  assertAdapterContract,
  mockConfig,
} from "./testing.js";

export function registerBuiltinAdapters(registry: Registry): void {
  registry.registerAdapter("mock", (config: AdapterConfig) => new MockAdapter(config));
  registry.registerAdapter("custom", (config: AdapterConfig) => new MockAdapter(config));
  registry.registerAdapter("cli", (config: AdapterConfig) => new GenericCliAdapter(config));
  registry.registerAdapter("http", (config: AdapterConfig) => new GenericHttpAdapter(config));
  registry.registerAdapter("openai", (config: AdapterConfig) => new OpenAIAdapter(config));
  registry.registerAdapter(
    "openrouter",
    (config: AdapterConfig) => new OpenRouterAdapter(config),
  );
  registry.registerAdapter(
    "claude-code",
    (config: AdapterConfig) => new ClaudeCodeAdapter(config),
  );
  registry.registerAdapter("codex", (config: AdapterConfig) => new CodexAdapter(config));
  registry.registerAdapter("opencode", (config: AdapterConfig) => new OpenCodeAdapter(config));
  // MCP type reserved — maps to HTTP for now
  registry.registerAdapter("mcp", (config: AdapterConfig) => new GenericHttpAdapter(config));
}
