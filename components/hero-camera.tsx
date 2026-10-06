/**
 * A camera at the side of the hero whose light falls on the search box.
 * Decoration only: hidden on small screens, and the beam stops moving when
 * the device asks for reduced motion.
 */
export default function HeroCamera() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <svg className="hero-rig" width="1000" height="640" viewBox="0 0 1000 640" fill="none">
        <defs>
          <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="rgb(var(--color-glow))" stopOpacity="0.4" />
            <stop offset="0.45" stopColor="rgb(var(--color-glow))" stopOpacity="0.16" />
            <stop offset="1" stopColor="rgb(var(--color-glow))" stopOpacity="0" />
          </linearGradient>
          <filter id="beam-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>

        {/* the light */}
        <g className="hero-beam" style={{ transformOrigin: "830px 96px" }}>
          <polygon points="830,70 0,372 0,612 830,124" fill="url(#beam)" filter="url(#beam-soft)" />
          <polygon points="830,86 0,452 0,520 830,106" fill="url(#beam)" opacity="0.55" />
        </g>

        {/* tripod */}
        <g stroke="var(--color-ink-faint)" strokeWidth="2.6" strokeLinecap="round" opacity="0.5">
          <path d="M830 122v24" />
          <path d="M830 146l-22 34" />
          <path d="M830 146l22 34" />
          <path d="M830 162h-12" />
        </g>

        {/* body */}
        <rect
          x="779"
          y="46"
          width="102"
          height="56"
          rx="13"
          fill="var(--color-surface)"
          stroke="var(--color-ink-faint)"
          strokeWidth="2.6"
        />
        <path
          d="M810 46l6-10a5 5 0 0 1 4.3-2.2h19.4A5 5 0 0 1 844 36l6 10"
          fill="var(--color-surface)"
          stroke="var(--color-ink-faint)"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <rect x="856" y="54" width="15" height="7" rx="3.5" fill="var(--color-ink-faint)" opacity="0.45" />

        {/* lens, where the light comes from */}
        <circle cx="830" cy="74" r="21" fill="var(--color-sand)" stroke="var(--color-ink-faint)" strokeWidth="2.6" />
        <circle cx="830" cy="74" r="12.5" fill="rgb(var(--color-glow))" opacity="0.2" />
        <circle className="hero-lens" cx="830" cy="74" r="7.5" fill="rgb(var(--color-glow))" />
        <circle cx="825" cy="69" r="2.6" fill="var(--color-surface)" opacity="0.85" />
      </svg>
    </div>
  );
}
