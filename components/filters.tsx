import Link from "next/link";
import { getCategories, getDistricts, getStates } from "@/lib/queries";
import { BUDGET_BANDS, LANGUAGES, RATE_TYPES } from "@/lib/constants";
import { RADIUS_OPTIONS } from "@/lib/geo";

type Params = Record<string, string | string[] | undefined>;

function one(params: Params, key: string) {
  const v = params[key];
  return Array.isArray(v) ? v[0] : (v ?? "");
}

function many(params: Params, key: string) {
  const v = params[key];
  if (!v) return [] as string[];
  return Array.isArray(v) ? v : [v];
}

function Radio({
  name,
  value,
  label,
  selected,
}: {
  name: string;
  value: string;
  label: string;
  selected: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input suppressHydrationWarning type="radio" name={name} value={value} defaultChecked={selected === value} />
      <span className="text-ink-soft">{label}</span>
    </label>
  );
}

export default async function Filters({ params }: { params: Params }) {
  const categories = await getCategories();
  const extras = many(params, "extras");
  const states = await getStates();
  const districts = await getDistricts(one(params, "state") || undefined);

  return (
    <form action="/search" method="get" className="card sticky top-20 p-4">
      <input suppressHydrationWarning type="hidden" name="city" value={one(params, "city")} />
      <input suppressHydrationWarning type="hidden" name="date" value={one(params, "date")} />
      <input suppressHydrationWarning type="hidden" name="sort" value={one(params, "sort")} />
      <input suppressHydrationWarning type="hidden" name="lat" value={one(params, "lat")} />
      <input suppressHydrationWarning type="hidden" name="lng" value={one(params, "lng")} />

      <div className="flex items-center justify-between">
        <p className="font-semibold">Filters</p>
        <Link
          href={`/search?city=${one(params, "city")}&date=${one(params, "date")}&lat=${one(params, "lat")}&lng=${one(params, "lng")}&radius=${one(params, "radius")}`}
          className="text-xs font-semibold text-brand hover:underline"
        >
          Clear all
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {one(params, "lat") ? (
          <div>
            <label className="field-label" htmlFor="f-radius">Distance from you</label>
            <select suppressHydrationWarning id="f-radius" name="radius" className="field" defaultValue={one(params, "radius") || "50"}>
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div>
              <label className="field-label" htmlFor="f-state">State</label>
              <select suppressHydrationWarning id="f-state" name="state" className="field" defaultValue={one(params, "state")}>
                <option value="">Any state</option>
                {states.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="f-district">District</label>
              <select suppressHydrationWarning id="f-district" name="district" className="field" defaultValue={one(params, "district")}>
                <option value="">Any district</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-ink-faint">
                Picking a city above overrides the state and district.
              </p>
            </div>
          </>
        )}

        <div>
          <label className="field-label" htmlFor="f-category">Shoot type</label>
          <select suppressHydrationWarning id="f-category" name="category" className="field" defaultValue={one(params, "category")}>
            <option value="">Any</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="f-budget">Starting budget</label>
          <select suppressHydrationWarning id="f-budget" name="budget" className="field" defaultValue={one(params, "budget")}>
            {BUDGET_BANDS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="f-rateType">Rate type</label>
          <select suppressHydrationWarning id="f-rateType" name="rateType" className="field" defaultValue={one(params, "rateType")}>
            <option value="">Any</option>
            {RATE_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="f-language">Language</label>
          <select suppressHydrationWarning id="f-language" name="language" className="field" defaultValue={one(params, "language")}>
            <option value="">Any</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="field-label">Team size</legend>
          <Radio name="team" value="" label="Any" selected={one(params, "team")} />
          <Radio name="team" value="solo" label="Single person" selected={one(params, "team")} />
          <Radio name="team" value="small" label="2 to 3 people" selected={one(params, "team")} />
          <Radio name="team" value="crew" label="Full crew, 4 plus" selected={one(params, "team")} />
        </fieldset>

        <fieldset>
          <legend className="field-label">Verification</legend>
          <Radio name="verification" value="" label="Any" selected={one(params, "verification")} />
          <Radio name="verification" value="ID_VERIFIED" label="ID verified and above" selected={one(params, "verification")} />
          <Radio name="verification" value="WORK_VERIFIED" label="Work verified only" selected={one(params, "verification")} />
        </fieldset>

        <fieldset>
          <legend className="field-label">Rating</legend>
          <Radio name="rating" value="" label="Any" selected={one(params, "rating")} />
          <Radio name="rating" value="4" label="4.0 and above" selected={one(params, "rating")} />
          <Radio name="rating" value="4.5" label="4.5 and above" selected={one(params, "rating")} />
        </fieldset>

        <fieldset>
          <legend className="field-label">Experience</legend>
          <Radio name="experience" value="" label="Any" selected={one(params, "experience")} />
          <Radio name="experience" value="1-3" label="1 to 3 years" selected={one(params, "experience")} />
          <Radio name="experience" value="3-7" label="3 to 7 years" selected={one(params, "experience")} />
          <Radio name="experience" value="7+" label="7 years and above" selected={one(params, "experience")} />
        </fieldset>

        <fieldset>
          <legend className="field-label">Photographer</legend>
          <Radio name="gender" value="" label="Any" selected={one(params, "gender")} />
          <Radio name="gender" value="FEMALE" label="Woman photographer" selected={one(params, "gender")} />
          <Radio name="gender" value="MALE" label="Man photographer" selected={one(params, "gender")} />
          <Radio name="gender" value="TEAM" label="Studio or team" selected={one(params, "gender")} />
        </fieldset>

        <fieldset>
          <legend className="field-label">Must have</legend>
          {[
            { value: "drone", label: "Drone" },
            { value: "backup", label: "Backup camera" },
            { value: "second", label: "Second shooter" },
            { value: "album", label: "Album included" },
            { value: "raw", label: "Raw files given" },
          ].map((x) => (
            <label key={x.value} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
              <input suppressHydrationWarning type="checkbox" name="extras" value={x.value} defaultChecked={extras.includes(x.value)} />
              <span className="text-ink-soft">{x.label}</span>
            </label>
          ))}
        </fieldset>
      </div>

      <button suppressHydrationWarning type="submit" className="btn btn-primary mt-5 w-full">Apply filters</button>
    </form>
  );
}
