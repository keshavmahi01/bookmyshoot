"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { notify } from "@/lib/notify";

/** Who is allowed to read and write this thread. */
export async function threadAccess(enquiryId: string) {
  const user = await currentUser();
  if (!user) return null;

  const enquiry = await cols.enquiries.findById(enquiryId);
  if (!enquiry) return null;

  const profile = await cols.photographers.findById(enquiry.photographerId);
  if (!profile) return null;

  if (user.role === "PHOTOGRAPHER" && profile.userId === user.id) {
    return { user, enquiry, profile, role: "PHOTOGRAPHER" as const };
  }
  if (enquiry.userId && enquiry.userId === user.id) {
    return { user, enquiry, profile, role: "CUSTOMER" as const };
  }
  return null;
}

export async function sendMessage(formData: FormData) {
  const enquiryId = String(formData.get("enquiryId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  if (body.length > 2000) return;

  const access = await threadAccess(enquiryId);
  if (!access) return;

  await cols.messages.insertOne({
    id: newId("msg_"),
    enquiryId,
    senderUserId: access.user.id,
    senderRole: access.role,
    body,
    readAt: null,
    createdAt: new Date().toISOString(),
  });

  // Tell the other side.
  if (access.role === "CUSTOMER") {
    await notify(
      access.profile.userId,
      "MESSAGE",
      `New message from ${access.enquiry.customerName}`,
      body.slice(0, 90),
      `/messages/${enquiryId}`,
    );
  } else if (access.enquiry.userId) {
    await notify(
      access.enquiry.userId,
      "MESSAGE",
      `New message from ${access.profile.displayName}`,
      body.slice(0, 90),
      `/messages/${enquiryId}`,
    );
  }

  revalidatePath(`/messages/${enquiryId}`);
  revalidatePath("/dashboard");
  revalidatePath("/account");
}

export async function markThreadRead(enquiryId: string) {
  const access = await threadAccess(enquiryId);
  if (!access) return;
  await cols.messages.updateMany(
    { enquiryId, readAt: null, senderRole: { $ne: access.role } },
    { $set: { readAt: new Date().toISOString() } },
  );
}

export async function threadMessages(enquiryId: string) {
  return cols.messages.find({ enquiryId }, { sort: { createdAt: 1 } });
}

export async function customerName(userId: string | null) {
  if (!userId) return null;
  const user = await cols.users.findById(userId);
  return user?.name ?? null;
}
