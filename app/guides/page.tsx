import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { SectionTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Plain guides on booking a photographer in India: what things cost, what to ask, what to put in writing, and the drone rules.",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Guides</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Short, practical notes for anyone booking a shoot in India. No sales talk, and nothing here
        pushes you towards a particular photographer.
      </p>

      <div className="mt-8 grid gap-3 animate-rise sm:grid-cols-2">
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="card lift block p-5">
            <p className="text-xs uppercase tracking-wide text-ink-faint">
              {guide.readMinutes} min read
            </p>
            <p className="mt-1 font-semibold leading-snug">{guide.title}</p>
            <p className="mt-2 text-sm text-ink-soft">{guide.summary}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <SectionTitle
          title="Ready to look at people?"
          subtitle="Search by your city and date, and send a free request."
          action={{ label: "Search photographers", href: "/search" }}
        />
      </div>
    </div>
  );
}
