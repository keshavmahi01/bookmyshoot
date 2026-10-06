import "server-only";
import { cols } from "@/db/client";
import { newId } from "./ids";

export type NotificationKind = "LEAD" | "REPLY" | "MESSAGE" | "APPROVAL" | "REVIEW";

export async function notify(
  userId: string | null | undefined,
  kind: NotificationKind,
  title: string,
  body = "",
  link = "/",
) {
  if (!userId) return;
  await cols.notifications.insertOne({
    id: newId("ntf_"),
    userId,
    kind,
    title,
    body,
    link,
    readAt: null,
    createdAt: new Date().toISOString(),
  });
}

export function unreadCount(userId: string) {
  return cols.notifications.countDocuments({ userId, readAt: null });
}

export function listNotifications(userId: string, limit = 40) {
  return cols.notifications.find({ userId }, { sort: { createdAt: -1 }, limit });
}

export function markAllRead(userId: string) {
  return cols.notifications.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date().toISOString() } },
  );
}
