import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cols } from "@/db/client";

const COOKIE = "bookmyshoot_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-secret-change-me";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export async function createSession(userId: string) {
  const token = `${userId}.${sign(userId)}`;
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function currentUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const [userId, signature] = token.split(".");
  if (!userId || !signature || sign(userId) !== signature) return null;
  return cols.users.findById(userId);
}

export async function requireUser(role?: "CUSTOMER" | "PHOTOGRAPHER" | "ADMIN") {
  const user = await currentUser();
  if (!user) return null;
  if (role && user.role !== role) return null;
  return user;
}
