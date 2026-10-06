"use client";

import { useState, useSyncExternalStore } from "react";
import {
  readShortlist,
  serverShortlist,
  subscribeShortlist,
  toggleShortlist,
} from "@/lib/shortlist";

export default function ShortlistButton({ slug }: { slug: string }) {
  const list = useSyncExternalStore(subscribeShortlist, readShortlist, serverShortlist);
  const [problem, setProblem] = useState("");
  const saved = list.includes(slug);

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setProblem(toggleShortlist(slug))}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
          saved
            ? "border-brand bg-brand-soft text-brand-deep"
            : "border-line bg-surface text-ink-soft hover:border-brand hover:text-brand"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M5 2.5h10a1 1 0 0 1 1 1v14l-6-3.4-6 3.4v-14a1 1 0 0 1 1-1z"
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {saved ? "Shortlisted" : "Shortlist"}
      </button>
      {problem ? <span className="mt-1 text-xs text-brand">{problem}</span> : null}
    </span>
  );
}
