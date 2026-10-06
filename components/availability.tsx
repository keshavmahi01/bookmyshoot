import { toISODate } from "@/lib/format";
import { WEEKDAYS } from "@/lib/constants";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Availability({
  blocked,
  weeklyOff,
  months = 3,
  highlight,
}: {
  blocked: Map<string, string>;
  weeklyOff: number[];
  months?: number;
  highlight?: string;
}) {
  const today = new Date();
  const todayISO = toISODate(today);

  const grids = Array.from({ length: months }, (_, m) => {
    const first = new Date(today.getFullYear(), today.getMonth() + m, 1);
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    const cells: ({ iso: string; day: number; state: string } | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(first.getFullYear(), first.getMonth(), d);
      const iso = toISODate(date);
      let state = "free";
      if (iso < todayISO) state = "past";
      else if (blocked.get(iso) === "BUSY") state = "busy";
      else if (blocked.get(iso) === "HOLD") state = "hold";
      else if (weeklyOff.includes(date.getDay())) state = "off";
      cells.push({ iso, day: d, state });
    }
    return { label: `${MONTHS[first.getMonth()]} ${first.getFullYear()}`, cells };
  });

  const tone: Record<string, string> = {
    free: "bg-green-soft text-green",
    busy: "bg-brand-soft text-brand-deep line-through",
    hold: "bg-sand text-ink-faint",
    off: "bg-line-soft text-ink-faint",
    past: "text-ink-faint/40",
  };

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-3">
        {grids.map((grid) => (
          <div key={grid.label}>
            <p className="mb-2 text-sm font-semibold">{grid.label}</p>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
              {WEEKDAYS.map((w) => (
                <span key={w} className="py-1 font-semibold text-ink-faint">{w[0]}</span>
              ))}
              {grid.cells.map((cell, i) =>
                cell === null ? (
                  <span key={`empty-${i}`} />
                ) : (
                  <span
                    key={cell.iso}
                    title={
                      cell.state === "busy"
                        ? "Booked"
                        : cell.state === "hold"
                          ? "On hold"
                          : cell.state === "off"
                            ? "Weekly off"
                            : "Free"
                    }
                    className={`rounded py-1 ${tone[cell.state]} ${
                      highlight === cell.iso ? "ring-2 ring-brand" : ""
                    }`}
                  >
                    {cell.day}
                  </span>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-green-soft ring-1 ring-green/30" /> Free
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-brand-soft ring-1 ring-brand/30" /> Booked
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-sand ring-1 ring-line" /> On hold
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-line-soft ring-1 ring-line" /> Weekly off
        </span>
      </div>
    </div>
  );
}
