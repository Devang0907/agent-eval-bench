import type { AdapterConfig } from "@agent-eval-bench/core";
import { GenericCliAdapter } from "./generic-cli.js";

/**
 * OpenCode CLI adapter — thin wrapper over GenericCliAdapter.
 */
export class OpenCodeAdapter extends GenericCliAdapter {
  constructor(config: AdapterConfig) {
    super({
      ...config,
      command: config.command ?? "opencode",
      args: config.args ?? ["run"],
      options: {
        promptAsArg: true,
        ...config.options,
      },
    });
  }
}
