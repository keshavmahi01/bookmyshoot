import type { Photographer } from "./schema";

/**
 * A full profile document with sensible defaults.
 *
 * MongoDB has no column defaults, so new profiles are built here and only the
 * fields that are known get passed in.
 */
export function blankPhotographer(
  fields: Pick<Photographer, "id" | "slug" | "userId" | "displayName" | "cityId"> &
    Partial<Photographer>,
): Photographer {
  const now = new Date().toISOString();
  return {
    tagline: "New on BookMyShoot",
    bio: "",
    avatarPath: null,
    coverPath: null,
    instagram: "",
    facebook: "",
    youtube: "",
    website: "",
    travelKm: 100,
    travelsAllIndia: false,
    categoryIds: [],
    blocked: [],
    yearsExperience: 1,
    teamSize: 1,
    languages: ["Hindi", "English"],
    gender: "MALE",
    verification: "LISTED",
    verifiedNote: "",
    verifiedAt: null,
    gear: "",
    backupGear: false,
    droneAvailable: false,
    secondShooter: false,
    ownEditing: true,
    deliveryDays: 21,
    photosPerDay: 300,
    rawFiles: false,
    albumIncluded: false,
    responseHours: 4,
    eventsCovered: 0,
    jobsCompleted: 0,
    repeatClients: 0,
    cancellations: 0,
    referredBy: "",
    featured: false,
    featuredOrder: 0,
    weeklyOff: [],
    status: "PENDING",
    reviewNote: "",
    reviewedAt: null,
    active: true,
    sample: false,
    lastActiveAt: now,
    createdAt: now,
    ...fields,
  };
}
