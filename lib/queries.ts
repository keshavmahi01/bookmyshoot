import "server-only";
import { cols, type Filter } from "@/db/client";
import type {
  Category,
  City,
  Photographer,
  Rate,
  Review,
} from "@/db/schema";
import { parseISODate, toISODate } from "./format";
import { distanceKm } from "./geo";

export type RatingSummary = {
  count: number;
  average: number;
  quality: number;
  punctuality: number;
  delivery: number;
  value: number;
  communication: number;
};

export type PhotographerCard = {
  profile: Photographer;
  city: City;
  categories: Category[];
  rates: Rate[];
  startingRate: Rate | null;
  rating: RatingSummary;
  availableOnDate: boolean | null;
  distanceKm: number | null;
};

export async function getCities() {
  const list = await cols.cities.find({}, { sort: { name: 1 } });
  return list;
}

export async function getCategories() {
  return cols.categories.find();
}

export async function getCityBySlug(slug: string) {
  return cols.cities.findOne({ slug });
}

export async function getCategoryBySlug(slug: string) {
  return cols.categories.findOne({ slug });
}

function emptyRating(): RatingSummary {
  return { count: 0, average: 0, quality: 0, punctuality: 0, delivery: 0, value: 0, communication: 0 };
}

export function summariseReviews(list: Review[]): RatingSummary {
  const visible = list.filter((r) => !r.hidden);
  if (visible.length === 0) return emptyRating();
  const sum = (pick: (r: Review) => number) =>
    visible.reduce((acc, r) => acc + pick(r), 0) / visible.length;
  const quality = sum((r) => r.quality);
  const punctuality = sum((r) => r.punctuality);
  const delivery = sum((r) => r.delivery);
  const value = sum((r) => r.value);
  const communication = sum((r) => r.communication);
  return {
    count: visible.length,
    average: (quality + punctuality + delivery + value + communication) / 5,
    quality,
    punctuality,
    delivery,
    value,
    communication,
  };
}

/** A photographer is free on a date unless it is blocked or it is a weekly off day. */
export function isFreeOn(profile: Photographer, date: string) {
  if (profile.blocked.some((b) => b.date === date)) return false;
  const weekday = parseISODate(date).getDay();
  return !profile.weeklyOff.includes(weekday);
}

export type SearchFilters = {
  city?: string;
  state?: string;
  district?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  date?: string;
  category?: string;
  budget?: string;
  rateType?: string;
  team?: string;
  language?: string;
  gender?: string;
  verification?: string;
  rating?: string;
  experience?: string;
  extras?: string[];
  sort?: string;
};

