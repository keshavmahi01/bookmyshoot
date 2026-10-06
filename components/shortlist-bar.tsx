"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  clearShortlist,
  readShortlist,
  serverShortlist,
  subscribeShortlist,
  SHORTLIST_MAX,
} from "@/lib/shortlist";

export default function ShortlistBar() {
  const list = useSyncExternalStore(subscribeShortlist, readShortlist, serverShortlist);
  if (list.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <p className="text-sm">
          <strong>{list.length}</strong> of {SHORTLIST_MAX} shortlisted
        </p>
        <button
          type="button"
          onClick={clearShortlist}
          className="text-sm text-ink-faint underline hover:text-ink"
        >
          Clear
        </button>
        <Link href={`/compare?ids=${list.join(",")}`} className="btn btn-primary ml-auto">
          {list.length === 1 ? "Open profile" : "Compare side by side"}
        </Link>
      </div>
    </div>
  );
}
