import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";
import { getPhotographerByUserId } from "@/lib/queries";
import { Notice, StatTile } from "@/components/ui";
import { SITE_URL } from "@/lib/seo";
import { prettyDate } from "@/lib/format";
import CopyLink from "./copy-link";

export const metadata: Metadata = { title: "Invite" };

export default async function InvitePage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  const link = `${SITE_URL}/join?ref=${detail.profile.slug}`;
  const invited = await cols.photographers.find(
    { referredBy: detail.profile.slug },
    { sort: { createdAt: -1 } },
  );
  const live = invited.filter((p) => p.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <Notice tone="info">
        The fastest way this site grows is photographers bringing the people they already shoot with.
        Share your link with the ones whose work you would put your own name behind.
      </Notice>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Invited" value={String(invited.length)} note="signed up with your link" />
        <StatTile label="Live" value={String(live)} note="approved by our team" />
        <StatTile
          label="Waiting"
          value={String(invited.filter((p) => p.status === "PENDING").length)}
        />
      </div>

      <section className="card p-5">
        <h2 className="font-bold">Your invite link</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Anyone who signs up through this link is counted against your name. They still go through
          the same approval as everyone else.
        </p>
        <CopyLink link={link} />
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Who joined</h2>
        {invited.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">Nobody yet. Send the link to two people today.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line-soft text-sm">
            {invited.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span className="font-medium">{p.displayName}</span>
                <span className="text-ink-faint">
                  {p.status.toLowerCase()} &middot; {prettyDate(p.createdAt.slice(0, 10))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
