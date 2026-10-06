import Link from "next/link";
import type { PhotographerCard as Card } from "@/lib/queries";
import { rateLabel, rateUnit } from "@/lib/constants";
import { placeLine, rupees, responseText } from "@/lib/format";
import { Pill, RatingLine, VerifiedBadge } from "./ui";
import { Avatar, Photo } from "./photo";
import ShortlistButton from "./shortlist-button";

export default function PhotographerCardView({ card }: { card: Card }) {
  const { profile, city, categories, startingRate, rating, availableOnDate, distanceKm } = card;

  return (
    <article className="card lift overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Link
          href={`/p/${profile.slug}`}
          className="relative block shrink-0 sm:w-56"
          aria-label={profile.displayName}
        >
          <Photo
            imagePath={profile.coverPath}
            seed={`${profile.slug}-cover`}
            label={profile.displayName}
            alt={`Work by ${profile.displayName}`}
            w={640}
            h={480}
            className="h-44 w-full object-cover sm:h-full"
          />
        </Link>

        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar src={profile.avatarPath} name={profile.displayName} size={44} />
              <div>
                <h3 className="text-base font-bold">
                  <Link href={`/p/${profile.slug}`} className="hover:text-brand">
                    {profile.displayName}
                  </Link>
                </h3>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {placeLine(city)}
                  {distanceKm !== null && distanceKm !== undefined
                    ? ` · ${distanceKm} km away`
                    : profile.travelsAllIndia
                      ? " · travels all India"
                      : ` · travels ${profile.travelKm} km`}
                </p>
              </div>
            </div>
            <VerifiedBadge level={profile.verification} />
          </div>

          <p className="mt-2 text-sm text-ink-soft">{profile.tagline}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.slice(0, 3).map((c) => (
              <Pill key={c.id}>{c.name}</Pill>
            ))}
            {profile.teamSize > 1 ? <Pill>{profile.teamSize} member team</Pill> : <Pill>Solo</Pill>}
            {profile.droneAvailable ? <Pill>Drone</Pill> : null}
            {profile.backupGear ? <Pill>Backup camera</Pill> : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <RatingLine average={rating.average} count={rating.count} />
            <span className="text-sm text-ink-faint">{profile.eventsCovered} events covered</span>
            <span className="text-sm text-ink-faint">{responseText(profile.responseHours)}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-line-soft pt-3">
            <div>
              {startingRate ? (
                <p className="text-sm text-ink-soft">
                  Starts from{" "}
                  <span className="text-base font-bold text-ink">{rupees(startingRate.amount)}</span>{" "}
                  <span className="text-ink-faint">
                    / {rateUnit(startingRate.type)} ({rateLabel(startingRate.type)})
                  </span>
                </p>
              ) : (
                <p className="text-sm text-ink-faint">Rate on request</p>
              )}
              {availableOnDate !== null ? (
                availableOnDate ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-green">
                    <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M7.6 13.4L4.2 10l1.2-1.2 2.2 2.2 6-6L14.8 6z" fill="currentColor" />
                    </svg>
                    Free on your date
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink-faint">Busy on your date</p>
                )
              ) : null}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <ShortlistButton slug={profile.slug} />
              <Link href={`/p/${profile.slug}`} className="btn btn-ghost">
                See profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
