import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Photo } from "@/components/photo";
import { EmptyState, RatingLine, VerifiedBadge } from "@/components/ui";
import { getPhotographerBySlug } from "@/lib/queries";
import { placeLine, responseText, rupees } from "@/lib/format";
import { rateLabel, rateUnit } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Compare photographers",
  robots: { index: false },
};

const yesNo = (value: boolean) => (value ? "Yes" : "No");

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const slugs = (ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const people = (await Promise.all(slugs.map((slug) => getPhotographerBySlug(slug)))).filter(
    (d): d is NonNullable<typeof d> => Boolean(d) && d!.profile.status === "APPROVED",
  );

  if (people.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14">
        <EmptyState
          title="Nothing to compare yet"
          body="Open a search, press Shortlist on the profiles you like, then come back here. You can compare three at a time."
          action={{ label: "Search photographers", href: "/search" }}
        />
      </div>
    );
  }

  const rows: { label: string; value: (d: (typeof people)[number]) => React.ReactNode }[] = [
    { label: "City", value: (d) => placeLine(d.city) },
    {
      label: "Verification",
      value: (d) => <VerifiedBadge level={d.profile.verification} />,
    },
    {
      label: "Rating",
      value: (d) => <RatingLine average={d.rating.average} count={d.rating.count} />,
    },
    { label: "Events covered", value: (d) => d.profile.eventsCovered },
    { label: "Jobs through BookMyShoot", value: (d) => d.profile.jobsCompleted },
    {
      label: "Starts from",
      value: (d) =>
        d.startingRate
          ? `${rupees(d.startingRate.amount)} / ${rateUnit(d.startingRate.type)}`
          : "On request",
    },
    {
      label: "Rate types",
      value: (d) => [...new Set(d.rates.map((r) => rateLabel(r.type)))].join(", ") || "Not set",
    },
    { label: "Experience", value: (d) => `${d.profile.yearsExperience} years` },
    {
      label: "Team",
      value: (d) => `${d.profile.teamSize} ${d.profile.teamSize === 1 ? "person" : "people"}`,
    },
    { label: "Languages", value: (d) => d.profile.languages.join(", ") },
    { label: "Delivery", value: (d) => `${d.profile.deliveryDays} days` },
    { label: "Edited photos per day", value: (d) => d.profile.photosPerDay },
    { label: "Backup camera", value: (d) => yesNo(d.profile.backupGear) },
    { label: "Second shooter", value: (d) => yesNo(d.profile.secondShooter) },
    { label: "Drone", value: (d) => yesNo(d.profile.droneAvailable) },
    { label: "Album included", value: (d) => yesNo(d.profile.albumIncluded) },
    { label: "Raw files", value: (d) => yesNo(d.profile.rawFiles) },
    {
      label: "Travel",
      value: (d) =>
        d.profile.travelsAllIndia ? "Anywhere in India" : `Up to ${d.profile.travelKm} km`,
    },
    { label: "Reply time", value: (d) => responseText(d.profile.responseHours) },
    { label: "Cancellations, 12 months", value: (d) => d.profile.cancellations },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28">
      <h1 className="text-xl font-bold sm:text-2xl">Side by side</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The things people argue about later are near the bottom: delivery, album, raw files and
        cancellations. Read those before you decide on price.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-paper px-3 py-3 text-left align-bottom" />
              {people.map((d) => (
                <th key={d.profile.id} className="px-3 py-3 text-left align-bottom">
                  <Photo
                    imagePath={d.profile.coverPath}
                    seed={`${d.profile.slug}-cover`}
                    alt=""
                    w={360}
                    h={200}
                    className="mb-2 h-20 w-full rounded-lg object-cover"
                  />
                  <div className="flex items-center gap-2">
                    <Avatar src={d.profile.avatarPath} name={d.profile.displayName} size={32} />
                    <Link
                      href={`/p/${d.profile.slug}`}
                      className="font-bold leading-tight hover:text-brand"
                    >
                      {d.profile.displayName}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.label} className={i % 2 ? "bg-sand" : ""}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 whitespace-nowrap px-3 py-2.5 text-left font-medium text-ink-soft ${
                    i % 2 ? "bg-sand" : "bg-paper"
                  }`}
                >
                  {row.label}
                </th>
                {people.map((d) => (
                  <td key={d.profile.id} className="px-3 py-2.5 align-top">
                    {row.value(d)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th className="sticky left-0 z-10 bg-paper px-3 py-4" />
              {people.map((d) => (
                <td key={d.profile.id} className="px-3 py-4">
                  <Link href={`/p/${d.profile.slug}`} className="btn btn-primary w-full">
                    Send a request
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
