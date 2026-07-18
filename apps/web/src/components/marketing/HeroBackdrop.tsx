/** Page-level atmosphere — mesh, watermark, grain. Half-circle lives with the product. */
export function HeroBackdrop() {
  return (
    <div
      className="hero-backdrop pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="hero-mesh absolute inset-0" />
      <div className="hero-top-light absolute inset-x-0 top-0 h-[55%]" />

      <p
        className="hero-watermark absolute left-1/2 top-[-4%] -translate-x-1/2 select-none font-display font-semibold text-white"
        translate="no"
      >
        AGENT
      </p>

      {/* Soft ambient glow near bottom (half-circle detail is under the product) */}
      <div className="hero-horizon absolute inset-x-0 bottom-0 h-[45%]">
        <div className="hero-horizon-bloom opacity-60" />
      </div>

      <div className="hero-grain absolute inset-0" />
      <div className="hero-vignette absolute inset-x-0 bottom-0 h-40" />
    </div>
  );
}
