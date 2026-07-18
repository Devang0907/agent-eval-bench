# API

## `defineConfig(config)`

Validates and returns an `AgentEvalBenchConfig`.

## `Registry`

```ts
registerAdapter(type, factory)
createAdapter(config)
registerValidator(validator)
registerScorer(name, scorer, { default? })
registerSandbox(provider, { default? })
registerReporter(reporter)
registerBenchmark(def)
registerPlugin(plugin)
listBenchmarks({ category?, tags? })
```

## `BenchmarkRunner`

```ts
const runner = new BenchmarkRunner({ registry, bus, config });
const result: RunResult = await runner.run({ suites: ["context"], agentName: "mock" });
```

## `AgentAdapter`

```ts
interface AgentAdapter {
  name: string;
  config: AdapterConfig;
  capabilities: AdapterCapabilities;
  initialize(ctx: AdapterContext): Promise<void>;
  sendPrompt(prompt: Prompt): Promise<AgentResponse>;
  toolCall(name: string, args: Record<string, unknown>): Promise<ToolCallResult>;
  interrupt(): Promise<void>;
  resume(prompt?: string): Promise<AgentResponse>;
  shutdown(): Promise<void>;
}
```

## `ScoreCard`

Dimensions (0–100): `success`, `accuracy`, `planning`, `efficiency`, `verification`, `recovery`, `memory`, `safety`, `overall`.

## Telemetry events

`run.*`, `benchmark.*`, `prompt.sent`, `response.received`, `tool.call`, `file.edit`, `shell.exec`, `git.op`, `loop.detected`, `validator.result`, `score.computed`, …
