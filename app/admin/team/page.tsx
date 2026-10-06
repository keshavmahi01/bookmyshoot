import type { Metadata } from "next";
import { Notice } from "@/components/ui";
import { adminOverview, adminUsers } from "@/lib/queries";
import { addAdminUser, deleteAdminUser, deleteSampleData } from "@/app/actions/admin";
import { currentUser } from "@/lib/auth";
import { prettyDate } from "@/lib/format";
import { storageLabel } from "@/db/client";

export const metadata: Metadata = { title: "Admins" };

export default async function TeamPage() {
  const [admins, me, data] = await Promise.all([adminUsers(), currentUser(), adminOverview()]);
  const { sampleProfiles, sampleUsers } = data.counts;

  return (
    <div className="space-y-6">
      <Notice tone="info">
        Anyone on this list can open the admin panel and approve profiles. Keep it short. You cannot
        delete the login you are signed in with, and the last admin cannot be deleted either.
      </Notice>

      <section className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Added</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3 font-medium">
                  {admin.name}
                  {admin.sample ? (
                    <span className="ml-2 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-faint">
                      sample
                    </span>
                  ) : null}
                  {me && admin.id === me.id ? (
                    <span className="ml-2 text-xs text-ink-faint">this is you</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-ink-soft">{admin.email}</td>
                <td className="px-4 py-3 text-ink-soft">{admin.phone}</td>
                <td className="px-4 py-3 text-ink-soft">{prettyDate(admin.createdAt.slice(0, 10))}</td>
                <td className="px-4 py-3">
                  {me && admin.id === me.id ? (
                    <span className="text-xs text-ink-faint">-</span>
                  ) : (
                    <form action={deleteAdminUser}>
                      <input suppressHydrationWarning type="hidden" name="id" value={admin.id} />
                      <button
                        suppressHydrationWarning
                        className="btn btn-ghost px-3 py-1 text-xs text-brand"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Add an admin</h2>
        <p className="mt-1 text-sm text-ink-soft">
          They sign in at the normal login page with the email and password you set here.
        </p>
        <form action={addAdminUser} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="admin-name">Name</label>
            <input suppressHydrationWarning id="admin-name" name="name" className="field" required />
          </div>
          <div>
            <label className="field-label" htmlFor="admin-email">Email</label>
            <input
              suppressHydrationWarning
              id="admin-email"
              name="email"
              type="email"
              className="field"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="admin-phone">Phone</label>
            <input suppressHydrationWarning id="admin-phone" name="phone" className="field" required />
          </div>
          <div>
            <label className="field-label" htmlFor="admin-password">Password</label>
            <input
              suppressHydrationWarning
              id="admin-password"
              name="password"
              type="password"
              className="field"
              minLength={6}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button suppressHydrationWarning className="btn btn-primary" type="submit">
              Add admin
            </button>
          </div>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Sample data</h2>
        <p className="mt-1 text-sm text-ink-soft">
          The seed creates a few profiles and logins so the site has something to show while you set
          it up. Every one of them is named &quot;Sample&quot;. Remove them the day real people start signing
          up. This cannot be undone.
        </p>
        <p className="mt-3 text-sm">
          <span className="font-semibold">{sampleProfiles}</span> sample profiles and{" "}
          <span className="font-semibold">{sampleUsers}</span> sample logins are in the database
          right now.
        </p>
        {sampleProfiles + sampleUsers > 0 ? (
          <form action={deleteSampleData} className="mt-4">
            <button suppressHydrationWarning className="btn btn-ghost text-brand" type="submit">
              Remove all sample data
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-ink-faint">Nothing to remove. This is a clean database.</p>
        )}
      </section>

      <p className="text-xs text-ink-faint">Saving to {storageLabel()}.</p>
    </div>
  );
}
