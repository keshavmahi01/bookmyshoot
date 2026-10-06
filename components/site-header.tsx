import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/notify";
import { Logo } from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";
import { logout } from "@/app/actions/auth";

export default async function SiteHeader() {
  const user = await currentUser();
  const unread = user ? await unreadCount(user.id) : 0;
  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "PHOTOGRAPHER" ? "/dashboard" : "/account";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" aria-label="BookMyShoot home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-ink-soft md:flex">
          <Link href="/search" className="nav-link hover:text-ink">Find a photographer</Link>
          <Link href="/categories" className="nav-link hover:text-ink">Shoot types</Link>
          <Link href="/guides" className="nav-link hover:text-ink">Guides</Link>
          <Link href="/join" className="nav-link hover:text-ink">For photographers</Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/notifications"
                aria-label={unread ? `${unread} unread notifications` : "Notifications"}
                className="relative grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-brand hover:text-brand"
              >
                <svg width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
                  <path
                    d="M10 2.2a5 5 0 0 0-5 5v2.4L3.6 12a1 1 0 0 0 .85 1.5h11.1A1 1 0 0 0 16.4 12L15 9.6V7.2a5 5 0 0 0-5-5zM8.2 15a1.9 1.9 0 0 0 3.6 0z"
                    fill="currentColor"
                  />
                </svg>
                {unread ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                ) : null}
              </Link>
              <span className="hidden sm:block">
                <Link href={dashboardHref} className="btn btn-ghost">
                  {user.role === "PHOTOGRAPHER" ? "My dashboard" : user.role === "ADMIN" ? "Admin" : "My account"}
                </Link>
              </span>
              <form action={logout}>
                <button suppressHydrationWarning className="btn btn-ghost" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Log in</Link>
              <span className="hidden sm:block">
                <Link href="/join" className="btn btn-primary">List your work</Link>
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
