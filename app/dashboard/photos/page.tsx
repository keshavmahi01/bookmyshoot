import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Avatar, Photo } from "@/components/photo";
import { Notice } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { getCategories, getPhotographerByUserId } from "@/lib/queries";
import { removeWorkPhoto, saveVideoLink } from "@/app/actions/photos";
import { AvatarForm, CoverForm, WorkForm } from "./photo-forms";

export const metadata: Metadata = { title: "Photos" };

export default async function PhotosPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const detail = await getPhotographerByUserId(user.id);
  if (!detail) redirect("/");

  const categories = await getCategories();
  const photos = detail.portfolio.filter((p) => p.kind === "PHOTO");
  const film = detail.portfolio.find((p) => p.kind === "VIDEO");

  return (
    <div className="space-y-6">
      <Notice tone="info">
        Upload only your own work. A customer can report a photo, and three valid copyright reports
        drop the profile back to the unverified level.
      </Notice>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-bold">Profile photo</h2>
          <p className="mb-4 text-sm text-ink-soft">
            One photo of you or your studio logo. This is what shows on search cards and on your
            profile.
          </p>
          <div className="mb-4 flex items-center gap-4">
            <Avatar src={detail.profile.avatarPath} name={detail.profile.displayName} size={88} />
            <p className="text-sm text-ink-faint">
              {detail.profile.avatarPath ? "Current photo" : "No photo yet, we show your initials"}
            </p>
          </div>
          <AvatarForm />
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Cover photo</h2>
          <p className="mb-4 text-sm text-ink-soft">
            The wide photo at the top of your profile. Pick your single best frame.
          </p>
          <Photo
            imagePath={detail.profile.coverPath}
            seed={`${detail.profile.slug}-cover`}
            label={detail.profile.displayName}
            alt="Current cover"
            w={900}
            h={300}
            className="mb-4 h-32 w-full rounded-lg border border-line object-cover"
          />
          <CoverForm />
        </section>
      </div>

      <section className="card p-5">
        <h2 className="font-bold">Your work</h2>
        <p className="mb-4 text-sm text-ink-soft">
          {photos.length} photos in your gallery. Ten or more is where enquiries start coming.
        </p>
        <WorkForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {photos.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg border border-line">
              <Photo
                imagePath={item.imagePath}
                seed={item.seed}
                label={item.title}
                alt={item.title}
                w={400}
                h={300}
                className="h-24 w-full object-cover"
              />
              <form
                action={removeWorkPhoto}
                className="absolute inset-x-0 bottom-0 translate-y-full bg-black/65 transition group-hover:translate-y-0"
              >
                <input suppressHydrationWarning type="hidden" name="itemId" value={item.id} />
                <button suppressHydrationWarning type="submit" className="w-full py-1.5 text-xs font-semibold text-white">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold">Highlight film</h2>
        <p className="mb-4 text-sm text-ink-soft">
          Paste one YouTube, Vimeo or Instagram link. Leave it empty to remove the film.
        </p>
        <form action={saveVideoLink} className="flex flex-wrap items-end gap-2">
          <div className="min-w-64 flex-1">
            <label className="field-label" htmlFor="videoUrl">Film link</label>
            <input suppressHydrationWarning
              id="videoUrl"
              name="videoUrl"
              className="field"
              defaultValue={film?.videoUrl ?? ""}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <button suppressHydrationWarning className="btn btn-ghost" type="submit">Save link</button>
        </form>
      </section>
    </div>
  );
}
