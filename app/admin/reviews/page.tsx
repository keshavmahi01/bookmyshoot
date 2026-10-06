import type { Metadata } from "next";
import { Stars } from "@/components/ui";
import { adminOverview } from "@/lib/queries";
import { hideReview } from "@/app/actions/admin";
import { prettyDate } from "@/lib/format";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const data = await adminOverview();

  return (
    <div className="space-y-4">
      <div className="card bg-sand p-4 text-sm text-ink-soft">
        A review is hidden only with a written reason, and the reason goes into the log. Never hide a
        review because the photographer asked. India has a standard for online reviews and this is the
        part that gets platforms into trouble.
      </div>

      {data.reviews.map(({ review, profile }) => {
        const avg =
          (review.quality + review.punctuality + review.delivery + review.value + review.communication) / 5;
        return (
          <article key={review.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {review.authorName} <span className="font-normal text-ink-faint">on</span> {profile}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Stars value={avg} />
                  <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
                </div>
              </div>
              <span className="text-xs text-ink-faint">{prettyDate(review.createdAt.slice(0, 10))}</span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{review.comment}</p>
            {review.hidden ? (
              <p className="mt-2 text-sm text-brand">Hidden. Reason: {review.hiddenReason}</p>
            ) : null}
            <form action={hideReview} className="mt-3 flex flex-wrap items-end gap-2 border-t border-line-soft pt-3">
              <input suppressHydrationWarning type="hidden" name="reviewId" value={review.id} />
              <div className="flex-1">
                <label className="field-label" htmlFor={`r-${review.id}`}>Reason, required</label>
                <input suppressHydrationWarning id={`r-${review.id}`} name="reason" className="field" required />
              </div>
              <button suppressHydrationWarning className="btn btn-ghost" type="submit">{review.hidden ? "Unhide" : "Hide"}</button>
            </form>
          </article>
        );
      })}
    </div>
  );
}
