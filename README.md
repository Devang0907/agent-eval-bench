# Agent Eval Bench

**Playwright + Lighthouse + Vitest for AI coding agents.**

Agent Eval Bench is a production-grade evaluation framework for autonomous AI coding agents. It measures planning, context handling, memory, tool use, git/shell workflows, recovery, verification, hallucination resistance, efficiency, and more — inside isolated Docker (or local) sandboxes.

## Install

```bash
bun install -g agent-eval-bench
```

Or from source:

```bash
bun install
bun run --filter agent-eval-bench build
```

## Quick start

```bash
agent-eval-bench init
agent-eval-bench doctor
agent-eval-bench list
agent-eval-bench run
agent-eval-bench run context
agent-eval-bench run memory
agent-eval-bench benchmark
agent-eval-bench report
agent-eval-bench leaderboard
agent-eval-bench compare mock claude
```

## Configuration

`agent-eval-bench.config.ts`:

```ts
import { defineConfig } from "agent-eval-bench";

export default defineConfig({
  agents: [
    { name: "mock", type: "mock" },
    { name: "claude", type: "claude-code" },
    { name: "codex", type: "codex" },
  ],
  noDocker: true,
  reports: ["terminal", "json", "markdown", "html"],
});
```

## Adapters

| Type | Description |
|------|-------------|
| `mock` | Deterministic scripted agent (CI) |
| `cli` | Generic CLI |
| `http` | Generic HTTP session API |
| `openai` | OpenAI-compatible chat + tools |
| `openrouter` | OpenRouter |
| `claude-code` | Claude Code CLI |
| `codex` | OpenAI Codex CLI |
| `opencode` | OpenCode CLI |

## Benchmark categories

Context, Memory, Planning, Loop, Recovery, Git, Shell, Filesystem, Verification, Hallucination, Ambiguity, Long-horizon, Tool-usage, Efficiency.

## Monorepo packages

| Package | Role |
|---------|------|
| `@agent-eval-bench/core` | Contracts, Zod schemas, Registry, EventBus, DI |
| `@agent-eval-bench/sandbox` | Docker + Local sandboxes |
| `@agent-eval-bench/adapters` | Agent adapters |
| `@agent-eval-bench/runner` | Orchestrator |
| `@agent-eval-bench/scoring` | Validators + WeightedScorer |
| `@agent-eval-bench/telemetry` | Event sinks + SQLite leaderboard |
| `@agent-eval-bench/reporter` | MD / HTML / JSON / terminal |
| `@agent-eval-bench/benchmarks` | Official YAML suites |
| `agent-eval-bench` | Published CLI |

## Plugins

Publish `agent-eval-bench-plugin-*` packages that export a `Plugin`:

```ts
export default {
  name: "agent-eval-bench-plugin-example",
  register(registry) {
    registry.registerBenchmarks([...]);
    registry.registerValidator(...);
  },
};
```

## Docs

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Writing benchmarks](docs/writing-benchmarks.md)
- [Adapters](docs/adapters.md)
- [Plugins](docs/plugins.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
