"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { markAllRead } from "@/lib/notify";

export async function clearNotifications() {
  const user = await currentUser();
  if (!user) return;
  await markAllRead(user.id);
  revalidatePath("/notifications");
  revalidatePath("/");
}
