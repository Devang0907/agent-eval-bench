import type { Plugin } from "@agent-eval-bench/core";
import { BenchmarkDefinitionSchema } from "@agent-eval-bench/core";

const plugin: Plugin = {
  name: "agent-eval-bench-plugin-example",
  version: "0.1.0",
  register(registry) {
    registry.registerBenchmark(
      BenchmarkDefinitionSchema.parse({
        id: "example/hello-plugin",
        name: "Plugin Hello",
        description: "Example benchmark from a community plugin",
        category: "filesystem",
        difficulty: "easy",
        prompt: "Create plugin-hello.txt with hello-from-plugin",
        expected: {
          files: [{ path: "plugin-hello.txt", exists: true, contains: "hello-from-plugin" }],
        },
        validators: [{ name: "file-exists", params: { path: "plugin-hello.txt" } }],
      }),
    );

    registry.registerValidator({
      name: "example-always-pass",
      description: "Example custom validator",
      async validate() {
        return {
          name: "example-always-pass",
          passed: true,
          score: 100,
          message: "ok",
        };
      },
    });
  },
};

export default plugin;
