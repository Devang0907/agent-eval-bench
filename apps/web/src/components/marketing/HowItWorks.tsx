const steps = [
  {
    step: "01",
    title: "Describe & init",
    body: "Install the CLI, scaffold a suite, and point it at your agent adapter.",
  },
  {
    step: "02",
    title: "Run locally",
    body: "Execute sandboxed benchmarks offline. Scorecards land on disk before anything syncs.",
  },
  {
    step: "03",
    title: "Sync & share",
    body: "Device-login once, then push runs, telemetry, and leaderboards to your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-24">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">How it Works</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-4xl">
            From local eval to cloud visibility in minutes
          </h2>
          <p className="mt-4 text-pretty text-mute">
            A short loop you already know from modern developer tools — init, run, link, inspect.
          </p>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <li
              key={item.step}
              className="rounded-3xl border border-line bg-panel/40 p-6 sm:p-8"
            >
              <p className="font-mono text-xs text-accent-soft">{item.step}</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-snow">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mute">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
