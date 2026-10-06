import Link from "next/link";
import { VERIFICATION } from "@/lib/constants";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="inline-flex items-center gap-[1px]" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`half-${i}-${size}`}>
                <stop offset="50%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#e7e1d8" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.6 7.7l5.8-.8z"
              fill={fill === 1 ? "#b45309" : fill === 0.5 ? `url(#half-${i}-${size})` : "#e7e1d8"}
            />
          </svg>
        );
      })}
    </span>
  );
}

export function RatingLine({ average, count }: { average: number; count: number }) {
  if (count === 0) {
    return <span className="text-sm text-ink-faint">No reviews yet</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Stars value={average} />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-ink-faint">
        from {count} {count === 1 ? "review" : "reviews"}
      </span>
    </span>
  );
}

export function VerifiedBadge({ level, showNote = false }: { level: string; showNote?: boolean }) {
  const info = VERIFICATION[level as keyof typeof VERIFICATION] ?? VERIFICATION.LISTED;
  if (level === "LISTED") {
    return (
      <span className="inline-flex items-center rounded-full border border-line bg-sand px-2 py-0.5 text-xs font-medium text-ink-faint">
        Listed
      </span>
    );
  }
  const tone =
    level === "WORK_VERIFIED"
      ? "border-green/30 bg-green-soft text-green"
      : "border-info/30 bg-info-soft text-info";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${tone}`}>
        <svg width="11" height="11" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M7.6 13.4L4.2 10l1.2-1.2 2.2 2.2 6-6L14.8 6z" fill="currentColor" />
        </svg>
        {info.short}
      </span>
      {showNote ? <span className="text-xs text-ink-faint">{info.note}</span> : null}
    </span>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-soft">
      {children}
    </span>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="shrink-0 text-sm font-semibold text-brand hover:underline">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="card p-10 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{body}</p>
      {action ? (
        <Link href={action.href} className="btn btn-primary mt-5">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {note ? <p className="mt-0.5 text-xs text-ink-faint">{note}</p> : null}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "good"; children: React.ReactNode }) {
  const map = {
    info: "border-info/25 bg-info-soft text-info",
    warn: "border-gold/30 bg-brand-soft text-brand-deep",
    good: "border-green/25 bg-green-soft text-green",
  };
  return <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${map[tone]}`}>{children}</div>;
}
