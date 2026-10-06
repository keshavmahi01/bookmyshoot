import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Gallery from "@/components/gallery";
import { Avatar, Photo } from "@/components/photo";
import SocialLinks from "@/components/social-links";
import JsonLd from "@/components/json-ld";
import { breadcrumbJsonLd, photographerJsonLd } from "@/lib/seo";
import Availability from "@/components/availability";
import EnquiryForm from "@/components/enquiry-form";
import { Pill, RatingLine, Stars, VerifiedBadge } from "@/components/ui";
import { getPhotographerBySlug } from "@/lib/queries";
import { currentUser } from "@/lib/auth";
import { rateLabel, rateUnit, VERIFICATION } from "@/lib/constants";
import { placeLine, prettyDate, responseText, rupees, toISODate } from "@/lib/format";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPhotographerBySlug(slug);
  if (!detail) return { title: "Profile not found" };
  return {
    title: `${detail.profile.displayName}, ${detail.city.name}`,
    description: `${detail.profile.tagline}. Rates, calendar and reviews on BookMyShoot.`,
  };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { date } = await searchParams;
  const detail = await getPhotographerBySlug(slug);
  if (!detail) notFound();

  // A profile that is not approved yet is visible only to its owner and to admins.
  const viewer = await currentUser();
  const isOwner = viewer?.id === detail.profile.userId;
  const isAdmin = viewer?.role === "ADMIN";
  if (detail.profile.status !== "APPROVED" && !isOwner && !isAdmin) notFound();
  if (!detail.profile.active && !isOwner && !isAdmin) notFound();

  const { profile, city, categories, rates, addOns, portfolio, reviews, rating, blocked } = detail;
  const today = toISODate(new Date());
  const info = VERIFICATION[profile.verification as keyof typeof VERIFICATION];
  const scoreRows = [
    { label: "Photo and video quality", value: rating.quality },
    { label: "On time and behaviour", value: rating.punctuality },
    { label: "Delivery on promise", value: rating.delivery },
    { label: "Value for money", value: rating.value },
    { label: "Communication", value: rating.communication },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={photographerJsonLd(detail)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Photographers", path: "/search" },
          { name: city.name, path: `/search?city=${city.slug}` },
          { name: profile.displayName, path: `/p/${profile.slug}` },
        ])}
      />

      <nav className="mb-4 text-sm text-ink-faint">
        <Link href="/search" className="hover:text-ink">Photographers</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/search?city=${city.slug}`} className="hover:text-ink">{city.name}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{profile.displayName}</span>
      </nav>

      {profile.status !== "APPROVED" ? (
        <div className="mb-4 rounded-lg border border-gold/30 bg-brand-soft px-4 py-3 text-sm text-brand-deep">
          <strong>
            {profile.status === "PENDING"
              ? "Pending for verification, please wait about 1 hour."
              : "This profile was not approved."}
          </strong>{" "}
          {profile.status === "PENDING"
            ? "Only you and our team can see this page. It goes live once our team approves it, normally within about an hour."
            : profile.reviewNote || "Our team did not approve this profile."}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {/* Header */}
          <header className="card overflow-hidden animate-rise">
            <Photo
              imagePath={profile.coverPath}
              seed={`${profile.slug}-cover`}
              label={profile.displayName}
              alt={`Work by ${profile.displayName}`}
              w={1200}
              h={400}
              priority
              className="h-36 w-full object-cover sm:h-48"
            />
            <div className="px-5 pb-5">
              <div className="-mt-9 flex items-end justify-between gap-3">
                <Avatar src={profile.avatarPath} name={profile.displayName} size={76} />
                <div className="pb-1">
                  <VerifiedBadge level={profile.verification} />
                </div>
              </div>

              <div className="mt-3">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{profile.displayName}</h1>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {profile.tagline}
                </p>
                <p className="mt-1 text-sm text-ink-faint">
                  {placeLine(city)}
                  {profile.travelsAllIndia
                    ? " \u00b7 travels anywhere in India"
                    : ` \u00b7 travels up to ${profile.travelKm} km`}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-soft pt-3 text-sm">
                <RatingLine average={rating.average} count={rating.count} />
                <span className="text-ink-soft">
                  <strong className="text-ink">{profile.eventsCovered}</strong> events covered
                </span>
                <span className="text-ink-soft">
                  <strong className="text-ink">{profile.jobsCompleted}</strong> through BookMyShoot
                </span>
                <span className="text-ink-soft">
                  <strong className="text-ink">{profile.repeatClients}</strong> repeat clients
                </span>
                <span className="text-ink-soft">
                  <strong className="text-ink">{profile.cancellations}</strong> cancellations in 12 months
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <Pill key={c.id}>{c.name}</Pill>
                ))}
              </div>

              <div className="mt-3">
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

              {info && profile.verification !== "LISTED" ? (
                <p className="mt-3 rounded-lg bg-sand px-3 py-2 text-xs text-ink-soft">
                  <strong>What we checked:</strong> {info.note} The events covered count is the
                  photographer&apos;s own number. We do not guarantee the work itself.
                </p>
              ) : null}
            </div>
          </header>

          {/* Portfolio */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">Work</h2>
            <p className="mb-3 text-sm text-ink-soft">
              {portfolio.filter((p) => p.kind === "PHOTO").length} photos uploaded by the photographer.
            </p>
            <Gallery items={portfolio} name={profile.displayName} />
            {portfolio.some((p) => p.kind === "VIDEO") ? (
              <p className="mt-3 text-sm">
                Film:{" "}
                <a
                  className="font-semibold text-brand hover:underline"
                  href={portfolio.find((p) => p.kind === "VIDEO")!.videoUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  watch the highlight film
                </a>
              </p>
            ) : null}
          </section>

          {/* About */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">About</h2>
            <p className="mt-2 leading-relaxed text-ink-soft">{profile.bio}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Experience", value: `${profile.yearsExperience} years` },
                { label: "Team size", value: `${profile.teamSize} ${profile.teamSize === 1 ? "person" : "people"}` },
                { label: "Languages", value: profile.languages.join(", ") },
                { label: "Editing", value: profile.ownEditing ? "In house" : "Outsourced" },
              ].map((row) => (
                <div key={row.label} className="card p-3">
                  <dt className="text-xs uppercase tracking-wide text-ink-faint">{row.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Rates */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">Rates</h2>
            <p className="mb-3 text-sm text-ink-soft">
              Set by the photographer. Final price is agreed in the chat, because travel, stay and extra
              days change it.
            </p>
            <div className="grid gap-3">
              {rates.map((rate) => (
                <div key={rate.id} className="card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="font-semibold">{rate.title}</p>
                      <p className="text-xs uppercase tracking-wide text-ink-faint">{rateLabel(rate.type)}</p>
                    </div>
                    <p className="text-lg font-bold">
                      {rupees(rate.amount)}
                      <span className="text-sm font-normal text-ink-faint"> / {rateUnit(rate.type)}</span>
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft">{rate.details}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    Minimum {rate.minUnits} {rateUnit(rate.type)}
                    {rate.minUnits > 1 ? "s" : ""}
                    {rate.extraUnitRate
                      ? ` · extra ${rateUnit(rate.type)} at ${rupees(rate.extraUnitRate)}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>

            {addOns.length ? (
              <>
                <h3 className="mt-6 font-semibold">Add on charges</h3>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {addOns.map((a) => (
                      <tr key={a.id} className="border-b border-line-soft">
                        <td className="py-2 pr-3">{a.label}</td>
                        <td className="py-2 pr-3 text-ink-faint">{a.note}</td>
                        <td className="py-2 text-right font-semibold">{rupees(a.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : null}
          </section>

          {/* Gear and delivery */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="card p-4">
              <h2 className="font-bold">Gear and crew</h2>
              <p className="mt-2 text-sm text-ink-soft">{profile.gear}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {[
                  ["Backup camera on every job", profile.backupGear],
                  ["Drone available", profile.droneAvailable],
                  ["Second shooter available", profile.secondShooter],
                ].map(([label, yes]) => (
                  <li key={label as string} className="flex items-center gap-2">
                    <span className={yes ? "text-green" : "text-ink-faint"}>{yes ? "Yes" : "No"}</span>
                    <span className="text-ink-soft">{label as string}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <h2 className="font-bold">Delivery promise</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
                <li>Edited photos in about <strong className="text-ink">{profile.deliveryDays} days</strong></li>
                <li>Around <strong className="text-ink">{profile.photosPerDay}</strong> edited photos per shoot day</li>
                <li>Raw files: {profile.rawFiles ? "given on request" : "not given"}</li>
                <li>Printed album: {profile.albumIncluded ? "included in packages" : "charged separately"}</li>
              </ul>
            </div>
          </section>

          {/* Calendar */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">Availability</h2>
            <p className="mb-3 text-sm text-ink-soft">
              Updated by the photographer. Last opened{" "}
              {prettyDate(profile.lastActiveAt.slice(0, 10))}.
            </p>
            <div className="card p-4">
              <Availability blocked={blocked} weeklyOff={profile.weeklyOff} highlight={date} />
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-8">
            <h2 className="text-lg font-bold">Reviews</h2>
            <p className="mb-3 text-sm text-ink-soft">
              Only customers whose booking was marked complete on BookMyShoot can write a review.
            </p>

            {rating.count === 0 ? (
              <div className="card p-6 text-sm text-ink-soft">
                No reviews yet. This profile has not completed a booking through BookMyShoot so far.
              </div>
            ) : (
              <>
                <div className="card p-5">
                  <div className="flex items-center gap-4">
                    <p className="text-4xl font-bold tabular-nums">{rating.average.toFixed(1)}</p>
                    <div>
                      <Stars value={rating.average} size={18} />
                      <p className="mt-1 text-sm text-ink-faint">
                        from {rating.count} {rating.count === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 space-y-2">
                    {scoreRows.map((row) => (
                      <div key={row.label} className="flex items-center gap-3 text-sm">
                        <dt className="w-52 shrink-0 text-ink-soft">{row.label}</dt>
                        <dd className="flex flex-1 items-center gap-2">
                          <span className="h-1.5 flex-1 rounded bg-line-soft">
                            <span
                              className="block h-1.5 rounded bg-gold"
                              style={{ width: `${(row.value / 5) * 100}%` }}
                            />
                          </span>
                          <span className="w-8 text-right tabular-nums">{row.value.toFixed(1)}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-4 grid gap-3">
                  {reviews.map((r) => {
                    const avg = (r.quality + r.punctuality + r.delivery + r.value + r.communication) / 5;
                    return (
                      <article key={r.id} className="card p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{r.authorName}</p>
                          <span className="text-xs text-ink-faint">{prettyDate(r.createdAt.slice(0, 10))}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Stars value={avg} />
                          <span className="text-sm font-semibold">{avg.toFixed(1)}</span>
                        </div>
                        <p className="mt-2 text-sm text-ink-soft">{r.comment}</p>
                        {r.reply ? (
                          <p className="mt-3 rounded-lg bg-sand p-3 text-sm text-ink-soft">
                            <strong className="text-ink">Reply from {profile.displayName}:</strong> {r.reply}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside>
          <div className="card sticky top-20 p-5">
            <p className="text-sm text-ink-soft">
              {detail.startingRate ? (
                <>
                  Starts from{" "}
                  <span className="text-xl font-bold text-ink">{rupees(detail.startingRate.amount)}</span>{" "}
                  / {rateUnit(detail.startingRate.type)}
                </>
              ) : (
                "Rate on request"
              )}
            </p>
            <p className="mt-1 text-xs text-ink-faint">{responseText(profile.responseHours)}</p>

            <div className="mt-4 border-t border-line-soft pt-4">
              <h2 className="font-bold">Send a booking request</h2>
              <p className="mb-4 mt-1 text-xs text-ink-faint">
                Free. The photographer replies with a quote.
              </p>
              <EnquiryForm
                photographerId={profile.id}
                photographerName={profile.displayName}
                categories={categories.map((c) => ({ id: c.id, name: c.name }))}
                defaultDate={date}
                defaultCity={city.name}
                today={today}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
