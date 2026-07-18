import type {
  AgentEvalBenchConfig,
  BenchmarkDefinition,
  BenchmarkRunResult,
  EventBus,
  Registry,
  RunResult,
  SandboxHandle,
  ValidatorResult,
} from "@agent-eval-bench/core";
import {
  aggregateMetrics,
  aggregateScoreCard,
  emptyRunMetrics,
  createEmptyScoreCard,
  errorMessage,
  promptSteps,
  uniqueId,
} from "@agent-eval-bench/core";
import { TelemetryCollector } from "@agent-eval-bench/telemetry";
import { mapConcurrent } from "./queue.js";
import { LoopDetector } from "./loop-detector.js";

export interface RunnerOptions {
  registry: Registry;
  bus: EventBus;
  config: AgentEvalBenchConfig;
}

export class BenchmarkRunner {
  private readonly registry: Registry;
  private readonly bus: EventBus;
  private readonly config: AgentEvalBenchConfig;

  constructor(opts: RunnerOptions) {
    this.registry = opts.registry;
    this.bus = opts.bus;
    this.config = opts.config;
  }

  async run(opts?: {
    suites?: string[];
    agentName?: string;
    signal?: AbortSignal;
  }): Promise<RunResult> {
    const runId = uniqueId();
    const startedAt = Date.now();
    const agentConfig =
      this.config.agents.find((a) => a.name === opts?.agentName) ?? this.config.agents[0];
    if (!agentConfig) {
      throw new Error("No agent configured");
    }

    const suites = opts?.suites?.length
      ? opts.suites
      : this.config.suites.length
        ? this.config.suites
        : undefined;

    let benchmarks = this.registry.listBenchmarks();
    if (suites?.length) {
      benchmarks = benchmarks.filter(
        (b) => suites.includes(b.category) || suites.includes(b.id) || suites.some((s) => b.id.startsWith(s + "/")),
      );
    }
    benchmarks = benchmarks.filter((b) => !b.skip);

    this.bus.emit({
      type: "run.started",
      runId,
      agentName: agentConfig.name,
      data: { benchmarkCount: benchmarks.length, suites: suites ?? ["all"] },
    });

    const collector = new TelemetryCollector(this.bus);
    collector.start();

    const results = await mapConcurrent(
      benchmarks,
      this.config.concurrency,
      async (benchmark) => {
        if (opts?.signal?.aborted) {
          return skippedResult(benchmark, agentConfig.name, "Cancelled");
        }
        return this.runOne(runId, agentConfig.name, benchmark, opts?.signal);
      },
    );

    collector.stop();
    const completedAt = Date.now();
    const runResult: RunResult = {
      runId,
      agentName: agentConfig.name,
      startedAt,
      completedAt,
      results,
      scoreCard: aggregateScoreCard(results),
      metrics: aggregateMetrics(results),
      status: results.every((r) => r.skipped)
        ? "cancelled"
        : results.some((r) => !r.passed && !r.skipped)
          ? "partial"
          : "completed",
    };

    this.bus.emit({
      type: "run.completed",
      runId,
      agentName: agentConfig.name,
      data: { overall: runResult.scoreCard.overall, status: runResult.status },
      durationMs: completedAt - startedAt,
    });

    return runResult;
  }

