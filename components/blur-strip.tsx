import { Photo } from "./photo";
import type { Category } from "@/db/schema";

/**
 * Blurred pictures of every shoot type, sliding slowly behind the search box.
 * Decoration only, so it is hidden from screen readers and ignores the mouse.
 */
export default function BlurStrip({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  const row = [...categories, ...categories];

  return (
    <div aria-hidden="true" className="blur-strip pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-10 flex gap-4 marquee-left">
        {row.map((cat, i) => (
          <figure key={`a-${cat.id}-${i}`} className="h-40 w-64 shrink-0 overflow-hidden rounded-2xl">
            <Photo
              imagePath={cat.imagePath}
              seed={`cat-${cat.slug}`}
              alt=""
              w={420}
              h={280}
              className="h-full w-full object-cover"
            />
          </figure>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-10 flex gap-4 marquee-right">
        {row.map((cat, i) => (
          <figure key={`b-${cat.id}-${i}`} className="h-40 w-64 shrink-0 overflow-hidden rounded-2xl">
            <Photo
              imagePath={cat.imagePath}
              seed={`cat-${cat.slug}-alt`}
              alt=""
              w={420}
              h={280}
              className="h-full w-full object-cover"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
