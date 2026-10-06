import type { Metadata } from "next";
import Link from "next/link";
import { StatTile, Notice } from "@/components/ui";
import { adminReport } from "@/lib/queries";

export const metadata: Metadata = { title: "Reports" };

const RANGES = [7, 30, 90];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days } = await searchParams;
  const window = RANGES.includes(Number(days)) ? Number(days) : 30;
  const r = await adminReport(window);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-faint">Last</span>
        {RANGES.map((n) => (
          <Link
            key={n}
            href={`/admin/reports?days=${n}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              n === window
                ? "border-brand bg-brand-soft font-semibold text-brand-deep"
                : "border-line bg-surface text-ink-soft hover:border-ink-faint"
            }`}
          >
            {n} days
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatTile label="New profiles" value={String(r.newProfiles)} />
        <StatTile label="Approved" value={String(r.approvedProfiles)} />
        <StatTile label="Enquiries" value={String(r.enquiries)} />
        <StatTile label="Bookings" value={String(r.bookings)} />
        <StatTile label="Reply rate" value={`${r.replyRate}%`} note="requests that got an answer" />
        <StatTile label="Booking rate" value={`${r.bookingRate}%`} note="requests that became bookings" />
        <StatTile
          label="Median reply time"
          value={r.medianReplyHours === null ? "—" : `${r.medianReplyHours.toFixed(1)} hr`}
        />
        <StatTile label="Unanswered" value={String(r.unanswered)} note="still open" />
      </div>

      {r.unanswered > 0 ? (
        <Notice tone="warn">
          {r.unanswered} requests in this period never got a reply. Those are the customers who do
          not come back. Chase the photographers who sit on them.
        </Notice>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Where the demand is</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
                <th className="py-2">City</th>
                <th className="py-2">Enquiries</th>
                <th className="py-2">Bookings</th>
              </tr>
            </thead>
            <tbody>
              {r.byCity.map((row) => (
                <tr key={row.city} className="border-b border-line-soft last:border-0">
                  <td className="py-2 font-medium">{row.city}</td>
                  <td className="py-2">{row.enquiries}</td>
                  <td className="py-2">{row.bookings}</td>
                </tr>
              ))}
              {r.byCity.length === 0 ? (
                <tr>
                  <td className="py-3 text-ink-faint" colSpan={3}>Nothing in this period.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">What people are asking for</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {r.topCategories.map((row) => (
              <li key={row.name} className="flex items-center gap-3">
                <span className="w-44 shrink-0 text-ink-soft">{row.name}</span>
                <span className="h-1.5 flex-1 rounded bg-line-soft">
                  <span
                    className="block h-1.5 rounded bg-brand"
                    style={{
                      width: `${(row.count / (r.topCategories[0]?.count || 1)) * 100}%`,
                    }}
                  />
                </span>
                <span className="w-8 text-right tabular-nums">{row.count}</span>
              </li>
            ))}
            {r.topCategories.length === 0 ? (
              <li className="text-ink-faint">Nothing in this period.</li>
            ) : null}
          </ul>

          {r.emptyCities.length ? (
            <p className="mt-5 border-t border-line-soft pt-4 text-sm text-ink-soft">
              <strong className="text-ink">No live profile at all in:</strong>{" "}
              {r.emptyCities.join(", ")}. A search in those cities finds nothing, so do not spend on
              marketing there yet.
            </p>
          ) : null}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Download</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Opens in Excel or Google Sheets. It is your own data, so keep the file safe: it has
          customer phone numbers in it.
        </p>
        <div className="flex flex-wrap gap-2">
          {["profiles", "enquiries", "bookings", "reviews"].map((kind) => (
            <a key={kind} href={`/admin/export/${kind}`} className="btn btn-ghost">
              {kind} CSV
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
