"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

const KEY = "bms-last-city";
const EVENT = "bms-last-city-change";

let cachedRaw = "";
let cached: { slug: string; name: string } | null = null;

function read() {
  try {
    const raw = window.localStorage.getItem(KEY) ?? "";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cached = raw ? JSON.parse(raw) : null;
    }
    return cached;
  } catch {
    return cached;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Saves the city someone searched, so the next visit starts there. */
export function RememberCity({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    if (!slug || !name) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ slug, name }));
      window.dispatchEvent(new Event(EVENT));
    } catch {
      // private window, nothing to remember with
    }
  }, [slug, name]);
  return null;
}

/** Shows a one tap link back to the city they searched last time. */
export function LastCityChip() {
  const city = useSyncExternalStore(subscribe, read, () => null);
  if (!city) return null;

  return (
    <Link
      href={`/search?city=${city.slug}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft transition hover:border-brand hover:text-brand"
    >
      <svg width="13" height="13" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M10 1.5a5.8 5.8 0 0 0-5.8 5.8c0 4.2 5.1 10.5 5.3 10.8a.7.7 0 0 0 1 0c.2-.3 5.3-6.6 5.3-10.8A5.8 5.8 0 0 0 10 1.5zm0 8a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"
          fill="currentColor"
        />
      </svg>
      Back to {city.name}
    </Link>
  );
}
