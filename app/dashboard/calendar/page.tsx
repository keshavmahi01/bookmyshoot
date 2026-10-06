import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Availability from "@/components/availability";
import { Notice } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getPhotographerByUserId, upcomingDates } from "@/lib/queries";
import { toggleDate } from "@/app/actions/photographer";
import { prettyDate, toISODate } from "@/lib/format";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  const next30 = upcomingDates(30);
  const today = toISODate(new Date());

  return (
    <div className="space-y-6">
      <Notice tone="info">
        Keep this honest. A calendar that has not been opened for 7 days is marked not updated and the
        profile drops in search results.
      </Notice>

      <section className="card p-5">
        <h2 className="font-bold">Next three months</h2>
        <p className="mb-4 text-sm text-ink-soft">
          This is exactly what customers see on your public profile.
        </p>
        <Availability blocked={detail.blocked} weeklyOff={detail.profile.weeklyOff} />
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Mark the next 30 days</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Tap a date to switch it between free and busy. Dates blocked by a confirmed booking can be
          freed here too, but tell the customer first.
        </p>
        <div className="flex flex-wrap gap-2">
          {next30.map((date) => {
            const state = detail.blocked.get(date);
            const busy = Boolean(state);
            return (
              <form key={date} action={toggleDate}>
                <input suppressHydrationWarning type="hidden" name="date" value={date} />
                <button suppressHydrationWarning
                  type="submit"
                  title={prettyDate(date)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    busy
                      ? "border-brand/30 bg-brand-soft text-brand-deep"
                      : "border-line bg-surface text-ink-soft hover:border-ink-faint"
                  } ${date === today ? "ring-1 ring-ink" : ""}`}
                >
                  {prettyDate(date).replace(` ${new Date().getFullYear()}`, "")}
                  <span className="mt-0.5 block text-[10px] font-normal">
                    {busy ? (state === "HOLD" ? "on hold" : "busy") : "free"}
                  </span>
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </div>
  );
}
