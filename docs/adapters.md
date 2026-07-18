# Adapters

Configure agents in `agent-eval-bench.config.ts`:

```ts
agents: [
  { name: "mock", type: "mock" },
  { name: "claude", type: "claude-code", command: "claude" },
  { name: "codex", type: "codex", command: "codex" },
  { name: "gpt", type: "openai", model: "gpt-4o", apiKey: process.env.OPENAI_API_KEY },
  { name: "or", type: "openrouter", model: "anthropic/claude-sonnet-4" },
  { name: "http-agent", type: "http", baseUrl: "http://127.0.0.1:8080" },
  { name: "cli-agent", type: "cli", command: "my-agent", args: ["--print"] },
]
```

## Mock scripts

```ts
{
  name: "mock",
  type: "mock",
  options: {
    script: [
      { type: "write", path: "out.txt", content: "hi" },
      { type: "respond", content: "done" },
    ],
  },
}
```

## Custom adapters

Implement `AgentAdapter` (or extend `BaseAdapter`) and register:

```ts
registry.registerAdapter("my-agent", (config) => new MyAdapter(config));
```

Or ship a plugin that registers the factory.
