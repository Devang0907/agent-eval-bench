# Contributing to Agent Eval Bench

Thanks for helping build the evaluation standard for AI coding agents.

- Website: [https://agent-eval-bench.vercel.app/](https://agent-eval-bench.vercel.app/)
- GitHub: [https://github.com/Devang0907/agent-eval-bench](https://github.com/Devang0907/agent-eval-bench)
- npm: [https://www.npmjs.com/package/agent-eval-bench](https://www.npmjs.com/package/agent-eval-bench)

## Development setup

```bash
bun install
bun run --filter @agent-eval-bench/core test
bun run --filter @agent-eval-bench/sandbox test
bun run --filter @agent-eval-bench/adapters test
bun run --filter @agent-eval-bench/scoring test
bun run --filter @agent-eval-bench/telemetry test
bun run --filter @agent-eval-bench/runner test
bun run --filter agent-eval-bench test
```

Requirements: Bun >= 1.1, Git. Docker optional (`--no-docker` / `noDocker: true`).

## Project layout

See [docs/architecture.md](docs/architecture.md). All shared contracts live in `@agent-eval-bench/core`.

## Adding a benchmark

1. Add a YAML file under `packages/benchmarks/definitions/<category>/`.
2. Or run `agent-eval-bench create-test`.
3. Validate with MockAdapter:

```bash
bun run --filter agent-eval-bench dev -- run filesystem
```

## Adding a validator

Implement `Validator` in `@agent-eval-bench/scoring` (or a plugin) and register it via `registry.registerValidator`.

## Adding an adapter

Extend `BaseAdapter` in `@agent-eval-bench/adapters`, register in `registerBuiltinAdapters`, and cover with `assertAdapterContract`.

## Adding a plugin

See [docs/plugins.md](docs/plugins.md) and `examples/agent-eval-bench-plugin-example`.

## Pull requests

- Keep changes focused; prefer small PRs.
- Include tests for new validators/adapters/runner behavior.
- Do not commit `.agent-eval-bench/` artifacts or secrets.
- Run typecheck + tests before opening a PR.

## Code style

- Strict TypeScript, no `any`.
- Prefer SOLID + constructor DI via `Container` / `Registry`.
- Terminal-first UX (Ink / Listr2 / Chalk / Ora).
