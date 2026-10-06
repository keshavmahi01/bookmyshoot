/**
 * People type their social accounts in every possible way: a handle, a handle
 * with an @, a full link, a link with tracking junk on the end. These helpers
 * turn whatever they typed into one clean link, and show it back as a handle.
 */

export type SocialKind = "instagram" | "facebook" | "youtube" | "website";

const HOSTS: Record<Exclude<SocialKind, "website">, string> = {
  instagram: "instagram.com",
  facebook: "facebook.com",
  youtube: "youtube.com",
};

export function cleanSocial(kind: SocialKind, raw: string) {
  const value = raw.trim();
  if (!value) return "";

  if (kind === "website") {
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      return new URL(url).toString();
    } catch {
      return "";
    }
  }

  const host = HOSTS[kind];

  // Already a link
  if (/^https?:\/\//i.test(value) || value.includes(`${host}/`)) {
    const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.endsWith(host.replace("www.", ""))) return "";
      parsed.search = "";
      parsed.hash = "";
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  // A plain handle
  const handle = value.replace(/^@/, "").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9._-]{2,60}$/.test(handle)) return "";
  if (kind === "youtube") return `https://youtube.com/@${handle}`;
  return `https://${host}/${handle}`;
}

export function socialLabel(kind: SocialKind, url: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (kind === "website") return parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
    return path.startsWith("@") ? path : `@${path}`;
  } catch {
    return url;
  }
}

export const SOCIAL_FIELDS: {
  key: SocialKind;
  label: string;
  hint: string;
}[] = [
  { key: "instagram", label: "Instagram", hint: "@yourname or the full link" },
  { key: "facebook", label: "Facebook page", hint: "page name or the full link" },
  { key: "youtube", label: "YouTube", hint: "@channel or the full link" },
  { key: "website", label: "Your website", hint: "yourstudio.in" },
];