  private async runOne(
    runId: string,
    agentName: string,
    benchmark: BenchmarkDefinition,
    signal?: AbortSignal,
  ): Promise<BenchmarkRunResult> {
    const start = Date.now();
    this.bus.emit({
      type: "benchmark.started",
      runId,
      benchmarkId: benchmark.id,
      agentName,
      data: { name: benchmark.name, category: benchmark.category },
    });

    let sandbox: SandboxHandle | null = null;
    const events: import("@agent-eval-bench/core").TelemetryEvent[] = [];
    const unsub = this.bus.on("*", (e) => {
      if (e.benchmarkId === benchmark.id || (!e.benchmarkId && e.runId === runId)) {
        events.push(e);
      }
    });

    try {
      // Capability gate
      const adapterPreview = this.registry.createAdapter(
        this.config.agents.find((a) => a.name === agentName)!,
      );
      for (const cap of benchmark.requiresCapabilities) {
        const key = `supports${cap[0]?.toUpperCase()}${cap.slice(1)}` as keyof typeof adapterPreview.capabilities;
        if (cap in adapterPreview.capabilities === false) {
          // also accept raw capability names like "Interrupt"
          const flag = (adapterPreview.capabilities as Record<string, boolean>)[
            cap.startsWith("supports") ? cap : `supports${cap}`
          ];
          if (flag === false) {
            unsub();
            return skippedResult(benchmark, agentName, `Missing capability: ${cap}`);
          }
        } else if (!adapterPreview.capabilities[key]) {
          unsub();
          return skippedResult(benchmark, agentName, `Missing capability: ${cap}`);
        }
      }
      await adapterPreview.shutdown().catch(() => undefined);

      const sandboxName = this.config.noDocker ? "local" : undefined;
      const provider = this.registry.getSandbox(sandboxName);
      sandbox = await provider.create({
        environment: { ...this.config.sandbox, ...benchmark.environment },
        repository: benchmark.repository,
        runId,
        benchmarkId: benchmark.id,
      });

      this.bus.emit({
        type: "sandbox.created",
        runId,
        benchmarkId: benchmark.id,
        agentName,
        data: { provider: sandbox.info.provider, id: sandbox.info.id },
      });

      const agentConfig = this.config.agents.find((a) => a.name === agentName)!;
      const adapter = this.registry.createAdapter(agentConfig);
      const loopDetector = new LoopDetector(this.bus, runId);
      const loopUnsub = this.bus.on("*", (e) => {
        if (e.benchmarkId === benchmark.id) loopDetector.observe(e);
      });

      await adapter.initialize({
        workdir: sandbox.info.workdir,
        env: benchmark.environment?.env ?? {},
        runId,
        benchmarkId: benchmark.id,
        signal,
        sandbox,
        bus: this.bus,
      });

      const steps = promptSteps(benchmark.prompt);
      let lastContent = "";

      for (const step of steps) {
        if (signal?.aborted) break;
        if (step.delayMs) await Bun.sleep(step.delayMs);

        this.bus.emit({
          type: "prompt.sent",
          runId,
          benchmarkId: benchmark.id,
          agentName,
          data: { role: step.role, content: step.content },
        });

        const t0 = Date.now();
        const response = await adapter.sendPrompt(
          step.role === "system"
            ? [{ role: "system", content: step.content }]
            : step.content,
        );
        lastContent = response.content;

        this.bus.emit({
          type: "response.received",
          runId,
          benchmarkId: benchmark.id,
          agentName,
          data: {
            content: response.content,
            finishReason: response.finishReason,
            toolCallCount: response.toolCalls?.length ?? 0,
          },
          durationMs: Date.now() - t0,
        });

        if (response.usage) {
          this.bus.emit({
            type: "token.usage",
            runId,
            benchmarkId: benchmark.id,
            agentName,
            data: { ...response.usage },
          });
          if (response.usage.costUsd) {
            this.bus.emit({
              type: "cost",
              runId,
              benchmarkId: benchmark.id,
              agentName,
              data: { costUsd: response.usage.costUsd },
            });
          }
        }

        for (const tc of response.toolCalls ?? []) {
          this.bus.emit({
            type: "tool.call",
            runId,
            benchmarkId: benchmark.id,
            agentName,
            data: { name: tc.name, arguments: tc.arguments },
          });
          if (tc.error) {
            this.bus.emit({
              type: "tool.result",
              runId,
              benchmarkId: benchmark.id,
              agentName,
              data: { name: tc.name, error: tc.error },
            });
          }
        }
      }

      await adapter.shutdown();
      loopUnsub();

      const validatorResults = await this.runValidators(benchmark, sandbox, events, agentName, runId);
      const scorer = this.registry.getScorer();
      const scoreCard = scorer.score(validatorResults, events, benchmark);
      const passed = validatorResults.length === 0
        ? scoreCard.overall >= 50
        : validatorResults.every((r) => r.passed);

      this.bus.emit({
        type: "score.computed",
        runId,
        benchmarkId: benchmark.id,
        agentName,
        data: { scoreCard, passed },
      });

      const durationMs = Date.now() - start;
      const result: BenchmarkRunResult = {
        benchmarkId: benchmark.id,
        name: benchmark.name,
        category: benchmark.category,
        difficulty: benchmark.difficulty,
        agentName,
        passed,
        scoreCard,
        metrics: emptyRunMetrics(),
        durationMs,
        skipped: false,
        validatorResults: validatorResults.map((r) => ({
          name: r.name,
          passed: r.passed,
          score: r.score,
          message: r.message,
        })),
      };

      this.bus.emit({
        type: passed ? "benchmark.completed" : "benchmark.failed",
        runId,
        benchmarkId: benchmark.id,
        agentName,
        data: { passed, overall: scoreCard.overall, lastContent: lastContent.slice(0, 200) },
        durationMs,
      });

      unsub();
      return result;
    } catch (err) {
      unsub();
      const durationMs = Date.now() - start;
      this.bus.emit({
        type: "benchmark.failed",
        runId,
        benchmarkId: benchmark.id,
        agentName,
        data: { error: errorMessage(err) },
        durationMs,
      });
      return {
        benchmarkId: benchmark.id,
        name: benchmark.name,
        category: benchmark.category,
        difficulty: benchmark.difficulty,
        agentName,
        passed: false,
        scoreCard: createEmptyScoreCard(),
        metrics: emptyRunMetrics(),
        durationMs,
        error: errorMessage(err),
        skipped: false,
        validatorResults: [],
      };
    } finally {
      if (sandbox) {
        await sandbox.destroy().catch(() => undefined);
        this.bus.emit({
          type: "sandbox.destroyed",
          runId,
          benchmarkId: benchmark.id,
          agentName,
          data: {},
        });
      }
    }
  }

