import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/search-bar";
import Filters from "@/components/filters";
import PhotographerCardView from "@/components/photographer-card";
import { EmptyState } from "@/components/ui";
import { getCategoryBySlug, getCityBySlug, searchPhotographers } from "@/lib/queries";
import { SORT_OPTIONS } from "@/lib/constants";
import { prettyDate } from "@/lib/format";
import { RememberCity } from "@/components/last-city";

export const metadata: Metadata = { title: "Search photographers" };

type Params = Record<string, string | string[] | undefined>;

const one = (p: Params, k: string) => {
  const v = p[k];
  return Array.isArray(v) ? v[0] : v;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const city = one(params, "city");
  const date = one(params, "date");
  const category = one(params, "category");
  const sort = one(params, "sort") ?? "best";

  const lat = Number(one(params, "lat"));
  const lng = Number(one(params, "lng"));
  const nearMe = Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
  const radiusKm = Number(one(params, "radius") ?? 50) || 50;

  const cards = await searchPhotographers({
    city,
    state: one(params, "state"),
    district: one(params, "district"),
    lat: nearMe ? lat : undefined,
    lng: nearMe ? lng : undefined,
    radiusKm,
    date,
    category,
    budget: one(params, "budget"),
    rateType: one(params, "rateType"),
    team: one(params, "team"),
    language: one(params, "language"),
    gender: one(params, "gender"),
    verification: one(params, "verification"),
    rating: one(params, "rating"),
    experience: one(params, "experience"),
    extras: Array.isArray(params.extras) ? params.extras : params.extras ? [params.extras] : [],
    sort,
  });

  const cityRow = city ? await getCityBySlug(city) : null;
  const catRow = category ? await getCategoryBySlug(category) : null;
  const freeCount = date ? cards.filter((c) => c.availableOnDate).length : null;

  const place = nearMe
    ? `within ${radiusKm} km of you`
    : cityRow
      ? `in ${cityRow.name}`
      : one(params, "district")
        ? `in ${one(params, "district")} district`
        : one(params, "state")
          ? `in ${one(params, "state")}`
          : "across India";

  const heading = [
    catRow ? catRow.name.replace(" photography", " photographers") : "Photographers",
    place,
  ].join(" ");

  const sortQuery = (value: string) => {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (k === "sort" || v === undefined) return;
      if (Array.isArray(v)) v.forEach((item) => next.append(k, item));
      else next.set(k, v);
    });
    next.set("sort", value);
    return `/search?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28">
      {cityRow ? <RememberCity slug={cityRow.slug} name={cityRow.name} /> : null}
      <SearchBar defaults={{ city, date, category }} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <Filters params={params} />
        </aside>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{heading}</h1>
              <p className="mt-1 text-sm text-ink-soft">
                {cards.length} {cards.length === 1 ? "profile" : "profiles"}
                {date ? ` · ${freeCount} free on ${prettyDate(date)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-ink-faint">Sort</span>
              <div className="flex flex-wrap gap-1">
                {(nearMe ? [{ value: "distance", label: "Nearest first" }, ...SORT_OPTIONS] : SORT_OPTIONS).map((o) => (
                  <Link
                    key={o.value}
                    href={sortQuery(o.value)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      sort === o.value
                        ? "border-brand bg-brand-soft font-semibold text-brand-deep"
                        : "border-line bg-surface text-ink-soft hover:border-ink-faint"
                    }`}
                  >
                    {o.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <details className="card mt-4 p-4 lg:hidden">
            <summary className="cursor-pointer font-semibold">Filters</summary>
            <div className="mt-4">
              <Filters params={params} />
            </div>
          </details>

          {nearMe ? (
            <p className="mt-3 rounded-lg border border-info/25 bg-info-soft px-3 py-2 text-sm text-info">
              Showing people based within {radiusKm} km of where you are. Change the distance in the
              filters, or pick a city to search somewhere else.
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 animate-rise">
            {cards.length === 0 ? (
              <EmptyState
                title="Nobody matches all of that"
                body="Try removing a filter, widening the budget, or searching a nearby city. Many photographers travel."
                action={{ label: "Clear filters", href: "/search" }}
              />
            ) : (
              cards.map((card) => <PhotographerCardView key={card.profile.id} card={card} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
