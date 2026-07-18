import type { Registry } from "@agent-eval-bench/core";
import { registerLocalSandbox } from "./local.js";
import { registerDockerSandbox } from "./docker.js";

export { LocalSandbox, LocalSandboxProvider, registerLocalSandbox } from "./local.js";
export { DockerSandbox, DockerSandboxProvider, registerDockerSandbox } from "./docker.js";
export { seedRepository, assertInsideWorkdir } from "./seed.js";
export { shellQuote, shellQuoteAll } from "./quote.js";

export function registerBuiltinSandboxes(
  registry: Registry,
  opts?: { preferDocker?: boolean },
): void {
  registerLocalSandbox(registry);
  registerDockerSandbox(registry);
  if (opts?.preferDocker) {
    // Re-register docker as default by getting and setting
    const docker = registry.getSandbox("docker");
    registry.registerSandbox(docker, { default: true });
  }
}
