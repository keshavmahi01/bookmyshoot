import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getPhotographerByUserId, profileCompleteness } from "@/lib/queries";
import { saveProfile } from "@/app/actions/photographer";
import { LANGUAGES, VERIFICATION, WEEKDAYS } from "@/lib/constants";
import { SOCIAL_FIELDS } from "@/lib/social";

export const metadata: Metadata = { title: "Profile" };

function Check({ name, label, on }: { name: string; label: string; on: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input suppressHydrationWarning type="checkbox" name={name} defaultChecked={on} />
      <span className="text-ink-soft">{label}</span>
    </label>
  );
}

export default async function ProfileEditPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");
  const p = detail.profile;
  const complete = profileCompleteness(detail);
  const checkList = [
    "Profile photo uploaded",
    "At least 10 photos uploaded",
    "At least one rate set",
    "Gear listed",
    "A real description, not two lines",
    "Shoot types picked",
    "ID verification done",
    "Add on charges listed",
    "More than one language",
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <form action={saveProfile} className="space-y-6">
        <section className="card p-5">
          <h2 className="font-bold">Basic</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="displayName">Name or studio name</label>
              <input suppressHydrationWarning id="displayName" name="displayName" className="field" defaultValue={p.displayName} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="tagline">One line about you</label>
              <input suppressHydrationWarning id="tagline" name="tagline" className="field" defaultValue={p.tagline} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="bio">About your work</label>
              <textarea suppressHydrationWarning id="bio" name="bio" rows={5} className="field" defaultValue={p.bio} />
            </div>
            <div>
              <label className="field-label" htmlFor="yearsExperience">Years of experience</label>
              <input suppressHydrationWarning id="yearsExperience" name="yearsExperience" inputMode="numeric" className="field" defaultValue={p.yearsExperience} />
            </div>
            <div>
              <label className="field-label" htmlFor="teamSize">Team size</label>
              <input suppressHydrationWarning id="teamSize" name="teamSize" inputMode="numeric" className="field" defaultValue={p.teamSize} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="eventsCovered">
                Events you have covered so far, in total
              </label>
              <input suppressHydrationWarning
                id="eventsCovered"
                name="eventsCovered"
                inputMode="numeric"
                className="field"
                defaultValue={p.eventsCovered}
              />
              <p className="mt-1 text-xs text-ink-faint">
                Your own count, including work done before BookMyShoot. It shows on your profile as
                your number, separate from the jobs booked through this site.
              </p>
            </div>
            <div>
              <label className="field-label" htmlFor="gender">Profile type</label>
              <select suppressHydrationWarning id="gender" name="gender" className="field" defaultValue={p.gender}>
                <option value="MALE">Man photographer</option>
                <option value="FEMALE">Woman photographer</option>
                <option value="TEAM">Studio or team</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="languages">Languages, comma separated</label>
              <input suppressHydrationWarning
                id="languages"
                name="languages"
                className="field"
                defaultValue={p.languages.join(",")}
                list="language-options"
              />
              <datalist id="language-options">
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Your social accounts</h2>
          <p className="text-sm text-ink-soft">
            These show on your profile as buttons. Customers almost always check Instagram before
            they call, so this is worth filling in. Leave any of them empty if you do not use it.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SOCIAL_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="field-label" htmlFor={f.key}>{f.label}</label>
                <input
                  id={f.key}
                  name={f.key}
                  className="field"
                  placeholder={f.hint}
                  defaultValue={p[f.key]}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Travel</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="travelKm">Free travel distance in km</label>
              <input suppressHydrationWarning id="travelKm" name="travelKm" inputMode="numeric" className="field" defaultValue={p.travelKm} />
            </div>
            <div className="flex items-end pb-2">
              <Check name="travelsAllIndia" label="I travel anywhere in India" on={p.travelsAllIndia} />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Gear and crew</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="field-label" htmlFor="gear">Cameras, lenses, lights, drone</label>
              <textarea suppressHydrationWarning id="gear" name="gear" rows={3} className="field" defaultValue={p.gear} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Check name="backupGear" label="Backup camera on every job" on={p.backupGear} />
              <Check name="droneAvailable" label="Drone available" on={p.droneAvailable} />
              <Check name="secondShooter" label="Second shooter available" on={p.secondShooter} />
              <Check name="ownEditing" label="Editing done in house" on={p.ownEditing} />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Delivery promise</h2>
          <p className="text-sm text-ink-soft">Customers compare on this. Promise what you can keep.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="deliveryDays">Delivery time in days</label>
              <input suppressHydrationWarning id="deliveryDays" name="deliveryDays" inputMode="numeric" className="field" defaultValue={p.deliveryDays} />
            </div>
            <div>
              <label className="field-label" htmlFor="photosPerDay">Edited photos per shoot day</label>
              <input suppressHydrationWarning id="photosPerDay" name="photosPerDay" inputMode="numeric" className="field" defaultValue={p.photosPerDay} />
            </div>
            <Check name="rawFiles" label="Raw files given on request" on={p.rawFiles} />
            <Check name="albumIncluded" label="Printed album included in packages" on={p.albumIncluded} />
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Weekly off</h2>
          <p className="text-sm text-ink-soft">These days show as unavailable on your calendar.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {WEEKDAYS.map((day, index) => (
              <label key={day} className="flex items-center gap-2 text-sm">
                <input suppressHydrationWarning
                  type="checkbox"
                  name="weeklyOff"
                  value={String(index)}
                  defaultChecked={p.weeklyOff.includes(index)}
                />
                <span className="text-ink-soft">{day}</span>
              </label>
            ))}
          </div>
        </section>

        <button suppressHydrationWarning className="btn btn-primary" type="submit">Save profile</button>
      </form>

      <aside className="space-y-4">
        <div className="card p-5">
          <p className="font-semibold">Profile strength</p>
          <p className="mt-1 text-3xl font-bold">{complete.percent}%</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {checkList.map((label, i) => (
              <li key={label} className="flex items-start gap-2">
                <span className={complete.checks[i] ? "text-green" : "text-ink-faint"}>
                  {complete.checks[i] ? "Done" : "To do"}
                </span>
                <span className="text-ink-soft">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <p className="font-semibold">Verification</p>
          <p className="mt-1 text-sm text-ink-soft">
            Current level:{" "}
            <strong className="text-ink">
              {VERIFICATION[p.verification as keyof typeof VERIFICATION].label}
            </strong>
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {VERIFICATION[p.verification as keyof typeof VERIFICATION].note}
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            Upload documents from the verification page to move up a level. Work verified needs
            original camera files of three shoots and two client references.
          </p>
        </div>
      </aside>
    </div>
  );
}