  private async runValidators(
    benchmark: BenchmarkDefinition,
    sandbox: SandboxHandle,
    events: readonly import("@agent-eval-bench/core").TelemetryEvent[],
    agentName: string,
    runId: string,
  ): Promise<ValidatorResult[]> {
    const results: ValidatorResult[] = [];

    // Auto validators from expected.files
    const refs = [...benchmark.validators];
    for (const f of benchmark.expected?.files ?? []) {
      if (f.exists !== false) {
        refs.push({ name: "file-exists", params: { path: f.path } });
      }
      if (f.contains || f.matches) {
        refs.push({
          name: "file-contains",
          params: {
            path: f.path,
            ...(f.contains ? { contains: f.contains } : {}),
            ...(f.matches ? { matches: f.matches } : {}),
          },
        });
      }
    }
    for (const c of benchmark.expected?.commands ?? []) {
      refs.push({
        name: "command-exit-code",
        params: {
          cmd: c.cmd,
          exitCode: c.exitCode,
          ...(c.stdoutContains ? { stdoutContains: c.stdoutContains } : {}),
        },
      });
    }
    if (benchmark.expected?.agentBehavior?.shouldAskQuestion) {
      refs.push({ name: "asks-clarification" });
    }
    if (benchmark.expected?.agentBehavior?.maxToolCalls != null) {
      refs.push({
        name: "max-tool-calls",
        params: { max: benchmark.expected.agentBehavior.maxToolCalls },
      });
    }

    const ctx = {
      benchmark,
      workdir: sandbox.info.workdir,
      events,
      expected: benchmark.expected,
      agentName,
      runId,
      readFile: (path: string) => sandbox.readFile(path),
      exists: (path: string) => sandbox.exists(path),
      exec: async (cmd: string, args?: string[]) => {
        const r = await sandbox.exec(cmd, args);
        return { stdout: r.stdout, stderr: r.stderr, exitCode: r.exitCode };
      },
    };

    for (const ref of refs) {
      try {
        const validator = this.registry.getValidator(ref.name);
        const result = await validator.validate(ctx, ref.params);
        results.push(result);
        this.bus.emit({
          type: "validator.result",
          runId,
          benchmarkId: benchmark.id,
          agentName,
          data: result,
        });
      } catch (err) {
        results.push({
          name: ref.name,
          passed: false,
          score: 0,
          message: errorMessage(err),
        });
      }
    }

    return results;
  }
}

function skippedResult(
  benchmark: BenchmarkDefinition,
  agentName: string,
  reason: string,
): BenchmarkRunResult {
  return {
    benchmarkId: benchmark.id,
    name: benchmark.name,
    category: benchmark.category,
    difficulty: benchmark.difficulty,
    agentName,
    passed: false,
    scoreCard: createEmptyScoreCard(),
    metrics: emptyRunMetrics(),
    durationMs: 0,
    skipped: true,
    skipReason: reason,
    validatorResults: [],
  };
}
