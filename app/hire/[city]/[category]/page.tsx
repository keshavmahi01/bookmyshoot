import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/search-bar";
import PhotographerCardView from "@/components/photographer-card";
import { EmptyState } from "@/components/ui";
import { getCategories, getCategoryBySlug, getCities, getCityBySlug, searchPhotographers } from "@/lib/queries";
import { placeLine, rupees } from "@/lib/format";
import JsonLd from "@/components/json-ld";
import { breadcrumbJsonLd, faqJsonLd, listJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ city: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = await params;
  const cityRow = await getCityBySlug(city);
  const catRow = await getCategoryBySlug(category);
  if (!cityRow || !catRow) return { title: "Not found" };
  return {
    title: `${catRow.singular}s in ${cityRow.name}`,
    description: `Compare ${catRow.singular.toLowerCase()}s in ${cityRow.name} by rate, availability and reviews. Send a free booking request on BookMyShoot.`,
  };
}

export default async function HirePage({ params }: Props) {
  const { city, category } = await params;
  const cityRow = await getCityBySlug(city);
  const catRow = await getCategoryBySlug(category);
  if (!cityRow || !catRow) notFound();

  const cards = await searchPhotographers({ city, category, sort: "best" });
  const prices = cards.map((c) => c.startingRate?.amount ?? 0).filter(Boolean).sort((a, b) => a - b);
  const low = prices[0];
  const high = prices.at(-1);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : undefined;

  const allCategories = await getCategories();
  const allCities = await getCities();
  const otherCategories = allCategories.filter((c) => c.slug !== category).slice(0, 6);
  const otherCities = allCities.filter((c) => c.popular && c.slug !== city).slice(0, 8);
  const sameDistrict = allCities.filter((c) => c.district === cityRow.district && c.slug !== city);

  const title = `${catRow.singular}s in ${cityRow.name}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={listJsonLd(cityRow, catRow, cards)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Cities", path: "/cities" },
          { name: cityRow.name, path: `/search?city=${cityRow.slug}` },
          { name: `${catRow.singular}s`, path: `/hire/${cityRow.slug}/${catRow.slug}` },
        ])}
      />
      <JsonLd
        data={faqJsonLd([
          {
            q: `How much does a ${catRow.singular.toLowerCase()} cost in ${cityRow.name}?`,
            a: prices.length
              ? `On BookMyShoot the starting rates in ${cityRow.name} run from ${rupees(low)} to ${rupees(high)}, with most around ${rupees(median)}. The final price depends on the number of days, travel and the size of the crew.`
              : `We are still adding profiles in ${cityRow.name}. Search a nearby city to see current rates.`,
          },
          {
            q: `How do I know a ${catRow.singular.toLowerCase()} is free on my date?`,
            a: "Search with your date and the list shows only the people who are free that day. Every photographer keeps his own calendar on this site.",
          },
          {
            q: "Does BookMyShoot take payment for the shoot?",
            a: "No. You pay the photographer directly. We make the introduction, block the date and keep the record of the conversation.",
          },
        ])}
      />

      <nav className="mb-4 text-sm text-ink-faint">
        <Link href="/cities" className="hover:text-ink">Cities</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{cityRow.name}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-ink-soft">
        {cards.length} {cards.length === 1 ? "profile" : "profiles"} covering {placeLine(cityRow)}.{" "}
        {catRow.description}
      </p>

      {prices.length ? (
        <p className="mt-2 text-sm text-ink-soft">
          Starting rates run from <strong className="text-ink">{rupees(low)}</strong> to{" "}
          <strong className="text-ink">{rupees(high)}</strong>, with most around{" "}
          <strong className="text-ink">{rupees(median)}</strong>.
        </p>
      ) : null}

      <div className="mt-6">
        <SearchBar defaults={{ city, category }} />
      </div>

      <div className="mt-8 grid gap-4">
        {cards.length === 0 ? (
          <EmptyState
            title={`No ${catRow.singular.toLowerCase()} listed in ${cityRow.name} yet`}
            body="We are adding profiles city by city. Try a nearby city, or ask a photographer you know to list here."
            action={{ label: "Search all cities", href: `/search?category=${category}` }}
          />
        ) : (
          cards.map((card) => <PhotographerCardView key={card.profile.id} card={card} />)
        )}
      </div>

      <section className="prose-page mt-12 max-w-3xl">
        <h2>Booking a {catRow.singular.toLowerCase()} in {cityRow.name}</h2>
        <p>
          Dates are the first thing to settle. In {cityRow.name} the wedding season fills up months
          ahead, so a profile that looks free today may be gone next week. Search with your date in the
          box above and the list will show who is actually free that day.
        </p>
        <p>
          Next, agree on the rate type. Some people here charge per hour, which suits a birthday or a
          product shoot. A full function day is usually priced per day. For a destination wedding or a
          long shoot, ask for the weekly block rate, as it works out cheaper than paying by the day.
        </p>
        <h2>What to check before you confirm</h2>
        <ul>
          <li>Does the quote include a backup camera and a second shooter?</li>
          <li>How many edited photos come per shoot day, and in how many days?</li>
          <li>Are travel, stay and food charged extra, and at what rate?</li>
          <li>Is the printed album included, or billed separately?</li>
          <li>What happens if the date is cancelled by either side?</li>
        </ul>
        <p>
          Put all of this in writing in the chat before you pay any advance. BookMyShoot does not handle
          the money, so the agreement is between you and the photographer.
        </p>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="font-bold">Other shoot types in {cityRow.name}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherCategories.map((c) => (
            <Link
              key={c.id}
              href={`/hire/${city}/${c.slug}`}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm hover:border-ink-faint"
            >
              {c.singular}s in {cityRow.name}
            </Link>
          ))}
        </div>

        {sameDistrict.length ? (
          <>
            <h2 className="mt-8 font-bold">Nearby towns in {cityRow.district} district</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {sameDistrict.map((c) => (
                <Link
                  key={c.id}
                  href={`/hire/${c.slug}/${category}`}
                  className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm hover:border-ink-faint"
                >
                  {catRow.singular}s in {c.name}
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <h2 className="mt-8 font-bold">{catRow.singular}s in other cities</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {otherCities.map((c) => (
            <Link
              key={c.id}
              href={`/hire/${c.slug}/${category}`}
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm hover:border-ink-faint"
            >
              {catRow.singular}s in {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
