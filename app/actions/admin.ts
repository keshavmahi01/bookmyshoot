"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import type { ProfileStatus, Verification } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { hashPassword } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { notify } from "@/lib/notify";

async function requireAdmin() {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

async function log(actor: string, action: string, target: string, reason = "") {
  await cols.adminLogs.insertOne({
    id: newId("log_"),
    actor,
    action,
    target,
    reason,
    createdAt: new Date().toISOString(),
  });
}

export async function setVerification(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const photographerId = String(formData.get("photographerId") ?? "");
  const level = String(formData.get("level") ?? "LISTED") as Verification;
  const reason = String(formData.get("reason") ?? "").trim();
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return;

  const note =
    level === "WORK_VERIFIED"
      ? "ID checked, original files of 3 shoots checked, 2 past clients spoken to."
      : level === "ID_VERIFIED"
        ? "Government ID matched with the profile name."
        : "";

  await cols.photographers.setById(photographerId, {
    verification: level,
    verifiedNote: note,
    verifiedAt: level === "LISTED" ? null : new Date().toISOString(),
  });

  await log(admin.name, `Set verification to ${level}`, profile.displayName, reason);
  revalidatePath("/admin");
  revalidatePath("/admin/verification");
  revalidatePath(`/p/${profile.slug}`);
}

export async function toggleListing(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const photographerId = String(formData.get("photographerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return;

  await cols.photographers.setById(photographerId, { active: !profile.active });
  await log(
    admin.name,
    profile.active ? "Paused listing" : "Restored listing",
    profile.displayName,
    reason,
  );
  revalidatePath("/admin/listings");
  revalidatePath(`/p/${profile.slug}`);
}

export async function hideReview(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const reviewId = String(formData.get("reviewId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) return; // a review is hidden only with a written reason
  const review = await cols.reviews.findById(reviewId);
  if (!review) return;

  await cols.reviews.setById(reviewId, {
    hidden: !review.hidden,
    hiddenReason: review.hidden ? null : reason,
  });
  await log(
    admin.name,
    review.hidden ? "Unhid review" : "Hid review",
    `${review.authorName} on ${review.photographerId}`,
    reason,
  );
  revalidatePath("/admin/reviews");
}

/** Approve or reject a new profile. Nothing is public until this is done. */
export async function decideProfile(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const photographerId = String(formData.get("photographerId") ?? "");
  const decision = String(formData.get("decision") ?? "") as ProfileStatus;
  const note = String(formData.get("note") ?? "").trim();
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return;
  if (decision !== "APPROVED" && decision !== "REJECTED" && decision !== "PENDING") return;
  if (decision === "REJECTED" && !note) return; // a rejection must say why

  await cols.photographers.setById(photographerId, {
    status: decision,
    reviewNote: note,
    reviewedAt: new Date().toISOString(),
  });

  await log(
    admin.name,
    decision === "APPROVED"
      ? "Approved profile"
      : decision === "REJECTED"
        ? "Rejected profile"
        : "Sent profile back to pending",
    profile.displayName,
    note,
  );

  await notify(
    profile.userId,
    "APPROVAL",
    decision === "APPROVED"
      ? "Your profile is approved and live"
      : decision === "REJECTED"
        ? "Your profile was not approved"
        : "Your profile is being looked at again",
    note,
    decision === "APPROVED" ? `/p/${profile.slug}` : "/dashboard",
  );
  revalidatePath("/admin");
  revalidatePath("/admin/approvals");
  revalidatePath("/search");
  revalidatePath(`/p/${profile.slug}`);
}

/** Remove a profile and everything that hangs off it. This cannot be undone. */
async function wipeProfile(photographerId: string) {
  const enquiryRows = await cols.enquiries.find({ photographerId });
  const enquiryIds = enquiryRows.map((e) => e.id);
  const bookingRows = await cols.bookings.find({ photographerId });

  await Promise.all([
    cols.rates.deleteMany({ photographerId }),
    cols.addOns.deleteMany({ photographerId }),
    cols.portfolio.deleteMany({ photographerId }),
    cols.reviews.deleteMany({ photographerId }),
    cols.bookings.deleteMany({ photographerId }),
    cols.enquiries.deleteMany({ photographerId }),
    enquiryIds.length
      ? cols.messages.deleteMany({ enquiryId: { $in: enquiryIds } })
      : Promise.resolve(0),
    bookingRows.length
      ? cols.reviews.deleteMany({ bookingId: { $in: bookingRows.map((b) => b.id) } })
      : Promise.resolve(0),
    cols.photographers.deleteById(photographerId),
  ]);
}

/** Delete one profile. The login that owns it goes too. */
export async function deleteProfile(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const photographerId = String(formData.get("photographerId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return;

  await wipeProfile(photographerId);
  await cols.notifications.deleteMany({ userId: profile.userId });
  await cols.users.deleteById(profile.userId);

  await log(admin.name, "Deleted profile", profile.displayName, reason);
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/approvals");
  revalidatePath("/search");
  revalidatePath("/");
}

/** Clear every profile and login the seed created, in one go. */
export async function deleteSampleData() {
  const admin = await requireAdmin();
  if (!admin) return;

  const samples = await cols.photographers.find({ sample: true });
  for (const profile of samples) await wipeProfile(profile.id);

  const sampleUsers = await cols.users.find({ sample: true });
  for (const user of sampleUsers) {
    if (user.id === admin.id) continue; // never delete the login you are using
    await cols.notifications.deleteMany({ userId: user.id });
    await cols.users.deleteById(user.id);
  }

  await log(
    admin.name,
    "Removed sample data",
    `${samples.length} profiles, ${sampleUsers.length} logins`,
    "",
  );
  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/search");
  revalidatePath("/");
}

/** Add another login that can open the admin panel. */
export async function addAdminUser(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!name || !email || !phone || password.length < 6) return;
  if (await cols.users.findOne({ email })) return;
  if (await cols.users.findOne({ phone })) return;

  await cols.users.insertOne({
    id: newId("usr_"),
    name,
    email,
    phone,
    passwordHash: hashPassword(password),
    role: "ADMIN",
    sample: false,
    createdAt: new Date().toISOString(),
  });
  await log(admin.name, "Added an admin", name, email);
  revalidatePath("/admin/team");
}

/** Delete an admin login. The last one and your own cannot go. */
export async function deleteAdminUser(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const id = String(formData.get("id") ?? "");
  if (id === admin.id) return;
  const target = await cols.users.findOne({ id, role: "ADMIN" });
  if (!target) return;
  const total = await cols.users.countDocuments({ role: "ADMIN" });
  if (total <= 1) return;

  await cols.notifications.deleteMany({ userId: id });
  await cols.users.deleteById(id);
  await log(admin.name, "Deleted an admin", target.name, target.email);
  revalidatePath("/admin/team");
}
