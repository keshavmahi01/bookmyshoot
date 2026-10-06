import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatTile, Notice } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { enquiriesForPhotographer, getPhotographerByUserId, threadSummary } from "@/lib/queries";
import { prettyDate, responseText, rupees, timeAgo } from "@/lib/format";
import { acceptEnquiry, declineEnquiry } from "@/app/actions/enquiry";
import { rateLabel } from "@/lib/constants";

export const metadata: Metadata = { title: "Leads" };

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  const list = await enquiriesForPhotographer(detail.profile.id);
  const threads = await threadSummary(list.map((e) => e.id));
  const newOnes = list.filter((e) => e.status === "NEW");
  const answered = list.filter((e) => e.status !== "NEW").slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatTile label="New leads" value={String(newOnes.length)} note="waiting for your reply" />
        <StatTile label="Jobs done" value={String(detail.profile.jobsCompleted)} />
        <StatTile
          label="Rating"
          value={detail.rating.count ? detail.rating.average.toFixed(1) : "—"}
          note={`${detail.rating.count} reviews`}
        />
        <StatTile
          label="Reply time"
          value={`${detail.profile.responseHours} hr`}
          note={responseText(detail.profile.responseHours)}
        />
      </div>

      {newOnes.length > 0 ? (
        <Notice tone="warn">
          You have {newOnes.length} {newOnes.length === 1 ? "request" : "requests"} waiting. A request
          with no reply in 24 hours goes cold and the customer is shown other photographers.
        </Notice>
      ) : null}

      <section>
        <h2 className="mb-3 font-bold">New requests</h2>
        {newOnes.length === 0 ? (
          <div className="card p-6 text-sm text-ink-soft">
            Nothing new right now. Keep your calendar updated so you stay high in search.
          </div>
        ) : (
          <div className="grid gap-3">
            {newOnes.map((e) => (
              <article key={e.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{e.customerName}</p>
                    <p className="text-sm text-ink-soft">
                      {e.eventType} &middot; {e.cityName}
                      {e.venue ? ` · ${e.venue}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-ink-faint">{timeAgo(e.createdAt)}</span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase text-ink-faint">Date</dt>
                    <dd className="font-medium">{prettyDate(e.eventDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-ink-faint">Booking type</dt>
                    <dd className="font-medium">{rateLabel(e.rateType)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-ink-faint">Their budget</dt>
                    <dd className="font-medium">{e.budget ? rupees(e.budget) : "Not given"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-ink-faint">Phone</dt>
                    <dd className="font-medium">{e.customerPhone}</dd>
                  </div>
                </dl>

                {e.message ? (
                  <p className="mt-3 rounded-lg bg-sand p-3 text-sm text-ink-soft">{e.message}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line-soft pt-4">
                  <form action={acceptEnquiry} className="flex flex-wrap items-end gap-2">
                    <input suppressHydrationWarning type="hidden" name="enquiryId" value={e.id} />
                    <div>
                      <label className="field-label" htmlFor={`q-${e.id}`}>Your quote</label>
                      <input suppressHydrationWarning
                        id={`q-${e.id}`}
                        name="quoteAmount"
                        inputMode="numeric"
                        className="field w-36"
                        defaultValue={e.budget ?? ""}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`n-${e.id}`}>Note</label>
                      <input suppressHydrationWarning id={`n-${e.id}`} name="quoteNote" className="field w-56" placeholder="What is included" />
                    </div>
                    <button suppressHydrationWarning className="btn btn-primary" type="submit">Accept and block date</button>
                  </form>
                  <form action={declineEnquiry}>
                    <input suppressHydrationWarning type="hidden" name="enquiryId" value={e.id} />
                    <button suppressHydrationWarning className="btn btn-ghost" type="submit">Decline</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-bold">Earlier requests</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Event date</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Quote</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Chat</th>
              </tr>
            </thead>
            <tbody>
              {answered.map((e) => (
                <tr key={e.id} className="border-b border-line-soft last:border-0">
                  <td className="px-4 py-2 font-medium">{e.customerName}</td>
                  <td className="px-4 py-2">{prettyDate(e.eventDate)}</td>
                  <td className="px-4 py-2 text-ink-soft">{e.eventType}</td>
                  <td className="px-4 py-2">{e.quoteAmount ? rupees(e.quoteAmount) : "—"}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full border border-line px-2 py-0.5 text-xs">{e.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    {e.userId ? (
                      <Link href={`/messages/${e.id}`} className="font-semibold text-brand hover:underline">
                        Chat
                        {threads.get(e.id)?.unreadPhotographer
                          ? ` (${threads.get(e.id)?.unreadPhotographer})`
                          : ""}
                      </Link>
                    ) : (
                      <span className="text-ink-faint">no account</span>
                    )}
                  </td>
                </tr>
              ))}
              {answered.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-ink-faint" colSpan={6}>Nothing here yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
