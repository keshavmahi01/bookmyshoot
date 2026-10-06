"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";
import { deleteImage, saveImage } from "@/lib/storage";
import { newId } from "@/lib/ids";

export type ContentState = { error?: string; ok?: string };

export async function uploadCategoryImage(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return { error: "Admins only." };

  const slug = String(formData.get("slug") ?? "");
  const category = await cols.categories.findOne({ slug });
  if (!category) return { error: "That shoot type was not found." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Please pick a photo." };

  const saved = await saveImage(file, "cover");
  if ("error" in saved) return { error: saved.error };

  await deleteImage(category.imagePath);
  await cols.categories.setById(category.id, { imagePath: saved.path });
  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor: user.name,
    action: "Changed shoot type picture",
    target: category.name,
    reason: "",
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/admin/content");
  return { ok: `${category.name} picture updated.` };
}

export async function clearCategoryImage(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;
  const slug = String(formData.get("slug") ?? "");
  const category = await cols.categories.findOne({ slug });
  if (!category) return;

  await deleteImage(category.imagePath);
  await cols.categories.setById(category.id, { imagePath: null });
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/admin/content");
}

/** Admin uploads a profile or cover photo on behalf of a photographer. */
export async function uploadProfilePhotoAsAdmin(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return { error: "Admins only." };

  const photographerId = String(formData.get("photographerId") ?? "");
  const kind = String(formData.get("kind") ?? "avatar") === "cover" ? "cover" : "avatar";
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return { error: "That profile was not found." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Please pick a photo." };

  const saved = await saveImage(file, kind);
  if ("error" in saved) return { error: saved.error };

  await deleteImage(kind === "avatar" ? profile.avatarPath : profile.coverPath);
  await cols.photographers.setById(
    profile.id,
    kind === "avatar" ? { avatarPath: saved.path } : { coverPath: saved.path },
  );
  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor: user.name,
    action: kind === "avatar" ? "Uploaded a profile photo" : "Uploaded a cover photo",
    target: profile.displayName,
    reason: "",
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath(`/p/${profile.slug}`);
  revalidatePath("/admin/content");
  return { ok: `${profile.displayName} updated.` };
}

/** Admin adds gallery photos for a photographer. */
export async function uploadGalleryAsAdmin(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return { error: "Admins only." };

  const photographerId = String(formData.get("photographerId") ?? "");
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return { error: "That profile was not found." };

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Please pick at least one photo." };
  if (files.length > 12) return { error: "Up to 12 photos at a time." };

  const title = String(formData.get("title") ?? "").trim() || "Shoot";
  const categorySlug = String(formData.get("categorySlug") ?? "wedding");
  const year = Number(String(formData.get("year") ?? new Date().getFullYear()));

  let position = await cols.portfolio.countDocuments({ photographerId: profile.id });
  let done = 0;

  for (const file of files) {
    const saved = await saveImage(file, "photo");
    if ("error" in saved) continue;
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

  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor: user.name,
    action: `Added ${done} gallery photos`,
    target: profile.displayName,
    reason: "",
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/p/${profile.slug}`);
  revalidatePath(`/admin/content/${profile.slug}`);
  if (done === 0) return { error: "None of those files could be read as images." };
  return { ok: `${done} photo${done === 1 ? "" : "s"} added.` };
}

export async function removeGalleryPhotoAsAdmin(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;

  const itemId = String(formData.get("itemId") ?? "");
  const item = await cols.portfolio.findById(itemId);
  if (!item) return;
  const profile = await cols.photographers.findById(item.photographerId);

  await deleteImage(item.imagePath);
  await cols.portfolio.deleteById(itemId);
  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor: user.name,
    action: "Removed a gallery photo",
    target: profile?.displayName ?? item.photographerId,
    reason: "",
    createdAt: new Date().toISOString(),
  });

  if (profile) revalidatePath(`/p/${profile.slug}`);
  revalidatePath(`/admin/content/${profile?.slug ?? ""}`);
}

/** Pictures that slide behind the search box on the home page. */
export async function uploadHeroImage(
  _prev: ContentState,
  formData: FormData,
): Promise<ContentState> {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return { error: "Admins only." };

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Please pick at least one picture." };
  if (files.length > 15) return { error: "Up to 15 pictures at a time." };

  let position = await cols.siteImages.countDocuments();
  let done = 0;

  for (const file of files) {
    const saved = await saveImage(file, "cover");
    if ("error" in saved) continue;
    await cols.siteImages.insertOne({
      id: newId("simg_"),
      slot: "HERO",
      imagePath: saved.path,
      caption: String(formData.get("caption") ?? "").trim(),
      position,
      active: true,
      createdAt: new Date().toISOString(),
    });
    position += 1;
    done += 1;
  }

  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor: user.name,
    action: `Added ${done} home page pictures`,
    target: "Home slideshow",
    reason: "",
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  if (done === 0) return { error: "None of those files could be read as images." };
  return { ok: `${done} picture${done === 1 ? "" : "s"} added to the home page.` };
}

export async function removeHeroImage(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;
  const id = String(formData.get("imageId") ?? "");
  const row = await cols.siteImages.findById(id);
  if (!row) return;

  await deleteImage(row.imagePath);
  await cols.siteImages.deleteById(id);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function moveHeroImage(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;
  const id = String(formData.get("imageId") ?? "");
  const direction = String(formData.get("direction") ?? "up");

  const all = await cols.siteImages.find({}, { sort: { position: 1 } });
  const index = all.findIndex((r) => r.id === id);
  if (index < 0) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= all.length) return;

  await cols.siteImages.setById(all[index].id, { position: all[swapWith].position });
  await cols.siteImages.setById(all[swapWith].id, { position: all[index].position });

  revalidatePath("/");
  revalidatePath("/admin/content");
}

/** Whether a profile shows in the slider under the hero. */
export async function toggleFeatured(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;
  const photographerId = String(formData.get("photographerId") ?? "");
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return;

  await cols.photographers.setById(profile.id, { featured: !profile.featured });
  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor: user.name,
    action: profile.featured ? "Removed from the home slider" : "Added to the home slider",
    target: profile.displayName,
    reason: "",
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
  revalidatePath("/admin/listings");
}
