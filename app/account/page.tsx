import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/photo";
import { EmptyState, Stars } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { customerDashboard } from "@/lib/queries";
import { leaveReview } from "@/app/actions/enquiry";
import { prettyDate, rupees } from "@/lib/format";

export const metadata: Metadata = { title: "My bookings" };

const scores = [
  { name: "quality", label: "Photo and video quality" },
  { name: "punctuality", label: "On time and behaviour" },
  { name: "delivery", label: "Delivery on promise" },
  { name: "value", label: "Value for money" },
  { name: "communication", label: "Communication" },
];

export default async function AccountPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "PHOTOGRAPHER") redirect("/dashboard");
  if (user.role === "ADMIN") redirect("/admin");

  const rows = await customerDashboard(user.id);
  const waiting = rows.filter((r) => r.enquiry.status === "NEW");
  const confirmed = rows.filter((r) => r.booking?.status === "CONFIRMED");
  const finished = rows.filter((r) => r.booking?.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-bold">Hello {user.name}</h1>
      <p className="mt-1 text-sm text-ink-soft">Everything you have booked, in one place.</p>

      {rows.length === 0 ? (
        <div className="mt-8 animate-rise">
          <EmptyState
            title="Nothing booked yet"
            body="Pick your city and date, open a profile you like, and send a free booking request."
            action={{ label: "Find a photographer", href: "/search" }}
          />
        </div>
      ) : null}

      {/* Confirmed: the one thing a customer comes here to see */}
      {confirmed.map(({ enquiry, booking, profile, phone }) => (
        <section
          key={enquiry.id}
          className="card mt-6 overflow-hidden border-green/30 animate-rise"
        >
          <div className="flex items-center gap-2 bg-green-soft px-5 py-3 text-sm font-semibold text-green">
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true" className="animate-pop">
              <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.15" />
              <path d="M7.6 13.4L4.2 10l1.2-1.2 2.2 2.2 6-6L14.8 6z" fill="currentColor" />
            </svg>
            Your booking is confirmed
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3">
              <Avatar src={profile?.avatarPath} name={profile?.displayName ?? "Photographer"} size={52} />
              <div>
                <p className="font-bold">
                  {profile ? (
                    <Link href={`/p/${profile.slug}`} className="hover:text-brand">
                      {profile.displayName}
                    </Link>
                  ) : (
                    "Photographer"
                  )}
                </p>
                <p className="text-sm text-ink-soft">{enquiry.eventType}</p>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line-soft pt-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Date</dt>
                <dd className="mt-0.5 font-semibold">{prettyDate(booking!.eventDate)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Place</dt>
                <dd className="mt-0.5 font-semibold">{enquiry.venue || enquiry.cityName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Agreed amount</dt>
                <dd className="mt-0.5 font-semibold">
                  {booking!.amountAgreed ? rupees(booking!.amountAgreed) : "To be agreed"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-faint">Call him on</dt>
                <dd className="mt-0.5 font-semibold">
                  {phone ? (
                    <a href={`tel:${phone}`} className="text-brand hover:underline">
                      {phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>

            {enquiry.quoteNote ? (
              <p className="mt-4 rounded-lg bg-sand p-3 text-sm text-ink-soft">
                <strong className="text-ink">What is included:</strong> {enquiry.quoteNote}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/messages/${enquiry.id}`} className="btn btn-primary">
                Message {profile?.displayName ?? "the photographer"}
              </Link>
              {profile ? (
                <Link href={`/p/${profile.slug}`} className="btn btn-ghost">
                  Open the profile
                </Link>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-ink-faint">
              Pay him directly. Put the amount, the advance and the delivery date in writing in the
              chat before you pay anything.
            </p>
          </div>
        </section>
      ))}

      {/* Waiting */}
      {waiting.length ? (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Waiting for a reply
          </h2>
          <div className="grid gap-2">
            {waiting.map(({ enquiry, profile }) => (
              <div key={enquiry.id} className="card flex items-center gap-3 p-3">
                <Avatar src={profile?.avatarPath} name={profile?.displayName ?? "Photographer"} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{profile?.displayName}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {prettyDate(enquiry.eventDate)} &middot; {enquiry.cityName}
                  </p>
                </div>
                <Link
                  href={`/messages/${enquiry.id}`}
                  className="shrink-0 rounded-full border border-line bg-sand px-2.5 py-1 text-xs text-ink-soft hover:border-brand hover:text-brand"
                >
                  Chat
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            No reply in 24 hours? We will show you others who are free on the same date.
          </p>
        </section>
      ) : null}

      {/* Finished */}
      {finished.length ? (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Finished shoots
          </h2>
          <div className="grid gap-2">
            {finished.map(({ enquiry, booking, review, profile }) => (
              <div key={enquiry.id} className="card p-3">
                <div className="flex items-center gap-3">
                  <Avatar src={profile?.avatarPath} name={profile?.displayName ?? "Photographer"} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{profile?.displayName}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {prettyDate(booking!.eventDate)} &middot; {enquiry.eventType}
                    </p>
                  </div>
                  {review ? (
                    <Stars
                      value={
                        (review.quality +
                          review.punctuality +
                          review.delivery +
                          review.value +
                          review.communication) /
                        5
                      }
                    />
                  ) : null}
                </div>

                {review ? null : (
                  <details className="mt-3 border-t border-line-soft pt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-brand">
                      Rate this shoot
                    </summary>
                    <form action={leaveReview} className="mt-3">
                      <input suppressHydrationWarning type="hidden" name="bookingId" value={booking!.id} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        {scores.map((s) => (
                          <div key={s.name}>
                            <label className="field-label" htmlFor={`${s.name}-${booking!.id}`}>
                              {s.label}
                            </label>
                            <select suppressHydrationWarning
                              id={`${s.name}-${booking!.id}`}
                              name={s.name}
                              className="field"
                              defaultValue="5"
                            >
                              {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <label className="field-label" htmlFor={`comment-${booking!.id}`}>
                          Your comment
                        </label>
                        <textarea suppressHydrationWarning
                          id={`comment-${booking!.id}`}
                          name="comment"
                          rows={3}
                          className="field"
                          required
                        />
                      </div>
                      <button suppressHydrationWarning className="btn btn-primary mt-3" type="submit">Post review</button>
                    </form>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-10 text-center text-sm">
        <Link href="/search" className="font-semibold text-brand hover:underline">
          Book another shoot
        </Link>
      </p>
    </div>
  );
}