/** Everything the search page and the home page ask the database for. */
export async function searchPhotographers(filters: SearchFilters = {}): Promise<PhotographerCard[]> {
  const [allCities, allCategories] = await Promise.all([
    cols.cities.find(),
    cols.categories.find(),
  ]);
  const cityById = new Map(allCities.map((c) => [c.id, c]));
  const categoryById = new Map(allCategories.map((c) => [c.id, c]));

  // What MongoDB can answer on its own.
  const where: Filter = { active: true, status: "APPROVED" };

  if (filters.city) {
    const city = allCities.find((c) => c.slug === filters.city);
    if (city) where.$or = [{ cityId: city.id }, { travelsAllIndia: true }];
  } else if (filters.district) {
    where.cityId = {
      $in: allCities.filter((c) => c.district === filters.district).map((c) => c.id),
    };
  } else if (filters.state) {
    where.cityId = { $in: allCities.filter((c) => c.state === filters.state).map((c) => c.id) };
  }

  if (filters.category) {
    const picked = allCategories.find((c) => c.slug === filters.category);
    where.categoryIds = picked ? picked.id : "no-such-category";
  }

  if (filters.gender) where.gender = filters.gender;
  if (filters.language) where.languages = filters.language;

  if (filters.team === "solo") where.teamSize = 1;
  else if (filters.team === "small") where.teamSize = { $gte: 2, $lte: 3 };
  else if (filters.team) where.teamSize = { $gte: 4 };

  if (filters.verification === "ID_VERIFIED") {
    where.verification = { $in: ["ID_VERIFIED", "WORK_VERIFIED"] };
  } else if (filters.verification) {
    where.verification = "WORK_VERIFIED";
  }

  if (filters.experience === "1-3") where.yearsExperience = { $lte: 3 };
  else if (filters.experience === "3-7") where.yearsExperience = { $gt: 3, $lte: 7 };
  else if (filters.experience) where.yearsExperience = { $gt: 7 };

  for (const extra of filters.extras ?? []) {
    if (extra === "drone") where.droneAvailable = true;
    if (extra === "backup") where.backupGear = true;
    if (extra === "second") where.secondShooter = true;
    if (extra === "album") where.albumIncluded = true;
    if (extra === "raw") where.rawFiles = true;
  }

  let profiles = await cols.photographers.find(where);

  // Near me: keep only profiles whose base city is inside the radius.
  const hasPoint =
    typeof filters.lat === "number" &&
    typeof filters.lng === "number" &&
    Number.isFinite(filters.lat) &&
    Number.isFinite(filters.lng);
  const radius = filters.radiusKm && filters.radiusKm > 0 ? filters.radiusKm : 100;
  if (hasPoint) {
    profiles = profiles.filter((p) => {
      const c = cityById.get(p.cityId);
      if (!c) return false;
      return distanceKm(filters.lat as number, filters.lng as number, c.lat, c.lng) <= radius;
    });
  }

  if (profiles.length === 0) return [];
  const ids = profiles.map((p) => p.id);

  const [rateRows, reviewRows] = await Promise.all([
    cols.rates.find({ photographerId: { $in: ids }, active: true }),
    cols.reviews.find({ photographerId: { $in: ids } }),
  ]);

  const ratesByPhotographer = new Map<string, Rate[]>();
  for (const rate of rateRows) {
    const list = ratesByPhotographer.get(rate.photographerId) ?? [];
    list.push(rate);
    ratesByPhotographer.set(rate.photographerId, list);
  }
  const reviewsByPhotographer = new Map<string, Review[]>();
  for (const review of reviewRows) {
    const list = reviewsByPhotographer.get(review.photographerId) ?? [];
    list.push(review);
    reviewsByPhotographer.set(review.photographerId, list);
  }

  if (filters.rateType) {
    profiles = profiles.filter((p) =>
      (ratesByPhotographer.get(p.id) ?? []).some((r) => r.type === filters.rateType),
    );
  }

  if (filters.budget) {
    const [lowRaw, highRaw] = filters.budget.split("-").map(Number);
    const low = lowRaw || 0;
    const high = highRaw || Number.MAX_SAFE_INTEGER;
    profiles = profiles.filter((p) => {
      const list = ratesByPhotographer.get(p.id) ?? [];
      if (list.length === 0) return false;
      const min = Math.min(...list.map((r) => r.amount));
      return min >= low && min <= high;
    });
  }

  let cards: PhotographerCard[] = profiles.map((profile) => {
    const list = ratesByPhotographer.get(profile.id) ?? [];
    const startingRate = list.length
      ? list.reduce((min, r) => (r.amount < min.amount ? r : min), list[0])
      : null;
    const city = cityById.get(profile.cityId)!;
    return {
      profile,
      city,
      categories: profile.categoryIds
        .map((id) => categoryById.get(id))
        .filter((c): c is Category => Boolean(c)),
      rates: list,
      startingRate,
      rating: summariseReviews(reviewsByPhotographer.get(profile.id) ?? []),
      availableOnDate: filters.date ? isFreeOn(profile, filters.date) : null,
      distanceKm:
        hasPoint && city
          ? Math.round(distanceKm(filters.lat as number, filters.lng as number, city.lat, city.lng))
          : null,
    };
  });

  if (filters.rating) {
    const min = Number(filters.rating);
    cards = cards.filter((c) => c.rating.count > 0 && c.rating.average >= min);
  }

  const sort = filters.sort ?? "best";
  const searchedCityId = filters.city
    ? allCities.find((c) => c.slug === filters.city)?.id
    : undefined;
  cards.sort((a, b) => {
    if (sort === "distance" || (hasPoint && sort === "best")) {
      const freeDiff = Number(b.availableOnDate ?? false) - Number(a.availableOnDate ?? false);
      if (sort === "best" && freeDiff !== 0) return freeDiff;
      return (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9);
    }
    if (sort === "rating") return b.rating.average - a.rating.average;
    if (sort === "price_low")
      return (a.startingRate?.amount ?? 1e9) - (b.startingRate?.amount ?? 1e9);
    if (sort === "price_high")
      return (b.startingRate?.amount ?? 0) - (a.startingRate?.amount ?? 0);
    if (sort === "experience") return b.profile.yearsExperience - a.profile.yearsExperience;
    // best match: free on the asked date, then based in the searched city, then
    // rating, then reply speed, then jobs done
    const freeDiff = Number(b.availableOnDate ?? false) - Number(a.availableOnDate ?? false);
    if (freeDiff !== 0) return freeDiff;
    if (searchedCityId) {
      const localDiff =
        Number(b.profile.cityId === searchedCityId) - Number(a.profile.cityId === searchedCityId);
      if (localDiff !== 0) return localDiff;
    }
    const ratingDiff = b.rating.average - a.rating.average;
    if (Math.abs(ratingDiff) > 0.05) return ratingDiff;
    const replyDiff = a.profile.responseHours - b.profile.responseHours;
    if (replyDiff !== 0) return replyDiff;
    return b.profile.jobsCompleted - a.profile.jobsCompleted;
  });

  return cards;
}

