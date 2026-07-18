const quotes = [
  {
    role: "Solo Developer",
    body: "I used to juggle notebooks, Docker scripts, and spreadsheets. Agent Eval Bench gives me one scorecard per run — and a dashboard when I need to share it.",
  },
  {
    role: "Startup Founder",
    body: "We needed a repeatable way to compare coding agents before shipping. Local sandboxes plus cloud sync saved us weeks of ad-hoc tooling.",
  },
  {
    role: "Platform Engineer",
    body: "Device-code login from the CLI feels familiar. Our team can sync runs without wiring custom auth into every laptop.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Testimonials</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-4xl">
            From idea to production in minutes
          </h2>
          <p className="mt-4 text-pretty text-mute">
            Early builders use Agent Eval Bench to standardize how agents are measured across local
            machines and shared cloud history.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {quotes.map((quote) => (
            <blockquote
              key={quote.role}
              className="rounded-3xl border border-line bg-panel/50 p-6 sm:p-8"
            >
              <p className="section-badge">{quote.role}</p>
              <p className="mt-5 text-pretty text-base leading-7 text-fog">&ldquo;{quote.body}&rdquo;</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
