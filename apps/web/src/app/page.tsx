import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.16),transparent_45%)]" />
        <div className="container-page relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center py-16">
          <p className="animate-rise font-display text-5xl font-semibold tracking-tight text-snow sm:text-7xl">
            Agent Eval Bench
          </p>
          <h1 className="animate-rise delay-1 mt-5 max-w-2xl text-balance text-xl text-fog sm:text-2xl">
            Measure coding agents like production software — sandboxed benchmarks, scorecards, and a
            cloud dashboard for every run.
          </h1>
          <div className="animate-rise delay-2 mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className="focus-ring rounded-full bg-snow px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white"
            >
              Read the docs
            </Link>
            <Link
              href="/signup"
              className="focus-ring rounded-full border border-line bg-transparent px-5 py-2.5 text-sm font-medium text-snow transition hover:border-fog/50 hover:bg-panel"
            >
              Create account
            </Link>
          </div>
          <pre className="animate-rise delay-3 mt-12 max-w-xl overflow-x-auto rounded-2xl border border-line bg-ink-soft/80 p-4 font-mono text-[13px] leading-6 text-fog">
            <code>{`bun install -g agent-eval-bench
agent-eval-bench init
agent-eval-bench login
agent-eval-bench run`}</code>
          </pre>
        </div>
      </section>

      <section className="container-page py-20">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-snow sm:text-3xl">
          Local evals. Cloud visibility.
        </h2>
        <p className="mt-3 max-w-2xl text-mute">
          Keep the CLI fast and offline-first. When you want shared history, link your machine once
          and every benchmark run syncs logs, scores, and leaderboards.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Sandboxed suites",
              body: "Docker or local sandboxes, YAML benchmarks, and nine-dimension scorecards across planning, recovery, safety, and more.",
            },
            {
              title: "CLI bridge",
              body: "Device-code login connects your terminal to the platform — the same flow you expect from modern developer tools.",
            },
            {
              title: "Run explorer",
              body: "Inspect pass rates, per-benchmark validators, telemetry timelines, and agent leaderboards in one dashboard.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t border-line pt-5">
              <h3 className="font-display text-lg font-medium text-snow">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mute">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