export async function getPhotographerBySlug(slug: string) {
  const profile = await cols.photographers.findOne({ slug });
  if (!profile) return null;
  return expandPhotographer(profile);
}

export async function getPhotographerByUserId(userId: string) {
  const profile = await cols.photographers.findOne({ userId });
  if (!profile) return null;
  return expandPhotographer(profile);
}

export async function expandPhotographer(profile: Photographer) {
  const [city, owner, cats, rateList, addOnList, portfolio, reviewRows] = await Promise.all([
    cols.cities.findById(profile.cityId),
    cols.users.findById(profile.userId),
    profile.categoryIds.length
      ? cols.categories.find({ id: { $in: profile.categoryIds } })
      : Promise.resolve([]),
    cols.rates.find({ photographerId: profile.id, active: true }),
    cols.addOns.find({ photographerId: profile.id }),
    cols.portfolio.find({ photographerId: profile.id }, { sort: { position: 1 } }),
    cols.reviews.find({ photographerId: profile.id }, { sort: { createdAt: -1 } }),
  ]);
  const reviewList = reviewRows.filter((r) => !r.hidden);

  return {
    profile,
    owner: owner!,
    city: city!,
    categories: cats,
    rates: rateList,
    addOns: addOnList,
    portfolio,
    reviews: reviewList,
    rating: summariseReviews(reviewList),
    blocked: new Map(profile.blocked.map((b) => [b.date, b.status])),
    startingRate: rateList.length
      ? rateList.reduce((min, r) => (r.amount < min.amount ? r : min), rateList[0])
      : null,
  };
}

export type PhotographerDetail = Awaited<ReturnType<typeof expandPhotographer>>;

export function profileCompleteness(detail: PhotographerDetail) {
  const checks = [
    Boolean(detail.profile.avatarPath),
    detail.portfolio.length >= 10,
    detail.rates.length > 0,
    detail.profile.gear.length > 10,
    detail.profile.bio.length > 120,
    detail.categories.length > 0,
    detail.profile.verification !== "LISTED",
    detail.addOns.length > 0,
    detail.profile.languages.length > 1,
  ];
  const done = checks.filter(Boolean).length;
  return { percent: Math.round((done / checks.length) * 100), checks };
}

export function enquiriesForPhotographer(photographerId: string) {
  return cols.enquiries.find({ photographerId }, { sort: { createdAt: -1 } });
}

export function enquiriesForUser(userId: string) {
  return cols.enquiries.find({ userId }, { sort: { createdAt: -1 } });
}

