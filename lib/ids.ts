import { randomBytes } from "node:crypto";

export function newId(prefix = "") {
  return prefix + randomBytes(9).toString("base64url");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
