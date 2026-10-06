/**
 * The shortlist lives in the browser, so nobody has to log in to compare.
 * It holds up to three profile slugs.
 */

export const SHORTLIST_KEY = "bms-shortlist";
export const SHORTLIST_EVENT = "bms-shortlist-change";
export const SHORTLIST_MAX = 3;

// useSyncExternalStore needs the same array back when nothing changed, on the
// server as well as in the browser. A fresh [] every call makes React loop.
const EMPTY: string[] = [];
let cachedRaw = "[]";
let cached: string[] = EMPTY;

export function readShortlist(): string[] {
  try {
    const raw = window.localStorage.getItem(SHORTLIST_KEY) ?? "[]";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed = JSON.parse(raw);
      cached = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
    }
    return cached;
  } catch {
    return cached;
  }
}

export function serverShortlist(): string[] {
  return EMPTY;
}

export function subscribeShortlist(onChange: () => void) {
  window.addEventListener(SHORTLIST_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SHORTLIST_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Returns a message when the list is already full, otherwise an empty string. */
export function toggleShortlist(slug: string) {
  const list = readShortlist();
  let next: string[];
  if (list.includes(slug)) {
    next = list.filter((s) => s !== slug);
  } else {
    if (list.length >= SHORTLIST_MAX) {
      return `You can compare ${SHORTLIST_MAX} at a time. Remove one first.`;
    }
    next = [...list, slug];
  }
  try {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(next));
  } catch {
    // private window, the shortlist just will not be remembered
  }
  window.dispatchEvent(new Event(SHORTLIST_EVENT));
  return "";
}

export function clearShortlist() {
  try {
    window.localStorage.setItem(SHORTLIST_KEY, "[]");
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(SHORTLIST_EVENT));
}
