"use server";

import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import { currentUser } from "@/lib/auth";
import { newId } from "@/lib/ids";

export type SuggestionState = { error?: string; ok?: boolean };

export async function sendSuggestion(
  _prev: SuggestionState,
  formData: FormData,
): Promise<SuggestionState> {
  // Hidden field, only a bot fills it in.
  if (String(formData.get("company") ?? "").trim()) return { ok: true };

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 5) return { error: "Please write a line or two." };
  if (body.length > 1200) return { error: "Please keep it under 1200 characters." };

  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const lastHour = await cols.suggestions.countDocuments({ createdAt: { $gte: anHourAgo } });
  if (lastHour > 60) return { error: "Too many just now. Please try again later." };

  await cols.suggestions.insertOne({
    id: newId("sug_"),
    name: String(formData.get("name") ?? "").trim().slice(0, 80),
    contact: String(formData.get("contact") ?? "").trim().slice(0, 120),
    body,
    handled: false,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/admin/suggestions");
  return { ok: true };
}

export async function markSuggestionHandled(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;
  const id = String(formData.get("id") ?? "");
  const row = await cols.suggestions.findById(id);
  if (!row) return;
  await cols.suggestions.setById(id, { handled: !row.handled });
  revalidatePath("/admin/suggestions");
}

export async function deleteSuggestion(formData: FormData) {
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return;
  await cols.suggestions.deleteById(String(formData.get("id") ?? ""));
  revalidatePath("/admin/suggestions");
}
