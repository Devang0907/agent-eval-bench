# Architecture

Agent Eval Bench is a Bun + TypeScript monorepo with a **plugin registry** at the center.

```
CLI (Commander + Ink)
  → Registry / Config / Plugins
  → BenchmarkRunner
       → SandboxProvider (Docker | Local)
       → AgentAdapter (mock, claude-code, codex, openai, …)
       → EventBus → Telemetry sinks (JSONL, SQLite)
       → Validators → WeightedScorer
       → Reporters (MD / HTML / JSON / terminal)
       → LeaderboardRepository
```

## Core contracts

Defined in `@agent-eval-bench/core`:

- **AgentAdapter** — `initialize`, `sendPrompt`, `toolCall`, `interrupt`, `resume`, `shutdown`
- **SandboxProvider / SandboxHandle** — isolated workdir + exec/fs
- **Validator / Scorer** — declarative checks → 9-dimension `ScoreCard`
- **Plugin** — `register(registry)` for community extensions
- **EventBus** — Zod-validated telemetry stream

## Design decisions

1. **Single published package** (`agent-eval-bench`) bundles workspace packages so `bun install -g agent-eval-bench` is simple.
2. **Benchmarks are data (YAML)**; validators are code — community can add suites without shipping TypeScript.
3. **Fresh sandbox per test** — Docker by default, Local for CI/`--no-docker`.
4. **Event-driven telemetry** — collection is decoupled from Ink UI, SQLite, and reporters.
5. **Capability flags** — runner skips benchmarks the adapter cannot support.

## Package map

| Package | Responsibility |
|---------|----------------|
| core | schemas, contracts, Registry, EventBus, DI, config loader |
| sandbox | LocalSandbox, DockerSandbox, fixture seeding |
| adapters | Agent integrations + MockAdapter + conformance kit |
| runner | lifecycle, concurrency queue, loop detector |
| scoring | validators + WeightedScorer |
| telemetry | collector, JSONL/SQLite sinks, leaderboard |
| reporter | report formats + strengths/weaknesses |
| benchmarks | official YAML suites |
| cli | user-facing commands |