export function bookingsForPhotographer(photographerId: string) {
  return cols.bookings.find({ photographerId }, { sort: { eventDate: 1 } });
}

export function upcomingDates(count = 60) {
  const out: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(toISODate(d));
  }
  return out;
}

export async function platformStats() {
  const [live, cityCount, enquiryCount, bookingRows] = await Promise.all([
    cols.photographers.find({ active: true, status: "APPROVED" }),
    cols.cities.countDocuments(),
    cols.enquiries.countDocuments(),
    cols.bookings.find(),
  ]);
  return {
    photographers: live.length,
    verified: live.filter((p) => p.verification !== "LISTED").length,
    cities: new Set(live.map((p) => p.cityId)).size,
    allCities: cityCount,
    enquiries: enquiryCount,
    bookings: bookingRows.length,
    completed: bookingRows.filter((b) => b.status === "COMPLETED").length,
  };
}

export async function customerDashboard(userId: string) {
  const mine = await enquiriesForUser(userId);
  if (mine.length === 0) return [];
  const enquiryIds = mine.map((e) => e.id);
  const photographerIds = [...new Set(mine.map((e) => e.photographerId))];

  const [bookingRows, profiles] = await Promise.all([
    cols.bookings.find({ enquiryId: { $in: enquiryIds } }),
    cols.photographers.find({ id: { $in: photographerIds } }),
  ]);
  const reviewRows = bookingRows.length
    ? await cols.reviews.find({ bookingId: { $in: bookingRows.map((b) => b.id) } })
    : [];
  const owners = profiles.length
    ? await cols.users.find({ id: { $in: profiles.map((p) => p.userId) } })
    : [];

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  const ownerById = new Map(owners.map((u) => [u.id, u]));

  return mine.map((enquiry) => {
    const booking = bookingRows.find((b) => b.enquiryId === enquiry.id) ?? null;
    const review = booking ? (reviewRows.find((r) => r.bookingId === booking.id) ?? null) : null;
    const profile = profileById.get(enquiry.photographerId) ?? null;
    // The number opens only once the photographer has accepted.
    const phone = booking && profile ? (ownerById.get(profile.userId)?.phone ?? null) : null;
    return { enquiry, booking, review, profile, phone };
  });
}

export async function adminOverview() {
  const [profiles, allCities, allEnquiries, allBookings, allReviews, owners] = await Promise.all([
    cols.photographers.find({}, { sort: { createdAt: -1 } }),
    cols.cities.find(),
    cols.enquiries.find(),
    cols.bookings.find(),
    cols.reviews.find({}, { sort: { createdAt: -1 } }),
    cols.users.find(),
  ]);
  const cityById = new Map(allCities.map((c) => [c.id, c]));
  const ownerById = new Map(owners.map((u) => [u.id, u]));

  const pending = profiles.filter((p) => p.verification === "LISTED" && p.status === "APPROVED");
  const awaitingApproval = profiles.filter((p) => p.status === "PENDING");
  const noReply = allEnquiries.filter((e) => e.status === "NEW");

  const byCity = allCities
    .map((c) => ({ city: c, count: profiles.filter((p) => p.cityId === c.id && p.active).length }))
    .sort((a, b) => b.count - a.count);

  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.displayName ?? "Unknown";

  return {
    profiles: profiles.map((p) => ({
      profile: p,
      city: cityById.get(p.cityId)!,
      owner: ownerById.get(p.userId)!,
    })),
    pending,
    awaitingApproval,
    noReply,
    byCity,
    counts: {
      profiles: profiles.length,
      active: profiles.filter((p) => p.active && p.status === "APPROVED").length,
      awaiting: awaitingApproval.length,
      verified: profiles.filter((p) => p.verification !== "LISTED").length,
      enquiries: allEnquiries.length,
      bookings: allBookings.length,
      reviews: allReviews.length,
      sampleProfiles: profiles.filter((p) => p.sample).length,
      sampleUsers: owners.filter((u) => u.sample).length,
    },
    reviews: allReviews.map((r) => ({ review: r, profile: nameOf(r.photographerId) })).slice(0, 30),
  };
}

