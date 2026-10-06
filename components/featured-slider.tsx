"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function FeaturedSlider({ children }: { children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (paused.current) return;
      const card = node.querySelector<HTMLElement>("[data-card]");
      const step = card ? card.offsetWidth + 16 : 320;
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      node.scrollTo({ left: atEnd ? 0 : node.scrollLeft + step, behavior: "smooth" });
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  const nudge = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    node.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={track}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onFocusCapture={() => (paused.current = true)}
        onBlurCapture={() => (paused.current = false)}
        className="slider-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
      >
        {children}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Link href="/search" className="text-sm font-semibold text-brand hover:underline">
          See everyone
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Previous"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-brand hover:text-brand"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M12.5 4L7 10l5.5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Next"
            className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-brand hover:text-brand"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7.5 4L13 10l-5.5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
