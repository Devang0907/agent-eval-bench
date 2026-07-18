export function TrustedStrip() {
  const tools = ["CLI", "Docker", "YAML", "Bun", "GitHub", "Telemetry"];

  return (
    <section className="border-y border-line/50 py-12">
      <div className="container-wide text-center">
        <p className="text-sm text-mute">Built for agent teams shipping evaluation pipelines</p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {tools.map((tool) => (
            <li
              key={tool}
              className="font-display text-sm font-semibold tracking-wide text-fog/70"
              translate="no"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
