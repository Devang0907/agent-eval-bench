<div align="center">
  <img src="assets/logo.svg" alt="Agent Eval Bench" width="96" height="96" />

  <h1>Agent Eval Bench</h1>

  <p><strong>Playwright + Lighthouse + Vitest for AI coding agents.</strong></p>

  <p>by <a href="https://github.com/Devang0907">@Devang0907</a></p>

  <p>
    <a href="https://github.com/Devang0907/agent-eval-bench/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Devang0907/agent-eval-bench/ci.yml?branch=main&label=test" alt="CI status" /></a>
    <a href="https://github.com/Devang0907/agent-eval-bench/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Devang0907/agent-eval-bench" alt="License" /></a>
    <a href="https://www.npmjs.com/package/agent-eval-bench"><img src="https://img.shields.io/npm/v/agent-eval-bench" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/agent-eval-bench"><img src="https://img.shields.io/npm/dw/agent-eval-bench" alt="npm downloads" /></a>
    <a href="https://github.com/Devang0907/agent-eval-bench/stargazers"><img src="https://img.shields.io/github/stars/Devang0907/agent-eval-bench?style=social" alt="GitHub stars" /></a>
  </p>

  <p>
    <a href="https://github.com/Devang0907/agent-eval-bench">GitHub</a> •
    <a href="https://www.npmjs.com/package/agent-eval-bench">npm</a> •
    <a href="https://agent-eval-bench.vercel.app/">Website</a>
  </p>
</div>

---

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
agent-eval-bench login
agent-eval-bench whoami
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

| Package | Role | Published with npm CLI? |
|---------|------|-------------------------|
| `@agent-eval-bench/core` | Contracts, Zod schemas, Registry, EventBus, DI | Yes (bundled) |
| `@agent-eval-bench/sandbox` | Docker + Local sandboxes | Yes (bundled) |
| `@agent-eval-bench/adapters` | Agent adapters | Yes (bundled) |
| `@agent-eval-bench/runner` | Orchestrator | Yes (bundled) |
| `@agent-eval-bench/scoring` | Validators + WeightedScorer | Yes (bundled) |
| `@agent-eval-bench/telemetry` | Event sinks + SQLite leaderboard | Yes (bundled) |
| `@agent-eval-bench/reporter` | MD / HTML / JSON / terminal | Yes (bundled) |
| `@agent-eval-bench/benchmarks` | Official YAML suites | Yes (bundled) |
| `agent-eval-bench` | Published CLI | Yes |
| `@agent-eval-bench/api` | Bun + Prisma cloud API (`apps/api`) | **No** |
| `@agent-eval-bench/web` | Next.js site + dashboard (`apps/web`) | **No** |

Installing `agent-eval-bench` from npm only pulls the CLI and eval runtime. The website and API stay in this monorepo for local/platform development.

## Cloud platform (website + API)

Live site: [https://agent-eval-bench.vercel.app/](https://agent-eval-bench.vercel.app/)

For local development:

```bash
# Postgres
docker compose up -d

# API (Bun + Prisma)
cp apps/api/.env.example apps/api/.env
bun run db:push
bun run dev:api

# Web (Next.js — http://localhost:3000)
cp apps/web/.env.example apps/web/.env.local
bun run dev:web
```

Then in another terminal:

```bash
set AGENT_EVAL_BENCH_API_URL=http://localhost:4000
agent-eval-bench login
agent-eval-bench run --no-docker -a mock
```

Sign up on the [website](https://agent-eval-bench.vercel.app/) (email/password or Google), approve the device code at `/device`, and open the dashboard for synced runs, telemetry logs, and leaderboards.

Optional Google OAuth: set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/api/.env`.

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

- Website: [https://agent-eval-bench.vercel.app/docs](https://agent-eval-bench.vercel.app/docs)
- GitHub: [https://github.com/Devang0907/agent-eval-bench](https://github.com/Devang0907/agent-eval-bench)
- npm: [https://www.npmjs.com/package/agent-eval-bench](https://www.npmjs.com/package/agent-eval-bench)

Repo markdown:

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Writing benchmarks](docs/writing-benchmarks.md)
- [Adapters](docs/adapters.md)
- [Plugins](docs/plugins.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
