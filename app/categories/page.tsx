import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, searchPhotographers } from "@/lib/queries";
import { Photo } from "@/components/photo";

export const metadata: Metadata = {
  title: "Shoot types",
  description: "Every kind of shoot you can book on BookMyShoot, from weddings to product catalogues.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const matches = await Promise.all(
    categories.map((cat) => searchPhotographers({ category: cat.slug })),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">What kind of shoot do you need?</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Each profile lists only the work it actually does, so the counts below are real.
      </p>

      <div className="mt-8 grid gap-3 animate-rise sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, index) => {
          const count = matches[index].length;
          return (
            <Link
              key={cat.id}
              href={`/search?category=${cat.slug}`}
              className="card lift group overflow-hidden"
            >
              <Photo
                imagePath={cat.imagePath}
                seed={`cat-${cat.slug}`}
                label={cat.imagePath ? undefined : cat.name}
                alt={cat.name}
                w={600}
                h={220}
                className="h-28 w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="p-4">
                <p className="font-semibold group-hover:text-brand">{cat.name}</p>
                <p className="mt-1 text-sm text-ink-soft">{cat.description}</p>
                <p className="mt-2 text-xs text-ink-faint">{count} profiles</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
