import type { Metadata } from "next";
import { Photo } from "@/components/photo";
import { Notice } from "@/components/ui";
import Link from "next/link";
import { Avatar } from "@/components/photo";
import { adminOverview, allHeroImages, featuredProfiles, getCategories } from "@/lib/queries";
import { clearCategoryImage, moveHeroImage, removeHeroImage, toggleFeatured } from "@/app/actions/content";
import CategoryImageForm from "./category-form";
import HeroForm from "./hero-form";
import ProfilePhotoForm from "./profile-photo-form";

export const metadata: Metadata = { title: "Pictures" };

export default async function ContentPage() {
  const categories = await getCategories();
  const profiles = (await adminOverview()).profiles;
  const hero = await allHeroImages();
  const featured = await featuredProfiles(20);
  const live = profiles.filter((p) => p.profile.status === "APPROVED" && p.profile.active);
  const missing = profiles.filter((p) => !p.profile.avatarPath || !p.profile.coverPath);

  return (
    <div className="space-y-5">
      <Notice tone="info">
        These pictures show on the home page and on the shoot types page. Use a wide photo you own,
        or one you have bought a licence for. Do not pull photos off Google images.
      </Notice>

      <h2 className="font-bold">Home page slideshow</h2>
      <p className="text-sm text-ink-soft">
        These slide behind the booking box at the top of the home page. Ten to fifteen wide photos
        work best. Until you add any, the site shows plain generated pictures.
      </p>

      <div className="card p-5">
        <HeroForm />
      </div>

      {hero.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {hero.map((row, index) => (
            <div key={row.id} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.imagePath} alt="" className="h-24 w-full object-cover" />
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="text-[11px] text-ink-faint">#{index + 1}</span>
                <div className="flex gap-1">
                  <form action={moveHeroImage}>
                    <input type="hidden" name="imageId" value={row.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button className="px-1.5 text-xs text-ink-soft hover:text-brand" type="submit" aria-label="Move earlier">
                      up
                    </button>
                  </form>
                  <form action={moveHeroImage}>
                    <input type="hidden" name="imageId" value={row.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button className="px-1.5 text-xs text-ink-soft hover:text-brand" type="submit" aria-label="Move later">
                      down
                    </button>
                  </form>
                  <form action={removeHeroImage}>
                    <input type="hidden" name="imageId" value={row.id} />
                    <button className="px-1.5 text-xs font-semibold text-brand hover:underline" type="submit">
                      remove
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="card p-4 text-sm text-ink-faint">
          No pictures yet. The home page is showing generated ones.
        </p>
      )}

      <h2 className="pt-4 font-bold">Front page slider</h2>
      <p className="text-sm text-ink-soft">
        {featured.length} profiles show in the slider under the hero. Turn any of them on or off. If
        you turn them all off, the site falls back to the highest rated profiles on its own.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {live.map(({ profile, city }) => (
          <div key={profile.id} className="card flex items-center gap-3 p-3">
            <Avatar src={profile.avatarPath} name={profile.displayName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{profile.displayName}</p>
              <p className="truncate text-xs text-ink-faint">{city.name}</p>
            </div>
            <form action={toggleFeatured}>
              <input type="hidden" name="photographerId" value={profile.id} />
              <button
                type="submit"
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  profile.featured
                    ? "border-brand bg-brand-soft text-brand-deep"
                    : "border-line bg-surface text-ink-soft hover:border-brand hover:text-brand"
                }`}
              >
                {profile.featured ? "On the slider" : "Add to slider"}
              </button>
            </form>
          </div>
        ))}
      </div>

      <h2 className="pt-4 font-bold">Shoot type pictures</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat.id} className="card overflow-hidden">
            <Photo
              imagePath={cat.imagePath}
              seed={`cat-${cat.slug}`}
              label={cat.imagePath ? undefined : cat.name}
              alt={cat.name}
              w={600}
              h={240}
              className="h-28 w-full object-cover"
            />
            <div className="p-4">
              <p className="font-semibold">{cat.name}</p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {cat.imagePath ? "Real picture uploaded" : "Showing the generated placeholder"}
              </p>
              <CategoryImageForm slug={cat.slug} />
              {cat.imagePath ? (
                <form action={clearCategoryImage} className="mt-2">
                  <input suppressHydrationWarning type="hidden" name="slug" value={cat.slug} />
                  <button suppressHydrationWarning className="text-xs font-semibold text-brand hover:underline" type="submit">
                    Remove picture
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <h2 className="pt-4 font-bold">Photographer photos</h2>
      <p className="text-sm text-ink-soft">
        Most photographers will not fill their own profile at the start. Upload their profile photo
        and cover photo here, with their permission. {missing.length} of {profiles.length} profiles
        are still missing one.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {profiles.map(({ profile, city }) => (
          <div key={profile.id} className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar src={profile.avatarPath} name={profile.displayName} size={42} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{profile.displayName}</p>
                <p className="truncate text-xs text-ink-faint">
                  {city.name} &middot; {profile.avatarPath ? "has a photo" : "no photo"} &middot;{" "}
                  {profile.coverPath ? "has a cover" : "no cover"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <ProfilePhotoForm photographerId={profile.id} kind="avatar" label="Profile photo" />
              <ProfilePhotoForm photographerId={profile.id} kind="cover" label="Cover photo" />
            </div>
            <Link
              href={`/admin/content/${profile.slug}`}
              className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
            >
              Edit this gallery
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}