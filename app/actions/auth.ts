"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cols } from "@/db/client";
import { blankPhotographer } from "@/db/defaults";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { newId, slugify } from "@/lib/ids";

export type FormState = { error?: string; ok?: boolean };

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please fill both fields." };

  const user = await cols.users.findOne({ email });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That email and password do not match any account." };
  }
  await createSession(user.id);
  redirect(
    user.role === "ADMIN" ? "/admin" : user.role === "PHOTOGRAPHER" ? "/dashboard" : "/account",
  );
}

export async function logout() {
  await destroySession();
  revalidatePath("/");
  redirect("/");
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "CUSTOMER");
  const cityId = String(formData.get("cityId") ?? "");
  const ref = String(formData.get("ref") ?? "").trim().slice(0, 80);

  if (!name || !email || !phone || !password) return { error: "Please fill every field." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (!/^[6-9]\d{9}$/.test(phone)) return { error: "Please enter a 10 digit Indian mobile number." };

  if (await cols.users.findOne({ email })) {
    return { error: "An account with this email already exists." };
  }
  if (await cols.users.findOne({ phone })) {
    return { error: "An account with this phone number already exists." };
  }
  if (role === "PHOTOGRAPHER" && !cityId) return { error: "Please pick your base city." };

  const userId = newId("usr_");
  await cols.users.insertOne({
    id: userId,
    name,
    email,
    phone,
    passwordHash: hashPassword(password),
    role: role === "PHOTOGRAPHER" ? "PHOTOGRAPHER" : "CUSTOMER",
    sample: false,
    createdAt: new Date().toISOString(),
  });

  if (role === "PHOTOGRAPHER") {
    let slug = slugify(name);
    if (await cols.photographers.findOne({ slug })) {
      slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
    }
    const inviter = ref ? await cols.photographers.findOne({ slug: ref }) : null;
    await cols.photographers.insertOne(
      blankPhotographer({
        id: newId("pho_"),
        slug,
        userId,
        displayName: name,
        cityId,
        referredBy: inviter ? ref : "",
      }),
    );
  }

  await createSession(userId);
  redirect(role === "PHOTOGRAPHER" ? "/dashboard" : "/account");
}
