"use client";

import { useState } from "react";

type Item = {
  id: string;
  title: string;
  seed: string;
  year: number;
  kind: string;
  imagePath: string | null;
  videoUrl: string | null;
};

const src = (item: Item, w: number, h: number) =>
  item.imagePath ??
  `/api/img/${encodeURIComponent(item.seed)}?w=${w}&h=${h}&label=${encodeURIComponent(item.title)}`;

export default function Gallery({ items, name }: { items: Item[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const photos = items.filter((i) => i.kind === "PHOTO");

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((item, index) => (
          <button suppressHydrationWarning
            key={item.id}
            type="button"
            onClick={() => setOpen(index)}
            className="group relative overflow-hidden rounded-lg border border-line"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(item, 600, 450)}
              alt={`${item.title} by ${name}`}
              className="h-32 w-full object-cover transition group-hover:scale-[1.03] sm:h-40"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {open !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
        >
          <div className="max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src(photos[open], 1200, 800)}
              alt={photos[open].title}
              className="max-h-[75vh] w-full rounded-lg object-contain"
            />
            <div className="mt-3 flex items-center justify-between text-sm text-white">
              <span>
                {photos[open].title} &middot; {photos[open].year}
              </span>
              <div className="flex gap-2">
                <button suppressHydrationWarning
                  type="button"
                  className="rounded border border-white/40 px-3 py-1"
                  onClick={() => setOpen((open - 1 + photos.length) % photos.length)}
                >
                  Previous
                </button>
                <button suppressHydrationWarning
                  type="button"
                  className="rounded border border-white/40 px-3 py-1"
                  onClick={() => setOpen((open + 1) % photos.length)}
                >
                  Next
                </button>
                <button suppressHydrationWarning
                  type="button"
                  className="rounded border border-white/40 px-3 py-1"
                  onClick={() => setOpen(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
