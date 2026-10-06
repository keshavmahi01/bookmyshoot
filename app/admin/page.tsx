import type { Metadata } from "next";
import Link from "next/link";
import { StatTile } from "@/components/ui";
import { adminOverview } from "@/lib/queries";
import { prettyDate, timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminHome() {
  const data = await adminOverview();
  const emptyCities = data.byCity.filter((c) => c.count === 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Profiles" value={String(data.counts.profiles)} />
        <StatTile label="Live" value={String(data.counts.active)} />
        <StatTile label="Waiting approval" value={String(data.counts.awaiting)} note="not visible yet" />
        <StatTile label="Verified" value={String(data.counts.verified)} />
        <StatTile label="Enquiries" value={String(data.counts.enquiries)} />
        <StatTile label="Bookings" value={String(data.counts.bookings)} />
        <StatTile label="Reviews" value={String(data.counts.reviews)} />
      </div>

      {data.awaitingApproval.length ? (
        <section className="card border-gold/40 bg-brand-soft p-5">
          <h2 className="font-bold text-brand-deep">
            {data.awaitingApproval.length} profile{data.awaitingApproval.length === 1 ? "" : "s"} waiting for approval
          </h2>
          <p className="mt-1 text-sm text-brand-deep">
            These are not visible to anyone on the site yet.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-brand-deep">
            {data.awaitingApproval.slice(0, 6).map((p) => (
              <li key={p.id}>
                {p.displayName} &middot; joined {prettyDate(p.createdAt.slice(0, 10))}
              </li>
            ))}
          </ul>
          <Link href="/admin/approvals" className="btn btn-primary mt-4">Open the approval queue</Link>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Waiting for verification</h2>
          <p className="mb-3 text-sm text-ink-soft">{data.pending.length} profiles are still unverified.</p>
          <ul className="space-y-1 text-sm">
            {data.pending.slice(0, 8).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.displayName}</span>
                <span className="text-xs text-ink-faint">joined {prettyDate(p.createdAt.slice(0, 10))}</span>
              </li>
            ))}
            {data.pending.length === 0 ? <li className="text-ink-faint">Queue is clear.</li> : null}
          </ul>
          <Link href="/admin/verification" className="btn btn-ghost mt-4">Open the queue</Link>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Enquiries with no reply</h2>
          <p className="mb-3 text-sm text-ink-soft">
            {data.noReply.length} requests are still open. These are the ones that lose customers.
          </p>
          <ul className="space-y-1 text-sm">
            {data.noReply.slice(0, 8).map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <span>
                  {e.customerName} &middot; {e.cityName}
                </span>
                <span className="text-xs text-ink-faint">{timeAgo(e.createdAt)}</span>
              </li>
            ))}
            {data.noReply.length === 0 ? <li className="text-ink-faint">Nothing open.</li> : null}
          </ul>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Supply by city</h2>
        <p className="mb-3 text-sm text-ink-soft">
          A city with fewer than 5 active profiles is not worth pushing in marketing yet.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data.byCity.map((row) => (
            <div key={row.city.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
              <span>{row.city.name}</span>
              <span className={row.count < 5 ? "font-semibold text-brand" : "font-semibold"}>{row.count}</span>
            </div>
          ))}
        </div>
        {emptyCities.length ? (
          <p className="mt-3 text-sm text-ink-faint">
            No profiles at all in: {emptyCities.map((c) => c.city.name).join(", ")}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
