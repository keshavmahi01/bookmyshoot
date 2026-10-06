import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Photo } from "@/components/photo";
import SocialLinks from "@/components/social-links";
import { Notice, Pill, VerifiedBadge } from "@/components/ui";
import { adminOverview, getPhotographerBySlug } from "@/lib/queries";
import { decideProfile } from "@/app/actions/admin";
import { placeLine, prettyDate, rupees } from "@/lib/format";

export const metadata: Metadata = { title: "Approvals" };

export default async function ApprovalsPage() {
  const data = await adminOverview();
  const pending = data.profiles.filter((p) => p.profile.status === "PENDING");
  const rejected = data.profiles.filter((p) => p.profile.status === "REJECTED");
  const pendingDetails = await Promise.all(
    pending.map(({ profile }) => getPhotographerBySlug(profile.slug)),
  );

  return (
    <div className="space-y-6">
      <Notice tone="warn">
        A new profile is not visible anywhere on the site until it is approved here. Approval only
        means the profile looks real and complete. The verified tick is a separate check, on the
        verification queue tab.
      </Notice>

      <section>
        <h2 className="mb-3 font-bold">
          Waiting for approval {pending.length ? `(${pending.length})` : ""}
        </h2>

        {pending.length === 0 ? (
          <div className="card p-6 text-sm text-ink-soft">
            Nothing waiting. New signups will land here.
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map(({ profile, city, owner }, index) => {
              const detail = pendingDetails[index];
              return (
                <article key={profile.id} className="card overflow-hidden">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row">
                    <Photo
                      imagePath={profile.coverPath}
                      seed={`${profile.slug}-cover`}
                      label={profile.coverPath ? undefined : profile.displayName}
                      alt=""
                      w={400}
                      h={300}
                      className="h-28 w-full rounded-lg object-cover sm:w-44"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <Avatar src={profile.avatarPath} name={profile.displayName} size={40} />
                        <div className="min-w-0">
                          <p className="font-bold">{profile.displayName}</p>
                          <p className="truncate text-sm text-ink-soft">{placeLine(city)}</p>
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-ink-soft">{profile.tagline}</p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {detail?.categories.map((c) => <Pill key={c.id}>{c.name}</Pill>)}
                      </div>

                      <div className="mt-2">
                        <SocialLinks
                          size="small"
                          links={[
                            { kind: "instagram", url: profile.instagram },
                            { kind: "facebook", url: profile.facebook },
                            { kind: "youtube", url: profile.youtube },
                            { kind: "website", url: profile.website },
                          ]}
                        />
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                        <div>
                          <dt className="text-xs uppercase text-ink-faint">Signed up</dt>
                          <dd>{prettyDate(profile.createdAt.slice(0, 10))}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-ink-faint">Photos</dt>
                          <dd>{detail?.portfolio.filter((i) => i.kind === "PHOTO").length ?? 0}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-ink-faint">Rates</dt>
                          <dd>
                            {detail?.startingRate ? `from ${rupees(detail.startingRate.amount)}` : "none set"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-ink-faint">Contact</dt>
                          <dd className="truncate">{owner.phone}</dd>
                        </div>
                      </dl>

                      <p className="mt-2 text-xs text-ink-faint">
                        {owner.email} &middot;{" "}
                        <Link href={`/p/${profile.slug}`} className="text-brand hover:underline">
                          open the profile as it will look
                        </Link>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-line-soft bg-sand p-4">
                    <form action={decideProfile} className="flex flex-wrap items-end gap-2">
                      <input suppressHydrationWarning type="hidden" name="photographerId" value={profile.id} />
                      <div className="min-w-56 flex-1">
                        <label className="field-label" htmlFor={`note-${profile.id}`}>
                          Note, required when rejecting
                        </label>
                        <input suppressHydrationWarning
                          id={`note-${profile.id}`}
                          name="note"
                          className="field"
                          placeholder="Photos look copied, asked for originals"
                        />
                      </div>
                      <button suppressHydrationWarning
                        className="btn btn-primary"
                        type="submit"
                        name="decision"
                        value="APPROVED"
                      >
                        Approve and make live
                      </button>
                      <button suppressHydrationWarning
                        className="btn btn-ghost"
                        type="submit"
                        name="decision"
                        value="REJECTED"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {rejected.length ? (
        <section>
          <h2 className="mb-3 font-bold">Rejected</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase text-ink-faint">
                  <th className="px-4 py-2">Profile</th>
                  <th className="px-4 py-2">City</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rejected.map(({ profile, city }) => (
                  <tr key={profile.id} className="border-b border-line-soft last:border-0">
                    <td className="px-4 py-3 font-medium">{profile.displayName}</td>
                    <td className="px-4 py-3 text-ink-soft">{city.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{profile.reviewNote}</td>
                    <td className="px-4 py-3">
                      <form action={decideProfile}>
                        <input suppressHydrationWarning type="hidden" name="photographerId" value={profile.id} />
                        <input suppressHydrationWarning type="hidden" name="note" value="Reopened for another look" />
                        <button suppressHydrationWarning
                          className="btn btn-ghost px-3 py-1 text-xs"
                          type="submit"
                          name="decision"
                          value="PENDING"
                        >
                          Look again
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-bold">Verified tick</h2>
        <p className="text-sm text-ink-soft">
          Approval and the tick are two different things. Approval puts a profile on the site. The
          tick says what we actually checked about that person. Give it on the{" "}
          <Link href="/admin/verification" className="font-semibold text-brand hover:underline">
            verification queue
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <VerifiedBadge level="LISTED" />
          <VerifiedBadge level="ID_VERIFIED" />
          <VerifiedBadge level="WORK_VERIFIED" />
        </div>
      </section>
    </div>
  );
}
