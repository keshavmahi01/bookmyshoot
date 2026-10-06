"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import type { RateType } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { cleanSocial } from "@/lib/social";

async function ownProfile() {
  const user = await currentUser();
  if (!user || user.role !== "PHOTOGRAPHER") return null;
  return cols.photographers.findOne({ userId: user.id });
}

export async function toggleDate(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const date = String(formData.get("date") ?? "");
  if (!date) return;

  // Busy dates live inside the profile document.
  const already = profile.blocked.some((b) => b.date === date);
  await cols.photographers.updateById(
    profile.id,
    already
      ? { $pull: { blocked: { date } } }
      : {
          $push: {
            blocked: { date, status: "BUSY", note: "Marked busy by the photographer" },
          },
        },
  );
  await touch(profile.id);
  revalidatePath("/dashboard/calendar");
  revalidatePath(`/p/${profile.slug}`);
}

export async function saveProfile(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;

  const num = (key: string, fallback: number) => {
    const raw = String(formData.get(key) ?? "").trim();
    const value = Number(raw);
    return Number.isFinite(value) && raw !== "" ? value : fallback;
  };
  const bool = (key: string) => formData.get(key) === "on";

  await cols.photographers.setById(profile.id, {
      displayName: String(formData.get("displayName") ?? profile.displayName).trim(),
      tagline: String(formData.get("tagline") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      languages: String(formData.get("languages") ?? profile.languages.join(","))
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      gender: String(formData.get("gender") ?? profile.gender) as typeof profile.gender,
      travelKm: num("travelKm", profile.travelKm),
      travelsAllIndia: bool("travelsAllIndia"),
      yearsExperience: num("yearsExperience", profile.yearsExperience),
      teamSize: num("teamSize", profile.teamSize),
      gear: String(formData.get("gear") ?? "").trim(),
      backupGear: bool("backupGear"),
      droneAvailable: bool("droneAvailable"),
      secondShooter: bool("secondShooter"),
      ownEditing: bool("ownEditing"),
      eventsCovered: num("eventsCovered", profile.eventsCovered),
      deliveryDays: num("deliveryDays", profile.deliveryDays),
      photosPerDay: num("photosPerDay", profile.photosPerDay),
      rawFiles: bool("rawFiles"),
      albumIncluded: bool("albumIncluded"),
      instagram: cleanSocial("instagram", String(formData.get("instagram") ?? "")),
      facebook: cleanSocial("facebook", String(formData.get("facebook") ?? "")),
      youtube: cleanSocial("youtube", String(formData.get("youtube") ?? "")),
      website: cleanSocial("website", String(formData.get("website") ?? "")),
      weeklyOff: (formData.getAll("weeklyOff") as string[]).map(Number).filter(Number.isFinite),
      lastActiveAt: new Date().toISOString(),
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/p/${profile.slug}`);
}

export async function addRate(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const amount = Number(String(formData.get("amount") ?? "0"));
  const title = String(formData.get("title") ?? "").trim();
  if (!title || !amount) return;

  await cols.rates.insertOne({
    id: newId("rate_"),
    photographerId: profile.id,
    type: String(formData.get("type") ?? "PACKAGE") as RateType,
    title,
    amount,
    minUnits: Number(String(formData.get("minUnits") ?? "1")) || 1,
    extraUnitRate: Number(String(formData.get("extraUnitRate") ?? "")) || null,
    details: String(formData.get("details") ?? "").trim(),
    active: true,
  });
  await touch(profile.id);
  revalidatePath("/dashboard/rates");
  revalidatePath(`/p/${profile.slug}`);
}

export async function removeRate(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const rateId = String(formData.get("rateId") ?? "");
  const rate = await cols.rates.findById(rateId);
  if (!rate || rate.photographerId !== profile.id) return;
  await cols.rates.deleteById(rateId);
  revalidatePath("/dashboard/rates");
  revalidatePath(`/p/${profile.slug}`);
}

export async function addAddOn(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "0"));
  if (!label || !amount) return;
  await cols.addOns.insertOne({
    id: newId("addon_"),
    photographerId: profile.id,
    label,
    amount,
    note: String(formData.get("note") ?? "").trim(),
  });
  revalidatePath("/dashboard/rates");
  revalidatePath(`/p/${profile.slug}`);
}

export async function removeAddOn(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const addOnId = String(formData.get("addOnId") ?? "");
  const row = await cols.addOns.findById(addOnId);
  if (!row || row.photographerId !== profile.id) return;
  await cols.addOns.deleteById(addOnId);
  revalidatePath("/dashboard/rates");
  revalidatePath(`/p/${profile.slug}`);
}

export async function replyToReview(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const reviewId = String(formData.get("reviewId") ?? "");
  const reply = String(formData.get("reply") ?? "").trim();
  const row = await cols.reviews.findById(reviewId);
  if (!row || row.photographerId !== profile.id) return;
  await cols.reviews.setById(reviewId, { reply });
  revalidatePath("/dashboard/reviews");
  revalidatePath(`/p/${profile.slug}`);
}

function touch(photographerId: string) {
  return cols.photographers.setById(photographerId, { lastActiveAt: new Date().toISOString() });
}
