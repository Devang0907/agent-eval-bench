# Plugins

Community packages named `agent-eval-bench-plugin-*` are auto-discovered from `node_modules`. You can also list them in config:

```ts
plugins: ["agent-eval-bench-plugin-python", "./my-local-plugin.ts"]
```

## Contract

```ts
import type { Plugin } from "@agent-eval-bench/core";

const plugin: Plugin = {
  name: "agent-eval-bench-plugin-example",
  version: "0.1.0",
  register(registry) {
    registry.registerBenchmark({ /* ... */ });
    registry.registerValidator({ /* ... */ });
    registry.registerAdapter("example", (config) => /* ... */);
  },
};

export default plugin;
```

See `examples/agent-eval-bench-plugin-example` for a complete sample.
