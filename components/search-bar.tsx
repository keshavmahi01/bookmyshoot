import { getCategories, getCities } from "@/lib/queries";
import { toISODate } from "@/lib/format";
import NearMeButton from "./near-me";

export default async function SearchBar({
  defaults = {},
  compact = false,
  glow = false,
}: {
  defaults?: { city?: string; date?: string; category?: string };
  compact?: boolean;
  glow?: boolean;
}) {
  const cities = await getCities();
  const categories = await getCategories();
  const today = toISODate(new Date());

  // Cities grouped by state, then district, so the list reads the way people think.
  const byState = new Map<string, Map<string, typeof cities>>();
  for (const city of cities) {
    const districts = byState.get(city.state) ?? new Map();
    const list = districts.get(city.district) ?? [];
    list.push(city);
    districts.set(city.district, list);
    byState.set(city.state, districts);
  }

  return (
    <div className={`card p-3 ${glow ? "search-panel" : ""}`}>
      <form
        action="/search"
        method="get"
        className={`grid gap-3 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-[1.2fr_1fr_1.2fr_auto]"}`}
      >
        <div>
          <label className="field-label" htmlFor="city">City</label>
          <select suppressHydrationWarning id="city" name="city" className="field" defaultValue={defaults.city ?? ""}>
            <option value="">Any city in India</option>
            {[...byState.entries()]
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([state, districts]) => (
                <optgroup key={state} label={state}>
                  {[...districts.entries()]
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .flatMap(([district, list]) =>
                      list.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                          {c.name === district ? "" : ` (${district} district)`}
                        </option>
                      )),
                    )}
                </optgroup>
              ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="date">Event date</label>
          <input suppressHydrationWarning
            id="date"
            name="date"
            type="date"
            min={today}
            className="field"
            defaultValue={defaults.date ?? ""}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="category">Shoot type</label>
          <select suppressHydrationWarning id="category" name="category" className="field" defaultValue={defaults.category ?? ""}>
            <option value="">Any shoot type</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button suppressHydrationWarning type="submit" className="btn btn-primary w-full lg:w-auto">
            Search
          </button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft pt-3">
        <span className="text-xs text-ink-faint">Do not know the city name?</span>
        <div className="w-40">
          <NearMeButton radiusKm={50} />
        </div>
        <span className="text-xs text-ink-faint">
          We use your location only to sort this search. Nothing is saved.
        </span>
      </div>
    </div>
  );
}