/** Everyone who can sign in to the admin panel. */
export async function adminUsers() {
  return cols.users.find({ role: "ADMIN" }, { sort: { createdAt: 1 } });
}

export function adminLogRows() {
  return cols.adminLogs.find({}, { sort: { createdAt: -1 } });
}

export async function getStates() {
  const all = await cols.cities.find();
  return [...new Set(all.map((c) => c.state))].sort((a, b) => a.localeCompare(b));
}

export async function getDistricts(state?: string) {
  const all = await cols.cities.find(state ? { state } : {});
  return [...new Set(all.map((c) => c.district))].sort((a, b) => a.localeCompare(b));
}

export async function getDistrictTree() {
  const all = await cols.cities.find();
  const byState = new Map<string, Map<string, City[]>>();
  for (const city of all) {
    const districts = byState.get(city.state) ?? new Map<string, City[]>();
    const list = districts.get(city.district) ?? [];
    list.push(city);
    districts.set(city.district, list);
    byState.set(city.state, districts);
  }
  return [...byState.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([state, districts]) => ({
      state,
      districts: [...districts.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([district, list]) => ({
          district,
          cities: list.sort((a, b) => a.name.localeCompare(b.name)),
        })),
    }));
}

/** How many messages in a thread the given side has not read yet. */
export async function threadSummary(enquiryIds: string[]) {
  const map = new Map<
    string,
    { total: number; unreadPhotographer: number; unreadCustomer: number }
  >();
  for (const id of enquiryIds) {
    map.set(id, { total: 0, unreadPhotographer: 0, unreadCustomer: 0 });
  }
  if (enquiryIds.length === 0) return map;
  const rows = await cols.messages.find({ enquiryId: { $in: enquiryIds } });
  for (const m of rows) {
    const entry = map.get(m.enquiryId);
    if (!entry) continue;
    entry.total += 1;
    if (!m.readAt) {
      if (m.senderRole === "CUSTOMER") entry.unreadPhotographer += 1;
      else entry.unreadCustomer += 1;
    }
  }
  return map;
}

