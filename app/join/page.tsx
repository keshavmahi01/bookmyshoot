import type { Metadata } from "next";
import Link from "next/link";
import { VERIFICATION } from "@/lib/constants";
import { platformStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: "List your work",
  description: "Free listing for photographers, videographers, drone pilots and editing studios in India.",
};

export default async function JoinPage() {
  const stats = await platformStats();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">List your work on BookMyShoot</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Free to list. You set your own rates, you keep your own calendar, and the customer pays you
        directly. We do not take a cut of your shoot.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/signup?role=photographer" className="btn btn-primary">Create a free profile</Link>
        <Link href="/login" className="btn btn-ghost">I already have a profile</Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Profiles listed", value: String(stats.photographers) },
          { label: "Enquiries sent", value: String(stats.enquiries) },
          { label: "Jobs completed", value: String(stats.completed) },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-sm text-ink-faint">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-lg font-bold">You decide how you sell your time</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          { title: "Per hour", body: "Good for birthdays, small functions and product shoots. Set a minimum number of hours and an extra hour rate." },
          { title: "Per day", body: "The normal way to price a wedding function or a corporate event. Set how many hours a day covers." },
          { title: "Per week", body: "A cheaper block rate for destination weddings, long ad shoots and documentaries." },
          { title: "Event package", body: "A fixed package with a clear list, for example a two day wedding with album and reel." },
        ].map((r) => (
          <div key={r.title} className="card p-4">
            <p className="font-semibold">{r.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
          </div>
        ))}
      </div>

      <h2 id="verification" className="mt-12 text-lg font-bold">Verification levels</h2>
      <p className="mt-1 text-sm text-ink-soft">
        A badge on BookMyShoot says exactly what we checked, nothing more. We never promise that your
        work is good, only what we verified.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-2 pr-4 font-semibold">Level</th>
              <th className="py-2 pr-4 font-semibold">What we check</th>
              <th className="py-2 font-semibold">What the customer sees</th>
            </tr>
          </thead>
          <tbody className="text-ink-soft">
            {Object.entries(VERIFICATION).map(([key, v]) => (
              <tr key={key} className="border-b border-line-soft align-top">
                <td className="py-3 pr-4 font-medium text-ink">{v.label}</td>
                <td className="py-3 pr-4">{v.note}</td>
                <td className="py-3">
                  {key === "LISTED" ? "Plain profile, no badge" : key === "ID_VERIFIED" ? "Blue ID verified tick" : "Green Work verified badge"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink-faint">
        For Work verified we ask for the original camera file of three shoots, not a WhatsApp copy, and
        we speak to two past clients. Work verified is checked again every 12 months.
      </p>

      <h2 className="mt-12 text-lg font-bold">House rules</h2>
      <ul className="mt-3 space-y-2 text-sm text-ink-soft">
        <li>Upload only your own work. Three valid copyright reports and the profile drops back to Listed.</li>
        <li>Keep the calendar honest. A calendar not opened for 7 days is marked not updated and drops in search.</li>
        <li>Reply to enquiries within 24 hours, even to say no. Your reply time is shown publicly.</li>
        <li>Cancellations in the last 12 months are shown on your profile. Nobody can hide them.</li>
      </ul>

      <div className="card mt-10 bg-sand p-6">
        <p className="font-semibold">Not sure how to fill the profile?</p>
        <p className="mt-1 text-sm text-ink-soft">
          Send us your Instagram handle and we will build the first version of your profile for you.
          You check it and approve before it goes live.
        </p>
        <Link href="/contact" className="btn btn-ghost mt-4">Ask us to build it</Link>
      </div>
    </div>
  );
}
