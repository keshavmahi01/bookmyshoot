import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { listNotifications } from "@/lib/notify";
import { clearNotifications } from "@/app/actions/notifications";
import { timeAgo } from "@/lib/format";

export const metadata: Metadata = { title: "Notifications" };

const LABEL: Record<string, string> = {
  LEAD: "New request",
  REPLY: "Reply",
  MESSAGE: "Message",
  APPROVAL: "Approval",
  REVIEW: "Review",
};

export default async function NotificationsPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const rows = await listNotifications(user.id);
  const unread = rows.filter((r) => !r.readAt).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {unread ? `${unread} unread` : "Everything is read"}
          </p>
        </div>
        {unread ? (
          <form action={clearNotifications}>
            <button className="btn btn-ghost" type="submit">Mark all read</button>
          </form>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing yet"
            body="New booking requests, replies and messages will show up here."
            action={{ label: "Go to the home page", href: "/" }}
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-2">
          {rows.map((n) => (
            <li key={n.id}>
              <Link
                href={n.link}
                className={`card lift block p-4 ${n.readAt ? "" : "border-brand/40 bg-brand-soft"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
                    {LABEL[n.kind] ?? n.kind}
                  </span>
                  <span className="text-xs text-ink-faint">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 font-semibold">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-sm text-ink-soft">{n.body}</p> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
