import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Stars } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getPhotographerByUserId } from "@/lib/queries";
import { replyToReview } from "@/app/actions/photographer";
import { prettyDate } from "@/lib/format";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <p className="text-4xl font-bold tabular-nums">
            {detail.rating.count ? detail.rating.average.toFixed(1) : "—"}
          </p>
          <div>
            <Stars value={detail.rating.average} size={18} />
            <p className="mt-1 text-sm text-ink-faint">{detail.rating.count} reviews</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          You can reply once to each review. You cannot delete a review, and neither can we without a
          written reason that goes into the admin log.
        </p>
      </div>

      {detail.reviews.length === 0 ? (
        <div className="card p-6 text-sm text-ink-soft">
          No reviews yet. They start coming once a booking is marked complete.
        </div>
      ) : (
        detail.reviews.map((r) => {
          const avg = (r.quality + r.punctuality + r.delivery + r.value + r.communication) / 5;
          return (
            <article key={r.id} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.authorName}</p>
                <span className="text-xs text-ink-faint">{prettyDate(r.createdAt.slice(0, 10))}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Stars value={avg} />
                <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>

              {r.reply ? (
                <p className="mt-3 rounded-lg bg-sand p-3 text-sm text-ink-soft">
                  <strong className="text-ink">Your reply:</strong> {r.reply}
                </p>
              ) : (
                <form action={replyToReview} className="mt-3 flex flex-wrap items-end gap-2">
                  <input suppressHydrationWarning type="hidden" name="reviewId" value={r.id} />
                  <div className="flex-1">
                    <label className="field-label" htmlFor={`reply-${r.id}`}>Your reply</label>
                    <input suppressHydrationWarning id={`reply-${r.id}`} name="reply" className="field" required />
                  </div>
                  <button suppressHydrationWarning className="btn btn-ghost" type="submit">Post reply</button>
                </form>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
