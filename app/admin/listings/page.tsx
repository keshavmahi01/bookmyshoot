import type { Metadata } from "next";
import Link from "next/link";
import { adminOverview } from "@/lib/queries";
import { deleteProfile, toggleListing } from "@/app/actions/admin";
import { prettyDate } from "@/lib/format";

export const metadata: Metadata = { title: "Listings" };

export default async function ListingsPage() {
  const data = await adminOverview();

  return (
    <>
      <p className="mb-4 text-sm text-ink-soft">
        Pause takes a profile off the site and keeps everything. Delete removes the profile, its
        photos, its leads and its login for good. Sample rows are the ones the seed created.
      </p>
      <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
            <th className="px-4 py-2">Profile</th>
            <th className="px-4 py-2">City</th>
            <th className="px-4 py-2">Approval</th>
            <th className="px-4 py-2">Level</th>
            <th className="px-4 py-2">Last active</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.profiles.map(({ profile, city }) => (
            <tr key={profile.id} className="border-b border-line-soft last:border-0 align-top">
              <td className="px-4 py-3 font-medium">
                <Link href={`/p/${profile.slug}`} className="hover:text-brand">{profile.displayName}</Link>
                {profile.sample ? (
                  <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
                    sample
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-ink-soft">{city.name}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    profile.status === "APPROVED"
                      ? "text-green"
                      : profile.status === "PENDING"
                        ? "text-gold"
                        : "text-brand"
                  }
                >
                  {profile.status.toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-3 text-ink-soft">{profile.verification.replace("_", " ").toLowerCase()}</td>
              <td className="px-4 py-3 text-ink-soft">{prettyDate(profile.lastActiveAt.slice(0, 10))}</td>
              <td className="px-4 py-3">
                <span className={profile.active ? "text-green" : "text-brand"}>
                  {profile.active ? "Live" : "Paused"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <form action={toggleListing} className="flex items-end gap-2">
                    <input suppressHydrationWarning type="hidden" name="photographerId" value={profile.id} />
                    <input suppressHydrationWarning name="reason" className="field w-44 py-1 text-xs" placeholder="Reason" />
                    <button suppressHydrationWarning className="btn btn-ghost px-3 py-1 text-xs" type="submit">
                      {profile.active ? "Pause" : "Restore"}
                    </button>
                  </form>
                  <form action={deleteProfile} className="flex items-end gap-2">
                    <input suppressHydrationWarning type="hidden" name="photographerId" value={profile.id} />
                    <input suppressHydrationWarning name="reason" className="field w-44 py-1 text-xs" placeholder="Why delete" />
                    <button
                      suppressHydrationWarning
                      className="btn btn-ghost px-3 py-1 text-xs text-brand"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </>
  );
}
