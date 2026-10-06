import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getPhotographerByUserId, profileCompleteness } from "@/lib/queries";
import { Avatar } from "@/components/photo";

const tabs = [
  { href: "/dashboard", label: "Leads" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/photos", label: "Photos" },
  { href: "/dashboard/rates", label: "Rates" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/reviews", label: "Reviews" },
  { href: "/dashboard/invite", label: "Invite" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "PHOTOGRAPHER") redirect("/account");

  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");
  const complete = profileCompleteness(detail);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={detail.profile.avatarPath} name={detail.profile.displayName} size={48} />
          <div>
          <h1 className="text-2xl font-bold">{detail.profile.displayName}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {detail.city.name} &middot;{" "}
            <Link href={`/p/${detail.profile.slug}`} className="text-brand hover:underline">
              See your public profile
            </Link>
          </p>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-xs text-ink-faint">
            <span>Profile strength</span>
            <span className="font-semibold text-ink">{complete.percent}%</span>
          </div>
          <div className="mt-1 h-2 rounded bg-line-soft">
            <div className="h-2 rounded bg-green" style={{ width: `${complete.percent}%` }} />
          </div>
        </div>
      </div>

      {detail.profile.status !== "APPROVED" ? (
        <div
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
            detail.profile.status === "PENDING"
              ? "border-gold/30 bg-brand-soft text-brand-deep"
              : "border-brand/30 bg-brand-soft text-brand-deep"
          }`}
        >
          {detail.profile.status === "PENDING" ? (
            <>
              <strong>Pending for verification. Please wait about 1 hour.</strong> Your account is
              made and you can fill everything in right now, but nobody can find your profile in
              search until our team approves it. Add your photos, rates and shoot types first, that
              is what we check.
            </>
          ) : (
            <>
              <strong>Your profile was not approved.</strong>{" "}
              {detail.profile.reviewNote || "Please write to us for the reason."} Fix it and write to
              us, and we will look again.
            </>
          )}
        </div>
      ) : null}

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-ink-soft hover:border-line hover:text-ink"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
