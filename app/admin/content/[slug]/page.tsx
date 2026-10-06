import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Photo } from "@/components/photo";
import { Notice } from "@/components/ui";
import { getCategories, getPhotographerBySlug } from "@/lib/queries";
import { removeGalleryPhotoAsAdmin } from "@/app/actions/content";
import { placeLine } from "@/lib/format";
import GalleryForm from "./gallery-form";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage({ params }: Props) {
  const { slug } = await params;
  const detail = await getPhotographerBySlug(slug);
  if (!detail) notFound();

  const categories = await getCategories();
  const photos = detail.portfolio.filter((p) => p.kind === "PHOTO");

  return (
    <div className="space-y-5">
      <Link href="/admin/content" className="text-sm font-semibold text-brand hover:underline">
        Back to pictures
      </Link>

      <div className="card flex flex-wrap items-center gap-3 p-4">
        <Avatar src={detail.profile.avatarPath} name={detail.profile.displayName} size={48} />
        <div className="min-w-0">
          <p className="font-bold">{detail.profile.displayName}</p>
          <p className="text-sm text-ink-soft">{placeLine(detail.city)}</p>
        </div>
        <Link href={`/p/${detail.profile.slug}`} className="btn btn-ghost ml-auto">
          Open the public profile
        </Link>
      </div>

      <Notice tone="info">
        Only add photos the photographer has given you. Everything you do here is written to the
        action log with your name.
      </Notice>

      <section className="card p-5">
        <h2 className="font-bold">Add photos</h2>
        <p className="mb-4 text-sm text-ink-soft">
          {photos.length} photos in this gallery right now.
        </p>
        <GalleryForm
          photographerId={detail.profile.id}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        />
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Current gallery</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {photos.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border border-line">
              <Photo
                imagePath={item.imagePath}
                seed={item.seed}
                label={item.imagePath ? undefined : item.title}
                alt={item.title}
                w={400}
                h={300}
                className="h-24 w-full object-cover"
              />
              <form
                action={removeGalleryPhotoAsAdmin}
                className="absolute inset-x-0 bottom-0 translate-y-full bg-black/65 transition group-hover:translate-y-0"
              >
                <input suppressHydrationWarning type="hidden" name="itemId" value={item.id} />
                <button suppressHydrationWarning type="submit" className="w-full py-1.5 text-xs font-semibold text-white">
                  Remove
                </button>
              </form>
            </div>
          ))}
          {photos.length === 0 ? (
            <p className="col-span-full text-sm text-ink-faint">No photos yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
