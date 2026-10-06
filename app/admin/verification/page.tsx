import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui";
import { adminOverview } from "@/lib/queries";
import { setVerification } from "@/app/actions/admin";
import { VERIFICATION } from "@/lib/constants";
import { prettyDate } from "@/lib/format";

export const metadata: Metadata = { title: "Verification queue" };

export default async function VerificationPage() {
  const data = await adminOverview();
  const rows = [...data.profiles].sort((a, b) => {
    const order = { LISTED: 0, ID_VERIFIED: 1, WORK_VERIFIED: 2 } as Record<string, number>;
    return order[a.profile.verification] - order[b.profile.verification];
  });

  return (
    <div className="space-y-4">
      <div className="card bg-sand p-4 text-sm text-ink-soft">
        <p className="font-semibold text-ink">Before you give a badge</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>ID verified: government ID matched with the profile name and a selfie check.</li>
          <li>
            Work verified: the above, plus original camera files of three shoots, checked for camera
            data, plus two past clients spoken to on the phone.
          </li>
          <li>Never give a badge on the strength of a good looking Instagram feed.</li>
        </ul>
      </div>

      {rows.map(({ profile, city, owner }) => (
        <article key={profile.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">
                <Link href={`/p/${profile.slug}`} className="hover:text-brand">{profile.displayName}</Link>
              </p>
              <p className="text-sm text-ink-soft">
                {city.name} &middot; {owner.phone} &middot; {owner.email}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                Joined {prettyDate(profile.createdAt.slice(0, 10))}
                {profile.verifiedAt ? ` · verified ${prettyDate(profile.verifiedAt.slice(0, 10))}` : ""}
              </p>
            </div>
            <VerifiedBadge level={profile.verification} />
          </div>

          <p className="mt-3 text-sm text-ink-soft">
            {VERIFICATION[profile.verification as keyof typeof VERIFICATION].note || "Nothing checked yet."}
          </p>

          <form action={setVerification} className="mt-4 flex flex-wrap items-end gap-2 border-t border-line-soft pt-4">
            <input suppressHydrationWarning type="hidden" name="photographerId" value={profile.id} />
            <div>
              <label className="field-label" htmlFor={`lvl-${profile.id}`}>Set level</label>
              <select suppressHydrationWarning id={`lvl-${profile.id}`} name="level" className="field w-48" defaultValue={profile.verification}>
                <option value="LISTED">Listed, no badge</option>
                <option value="ID_VERIFIED">ID verified</option>
                <option value="WORK_VERIFIED">Work verified</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="field-label" htmlFor={`rsn-${profile.id}`}>Reason for the log</label>
              <input suppressHydrationWarning id={`rsn-${profile.id}`} name="reason" className="field" placeholder="Aadhaar matched, 2 clients called" />
            </div>
            <button suppressHydrationWarning className="btn btn-primary" type="submit">Save</button>
          </form>
        </article>
      ))}
    </div>
  );
}
