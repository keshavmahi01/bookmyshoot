import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Logo } from "@/components/logo";

const columns = [
  {
    title: "For customers",
    links: [
      { href: "/search", label: "Find a photographer" },
      { href: "/categories", label: "Browse shoot types" },
      { href: "/cities", label: "Browse cities" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/guides", label: "Guides" },
    ],
  },
  {
    title: "For photographers",
    links: [
      { href: "/join", label: "List your work" },
      { href: "/join#verification", label: "Verification levels" },
      { href: "/help", label: "Help" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/grievance", label: "Grievance officer" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of use" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/cancellation", label: "Cancellation policy" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              {SITE.tagline}. We introduce you to the photographer. The shoot contract and the
              payment stay between the two of you.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-ink-soft hover:text-ink">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-line pt-6 text-xs text-ink-faint">
          {SITE.name} is a listing and introduction platform. We do not take payment for shoots and we do not
          guarantee any photographer&apos;s work. Verification badges show only what we checked, and each badge page
          says exactly what that is.
        </p>
      </div>
    </footer>
  );
}
