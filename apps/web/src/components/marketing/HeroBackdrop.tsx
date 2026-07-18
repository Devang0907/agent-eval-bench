/** Ambient hero atmosphere. Curve lives behind the dashboard. */
export function HeroBackdrop() {
  return (
    <div className="hero-atmosphere" aria-hidden="true">
      <div className="hero-atmosphere__base" />
      <div className="hero-atmosphere__fog" />
      <div className="hero-atmosphere__noise" />
      <div className="hero-atmosphere__vignette" />
    </div>
  );
}

/** Cyan horizon curve — crest sits just above the dashboard top. */
export function HeroCurve() {
  return (
    <div className="hero-curve-stage" aria-hidden="true">
      <div className="hero-curve">
        <div className="hero-curve__bloom" />
        <div className="hero-curve__glow" />
        <div className="hero-curve__rim" />
        <div className="hero-curve__core" />
      </div>
    </div>
  );
}
