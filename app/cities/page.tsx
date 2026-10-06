import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getDistrictTree, searchPhotographers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "States, districts and cities",
  description:
    "Photographers, videographers and drone operators listed state by state, district by district, across India.",
};

export default async function CitiesPage() {
  const tree = await getDistrictTree();
  const popularCategories = (await getCategories()).filter((c) => c.popular).slice(0, 3);
  const counts = new Map<string, number>();
  for (const card of await searchPhotographers({})) {
    counts.set(card.city.slug, (counts.get(card.city.slug) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Where we cover</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        State, then district, then city. We fill one district at a time, because a search is only
        useful when it actually finds someone free on your date.
      </p>

      <div className="mt-10 space-y-10">
        {tree.map((state) => (
          <section key={state.state} className="animate-rise">
            <h2 className="text-lg font-bold">{state.state}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {state.districts.map((district) => {
                const total = district.cities.reduce((sum, c) => sum + (counts.get(c.slug) ?? 0), 0);
                return (
                  <div key={district.district} className="card p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={`/search?district=${encodeURIComponent(district.district)}`}
                        className="font-semibold hover:text-brand"
                      >
                        {district.district} district
                      </Link>
                      <span className="text-xs text-ink-faint">
                        {total} {total === 1 ? "profile" : "profiles"}
                      </span>
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {district.cities.map((city) => (
                        <li key={city.id}>
                          <Link
                            href={`/search?city=${city.slug}`}
                            className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-soft hover:border-ink-faint hover:text-ink"
                          >
                            {city.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-3 space-y-1 text-sm">
                      {popularCategories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            href={`/hire/${district.cities[0].slug}/${cat.slug}`}
                            className="text-brand hover:underline"
                          >
                            {cat.singular}s in {district.cities[0].name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
