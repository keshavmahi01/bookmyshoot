"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";
import { deleteImage, saveImage } from "@/lib/storage";
import { newId } from "@/lib/ids";

export type PhotoState = { error?: string; ok?: string };

async function ownProfile() {
  const user = await currentUser();
  if (!user || user.role !== "PHOTOGRAPHER") return null;
  return cols.photographers.findOne({ userId: user.id });
}

export async function uploadAvatar(_prev: PhotoState, formData: FormData): Promise<PhotoState> {
  const profile = await ownProfile();
  if (!profile) return { error: "Please log in again." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Please pick a photo." };
  const saved = await saveImage(file, "avatar");
  if ("error" in saved) return { error: saved.error };

  await deleteImage(profile.avatarPath);
  await cols.photographers.setById(profile.id, {
    avatarPath: saved.path,
    lastActiveAt: new Date().toISOString(),
  });

  revalidatePath("/dashboard/photos");
  revalidatePath(`/p/${profile.slug}`);
  return { ok: "Profile photo updated." };
}

export async function uploadCover(_prev: PhotoState, formData: FormData): Promise<PhotoState> {
  const profile = await ownProfile();
  if (!profile) return { error: "Please log in again." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Please pick a photo." };
  const saved = await saveImage(file, "cover");
  if ("error" in saved) return { error: saved.error };

  await deleteImage(profile.coverPath);
  await cols.photographers.setById(profile.id, {
    coverPath: saved.path,
    lastActiveAt: new Date().toISOString(),
  });

  revalidatePath("/dashboard/photos");
  revalidatePath(`/p/${profile.slug}`);
  return { ok: "Cover photo updated." };
}

export async function uploadWork(_prev: PhotoState, formData: FormData): Promise<PhotoState> {
  const profile = await ownProfile();
  if (!profile) return { error: "Please log in again." };

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Please pick at least one photo." };
  if (files.length > 12) return { error: "Please upload up to 12 photos at a time." };

  const title = String(formData.get("title") ?? "").trim() || "Shoot";
  const categorySlug = String(formData.get("categorySlug") ?? "wedding");
  const year = Number(String(formData.get("year") ?? new Date().getFullYear()));

  let position = await cols.portfolio.countDocuments({ photographerId: profile.id });
  let done = 0;
  let failed = 0;

  for (const file of files) {
    const saved = await saveImage(file, "photo");
    if ("error" in saved) {
      failed += 1;
      continue;
    }
    await cols.portfolio.insertOne({
      id: newId("port_"),
      photographerId: profile.id,
      kind: "PHOTO",
      title,
      categorySlug,
      year: Number.isFinite(year) ? year : new Date().getFullYear(),
      seed: `${profile.slug}-${position}`,
      imagePath: saved.path,
      videoUrl: null,
      position,
    });
    position += 1;
    done += 1;
  }

  await cols.photographers.setById(profile.id, { lastActiveAt: new Date().toISOString() });

  revalidatePath("/dashboard/photos");
  revalidatePath(`/p/${profile.slug}`);
  if (done === 0) return { error: "None of those files could be read as images." };
  return { ok: `${done} photo${done === 1 ? "" : "s"} added${failed ? `, ${failed} skipped` : ""}.` };
}

export async function removeWorkPhoto(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const itemId = String(formData.get("itemId") ?? "");
  const item = await cols.portfolio.findById(itemId);
  if (!item || item.photographerId !== profile.id) return;

  await deleteImage(item.imagePath);
  await cols.portfolio.deleteById(itemId);
  revalidatePath("/dashboard/photos");
  revalidatePath(`/p/${profile.slug}`);
}

export async function saveVideoLink(formData: FormData) {
  const profile = await ownProfile();
  if (!profile) return;
  const url = String(formData.get("videoUrl") ?? "").trim();

  const existing = await cols.portfolio.findOne({ photographerId: profile.id, kind: "VIDEO" });

  if (!url) {
    if (existing) await cols.portfolio.deleteById(existing.id);
  } else if (existing) {
    await cols.portfolio.setById(existing.id, { videoUrl: url });
  } else {
    await cols.portfolio.insertOne({
      id: newId("port_"),
      photographerId: profile.id,
      kind: "VIDEO",
      title: "Highlight film",
      categorySlug: "wedding",
      year: new Date().getFullYear(),
      seed: `${profile.slug}-film`,
      imagePath: null,
      videoUrl: url,
      position: 999,
    });
  }
  revalidatePath("/dashboard/photos");
  revalidatePath(`/p/${profile.slug}`);
}
