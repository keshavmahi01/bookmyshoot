"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";
import { notify } from "@/lib/notify";

export type EnquiryState = { error?: string; ok?: boolean };

export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const photographerId = String(formData.get("photographerId") ?? "");
  const profile = await cols.photographers.findById(photographerId);
  if (!profile) return { error: "That profile is no longer available." };

  // Honeypot: a field no real person sees. A bot fills it in.
  if (String(formData.get("company") ?? "").trim()) {
    return { ok: true };
  }

  // A form filled in under three seconds was not filled by a human.
  const openedAt = Number(String(formData.get("openedAt") ?? "0"));
  if (openedAt && Date.now() - openedAt < 3000) {
    return { error: "That was quick. Please check the details and send again." };
  }

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "");
  const eventType = String(formData.get("eventType") ?? "").trim();
  const cityName = String(formData.get("cityName") ?? "").trim();

  if (!customerName || !customerPhone || !eventDate || !eventType || !cityName) {
    return { error: "Please fill your name, phone, date, shoot type and city." };
  }
  if (!/^[6-9]\d{9}$/.test(customerPhone)) {
    return { error: "Please enter a 10 digit Indian mobile number." };
  }

  // Rate limit, by phone number.
  const now = Date.now();
  const recent = await cols.enquiries.find({ customerPhone });
  const lastHour = recent.filter((e) => now - new Date(e.createdAt).getTime() < 60 * 60 * 1000);
  if (lastHour.length >= 6) {
    return {
      error: "You have sent a lot of requests in the last hour. Please wait a while before sending more.",
    };
  }
  const toSamePerson = recent.filter(
    (e) =>
      e.photographerId === photographerId &&
      now - new Date(e.createdAt).getTime() < 24 * 60 * 60 * 1000,
  );
  if (toSamePerson.length >= 2) {
    return {
      error: "You have already sent this photographer a request today. He can see it, give him a little time.",
    };
  }

  const user = await currentUser();
  const budgetRaw = String(formData.get("budget") ?? "").trim();
  const hoursRaw = String(formData.get("hours") ?? "").trim();

  await cols.enquiries.insertOne({
    id: newId("enq_"),
    photographerId,
    userId: user?.id ?? null,
    customerName,
    customerPhone,
    customerEmail: String(formData.get("customerEmail") ?? "").trim(),
    eventDate,
    endDate: String(formData.get("endDate") ?? "") || null,
    eventType,
    rateType: String(formData.get("rateType") ?? "PACKAGE"),
    hours: hoursRaw ? Number(hoursRaw) : null,
    cityName,
    venue: String(formData.get("venue") ?? "").trim(),
    budget: budgetRaw ? Number(budgetRaw) : null,
    message: String(formData.get("message") ?? "").trim(),
    status: "NEW",
    quoteAmount: null,
    quoteNote: "",
    respondedAt: null,
    createdAt: new Date().toISOString(),
  });

  await notify(
    profile.userId,
    "LEAD",
    `New booking request from ${customerName}`,
    `${eventType} on ${eventDate} in ${cityName}`,
    "/dashboard",
  );

  revalidatePath(`/p/${profile.slug}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Photographer accepts an enquiry: the date gets blocked and a booking is created. */
export async function acceptEnquiry(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "PHOTOGRAPHER") return;
  const profile = await cols.photographers.findOne({ userId: user.id });
  if (!profile) return;

  const enquiryId = String(formData.get("enquiryId") ?? "");
  const quoteAmount = String(formData.get("quoteAmount") ?? "").trim();
  const quoteNote = String(formData.get("quoteNote") ?? "").trim();

  const enquiry = await cols.enquiries.findById(enquiryId);
  if (!enquiry || enquiry.photographerId !== profile.id) return;

  await cols.enquiries.setById(enquiryId, {
    status: "ACCEPTED",
    quoteAmount: quoteAmount ? Number(quoteAmount) : null,
    quoteNote,
    respondedAt: new Date().toISOString(),
  });

  const existing = await cols.bookings.findOne({ enquiryId });
  if (!existing) {
    await cols.bookings.insertOne({
      id: newId("bok_"),
      enquiryId,
      photographerId: profile.id,
      eventDate: enquiry.eventDate,
      amountAgreed: quoteAmount ? Number(quoteAmount) : null,
      status: "CONFIRMED",
      completedAt: null,
      createdAt: new Date().toISOString(),
    });
  }

  // Busy dates live inside the profile document.
  const blocked = profile.blocked.some((b) => b.date === enquiry.eventDate);
  if (!blocked) {
    await cols.photographers.updateById(profile.id, {
      $push: {
        blocked: {
          date: enquiry.eventDate,
          status: "BUSY",
          note: `Booked, ${enquiry.customerName}`,
        },
      },
    });
  }

  await notify(
    enquiry.userId,
    "REPLY",
    `${profile.displayName} accepted your request`,
    quoteAmount ? `Quote: ${quoteAmount}` : "Open the chat to agree the details",
    `/messages/${enquiryId}`,
  );

  revalidatePath("/dashboard");
  revalidatePath("/account");
  revalidatePath(`/p/${profile.slug}`);
}

export async function declineEnquiry(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "PHOTOGRAPHER") return;
  const profile = await cols.photographers.findOne({ userId: user.id });
  if (!profile) return;

  const enquiryId = String(formData.get("enquiryId") ?? "");
  const enquiry = await cols.enquiries.findById(enquiryId);
  if (!enquiry || enquiry.photographerId !== profile.id) return;

  await cols.enquiries.setById(enquiryId, {
    status: "DECLINED",
    respondedAt: new Date().toISOString(),
  });

  await notify(
    enquiry.userId,
    "REPLY",
    `${profile.displayName} is not free for your date`,
    "Try someone else who is free that day",
    "/search",
  );

  revalidatePath("/dashboard");
  revalidatePath("/account");
}

export async function markBookingComplete(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "PHOTOGRAPHER") return;
  const profile = await cols.photographers.findOne({ userId: user.id });
  if (!profile) return;

  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await cols.bookings.findById(bookingId);
  if (!booking || booking.photographerId !== profile.id) return;

  await cols.bookings.setById(bookingId, {
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
  });
  await cols.photographers.updateById(profile.id, { $inc: { jobsCompleted: 1 } });
  revalidatePath("/dashboard");
}

/** Only a customer whose booking is marked complete can leave a review. */
export async function leaveReview(formData: FormData) {
  const user = await currentUser();
  if (!user) return;

  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await cols.bookings.findById(bookingId);
  if (!booking || booking.status !== "COMPLETED") return;

  const enquiry = await cols.enquiries.findById(booking.enquiryId);
  if (!enquiry || enquiry.userId !== user.id) return;
  if (await cols.reviews.findOne({ bookingId })) return;

  const score = (key: string) => Math.max(1, Math.min(5, Number(formData.get(key) ?? 5)));

  await cols.reviews.insertOne({
    id: newId("rev_"),
    bookingId,
    photographerId: booking.photographerId,
    authorName: user.name,
    quality: score("quality"),
    punctuality: score("punctuality"),
    delivery: score("delivery"),
    value: score("value"),
    communication: score("communication"),
    comment: String(formData.get("comment") ?? "").trim(),
    reply: null,
    hidden: false,
    hiddenReason: null,
    createdAt: new Date().toISOString(),
  });

  const profile = await cols.photographers.findById(booking.photographerId);
  if (profile) {
    await notify(
      profile.userId,
      "REVIEW",
      `${user.name} left you a review`,
      "",
      "/dashboard/reviews",
    );
    revalidatePath(`/p/${profile.slug}`);
  }
  revalidatePath("/account");
}
