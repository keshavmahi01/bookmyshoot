export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="bms-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#5b21b6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#bms-tile)" />
      {/* camera body */}
      <path
        d="M8.5 15.6h4.4l1.5-2.5a1.8 1.8 0 0 1 1.5-.9h8.2a1.8 1.8 0 0 1 1.5.9l1.5 2.5h4.4a2 2 0 0 1 2 2v9.6a2 2 0 0 1-2 2h-23a2 2 0 0 1-2-2v-9.6a2 2 0 0 1 2-2z"
        fill="#fff"
        fillOpacity="0.96"
      />
      {/* lens */}
      <circle cx="20" cy="22.4" r="5.4" fill="#4c1d95" />
      <circle cx="20" cy="22.4" r="2.3" fill="#fff" fillOpacity="0.92" />
      {/* booked tick */}
      <circle cx="29.6" cy="18.2" r="1.3" fill="#ddd6fe" />
    </svg>
  );
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={size} />
      <span className="text-lg font-extrabold tracking-tight">
        Book<span className="text-brand">My</span>Shoot
      </span>
    </span>
  );
}