/** Lowest and middle starting price per shoot type, from what is actually listed. */
export async function priceGuide(citySlug?: string) {
  const [cards, all] = await Promise.all([
    searchPhotographers(citySlug ? { city: citySlug } : {}),
    getCategories(),
  ]);

  return all
    .map((category) => {
      const prices = cards
        .filter((c) => c.categories.some((x) => x.slug === category.slug))
        .map((c) => c.startingRate?.amount ?? 0)
        .filter((n) => n > 0)
        .sort((a, b) => a - b);
      return {
        category,
        count: prices.length,
        low: prices[0],
        median: prices.length ? prices[Math.floor(prices.length / 2)] : undefined,
        high: prices.at(-1),
      };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Real photos from live profiles, for the strip on the home page. */
export async function recentWork(limit = 14) {
  const liveProfiles = await cols.photographers.find({ active: true, status: "APPROVED" });
  if (liveProfiles.length === 0) return [];
  const live = new Map(liveProfiles.map((p) => [p.id, p]));
  const items = await cols.portfolio.find(
    { photographerId: { $in: [...live.keys()] }, kind: "PHOTO" },
    { sort: { photographerId: 1, position: 1 } },
  );
  return items.slice(0, limit).map((item) => ({ item, profile: live.get(item.photographerId)! }));
}

/** Handy dates for the one tap shortcuts under the search box. */
export function dateShortcuts() {
  const today = new Date();
  const comingDay = (weekday: number, weeksAhead = 0) => {
    const d = new Date(today);
    const diff = (weekday - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff + weeksAhead * 7);
    return toISODate(d);
  };
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 15);
  const season = new Date(today.getFullYear() + (today.getMonth() > 10 ? 1 : 0), 10, 20);

  return [
    { label: "This Saturday", date: comingDay(6) },
    { label: "This Sunday", date: comingDay(0) },
    { label: "Next weekend", date: comingDay(6, 1) },
    { label: "Mid next month", date: toISODate(nextMonth) },
    { label: "Wedding season", date: toISODate(season) },
  ];
}

/** Numbers for the admin reports tab. */
export async function adminReport(days = 30) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const within = (iso: string) => new Date(iso).getTime() >= since;

  const [profiles, allCities, allEnquiries, allBookings, allReviews] = await Promise.all([
    cols.photographers.find(),
    cols.cities.find(),
    cols.enquiries.find(),
    cols.bookings.find(),
    cols.reviews.find(),
  ]);
  const cityById = new Map(allCities.map((c) => [c.id, c]));

  const periodEnquiries = allEnquiries.filter((e) => within(e.createdAt));
  const periodBookings = allBookings.filter((b) => within(b.createdAt));
  const answered = periodEnquiries.filter((e) => e.status !== "NEW");

  const replyHours = answered
    .filter((e) => e.respondedAt)
    .map((e) => (new Date(e.respondedAt!).getTime() - new Date(e.createdAt).getTime()) / 3600000)
    .filter((h) => h >= 0);

  const byCity = new Map<string, { city: string; enquiries: number; bookings: number }>();
  for (const e of periodEnquiries) {
    const row = byCity.get(e.cityName) ?? { city: e.cityName, enquiries: 0, bookings: 0 };
    row.enquiries += 1;
    byCity.set(e.cityName, row);
  }
  for (const b of periodBookings) {
    const enquiry = allEnquiries.find((e) => e.id === b.enquiryId);
    if (!enquiry) continue;
    const row = byCity.get(enquiry.cityName) ?? {
      city: enquiry.cityName,
      enquiries: 0,
      bookings: 0,
    };
    row.bookings += 1;
    byCity.set(enquiry.cityName, row);
  }

  const topCategories = new Map<string, number>();
  for (const e of periodEnquiries) {
    topCategories.set(e.eventType, (topCategories.get(e.eventType) ?? 0) + 1);
  }

  return {
    days,
    newProfiles: profiles.filter((p) => within(p.createdAt)).length,
    approvedProfiles: profiles.filter(
      (p) => p.reviewedAt && within(p.reviewedAt) && p.status === "APPROVED",
    ).length,
    enquiries: periodEnquiries.length,
    answered: answered.length,
    unanswered: periodEnquiries.filter((e) => e.status === "NEW").length,
    bookings: periodBookings.length,
    completed: periodBookings.filter((b) => b.status === "COMPLETED").length,
    reviews: allReviews.filter((r) => within(r.createdAt)).length,
    replyRate: periodEnquiries.length
      ? Math.round((answered.length / periodEnquiries.length) * 100)
      : 0,
    bookingRate: periodEnquiries.length
      ? Math.round((periodBookings.length / periodEnquiries.length) * 100)
      : 0,
    medianReplyHours: replyHours.length
      ? replyHours.sort((a, b) => a - b)[Math.floor(replyHours.length / 2)]
      : null,
    byCity: [...byCity.values()].sort((a, b) => b.enquiries - a.enquiries).slice(0, 12),
    topCategories: [...topCategories.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    emptyCities: allCities
      .filter((c) => !profiles.some((p) => p.cityId === c.id && p.status === "APPROVED"))
      .map((c) => c.name),
    cityById,
  };
}

export function heroImages() {
  return cols.siteImages.find({ active: true, slot: "HERO" }, { sort: { position: 1 } });
}

export function allHeroImages() {
  return cols.siteImages.find({}, { sort: { position: 1 } });
}

/** Profiles for the slider under the hero. Falls back to the best rated. */
export async function featuredProfiles(limit = 10) {
  const cards = await searchPhotographers({});
  const picked = cards
    .filter((c) => c.profile.featured)
    .sort((a, b) => a.profile.featuredOrder - b.profile.featuredOrder);
  if (picked.length > 0) return picked.slice(0, limit);
  return [...cards]
    .sort(
      (a, b) =>
        b.rating.average - a.rating.average || b.profile.jobsCompleted - a.profile.jobsCompleted,
    )
    .slice(0, limit);
}

export function listSuggestions() {
  return cols.suggestions.find({}, { sort: { createdAt: -1 } });
}
