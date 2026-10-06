import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/approvals", label: "Approvals" },
  { href: "/admin/verification", label: "Verification queue" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/content", label: "Pictures" },
  { href: "/admin/suggestions", label: "Suggestions" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/team", label: "Admins" },
  { href: "/admin/log", label: "Action log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Every action here is written to the log with your name, the time and the reason.
      </p>
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
