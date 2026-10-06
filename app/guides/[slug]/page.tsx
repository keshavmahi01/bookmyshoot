import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import { GUIDES, guideBySlug, type GuideBlock } from "@/content/guides";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { priceGuide } from "@/lib/queries";
import { prettyDate, rupees } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Guide not found" };
  return { title: guide.title, description: guide.summary };
}

function Block({ block }: { block: GuideBlock }) {
  if (block.kind === "p") return <p className="mt-3 leading-relaxed text-ink-soft">{block.text}</p>;
  if (block.kind === "list")
    return (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-soft">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  if (block.kind === "numbers")
    return (
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-ink-soft">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  return (
    <p className="mt-4 rounded-lg border border-brand/30 bg-brand-soft px-4 py-3 text-sm text-brand-deep">
      {block.text}
    </p>
  );
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const prices = guide.showPriceTable ? (await priceGuide()).slice(0, 8) : [];
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={articleJsonLd(guide)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Guides", path: "/guides" },
          { name: guide.title, path: `/guides/${guide.slug}` },
        ])}
      />

      <nav className="mb-4 text-sm text-ink-faint">
        <Link href="/guides" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{guide.title}</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{guide.title}</h1>
      <p className="mt-2 text-ink-soft">{guide.summary}</p>
      <p className="mt-2 text-xs text-ink-faint">
        {guide.readMinutes} min read &middot; updated {prettyDate(guide.updated)}
      </p>

      {guide.sections.map((section) => (
        <section key={section.heading} className="mt-9">
          <h2 className="text-lg font-bold">{section.heading}</h2>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}

      {prices.length ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold">Starting rates listed on BookMyShoot right now</h2>
          <p className="mt-2 text-sm text-ink-soft">
            These are the starting rates on live profiles, updated as photographers change them. They
            are a starting point, not a final quote.
          </p>
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
                  <th className="px-4 py-2">Shoot type</th>
                  <th className="px-4 py-2">Lowest</th>
                  <th className="px-4 py-2">Typical</th>
                  <th className="px-4 py-2">Profiles</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((row) => (
                  <tr key={row.category.id} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-2 font-medium">
                      <Link
                        href={`/search?category=${row.category.slug}`}
                        className="hover:text-brand"
                      >
                        {row.category.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{rupees(row.low)}</td>
                    <td className="px-4 py-2">{rupees(row.median)}</td>
                    <td className="px-4 py-2 text-ink-faint">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {guide.sources?.length ? (
        <section className="mt-10">
          <h2 className="text-lg font-bold">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {guide.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="card mt-12 p-6 text-center">
        <p className="font-semibold">Looking for someone for your date?</p>
        <Link href="/search" className="btn btn-primary mt-4">Search photographers</Link>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold">More guides</h2>
        <div className="mt-3 grid gap-2">
          {others.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="card lift block p-4">
              <p className="font-semibold">{g.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{g.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
