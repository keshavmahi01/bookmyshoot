/**
 * Bulk loads pictures from a folder into the database.
 *
 *   npm run import-images -- ./my-pictures
 *
 * How the file names are read:
 *   wedding.jpg                 picture for the "wedding" shoot type
 *   hero-1.jpg                  picture 1 of the home page slideshow
 *   p-sample-harman-studios.jpg profile photo for that profile slug
 *
 * Anything else is skipped. Pictures are resized and copied into data/uploads,
 * exactly as an upload from the admin panel would be.
 */
import fs from "node:fs";
import path from "node:path";
import { cols } from "../db/client";
import { newId } from "../lib/ids";
import { saveImage } from "../lib/storage";

const folder = process.argv[2];
if (!folder) {
  console.error("Give me a folder, for example: npm run import-images -- ./my-pictures");
  process.exit(1);
}

const mimeOf = (name: string) => {
  const ext = path.extname(name).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
};

const files = fs
  .readdirSync(folder)
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.error(`No pictures found in ${folder}`);
  process.exit(1);
}

async function run() {
  let categoryCount = 0;
  let heroCount = 0;
  let profileCount = 0;
  let skipped = 0;

  const heroStart = await cols.siteImages.countDocuments({ slot: "HERO" });

  for (const file of files) {
    const full = path.join(folder, file);
    const base = path.basename(file, path.extname(file)).toLowerCase();
    const blob = new File([fs.readFileSync(full)], file, { type: mimeOf(file) });

    if (base.startsWith("hero")) {
      const saved = await saveImage(blob, "cover");
      if ("error" in saved) {
        console.log(`  skipped ${file}, ${saved.error}`);
        skipped += 1;
        continue;
      }
      await cols.siteImages.insertOne({
        id: newId("img_"),
        slot: "HERO",
        imagePath: saved.path,
        caption: "",
        position: heroStart + heroCount,
        active: true,
        createdAt: new Date().toISOString(),
      });
      heroCount += 1;
      continue;
    }

    if (base.startsWith("p-")) {
      const slug = base.slice(2);
      const profile = await cols.photographers.findOne({ slug });
      if (!profile) {
        console.log(`  skipped ${file}, no profile with the slug ${slug}`);
        skipped += 1;
        continue;
      }
      const saved = await saveImage(blob, "avatar");
      if ("error" in saved) {
        console.log(`  skipped ${file}, ${saved.error}`);
        skipped += 1;
        continue;
      }
      await cols.photographers.setById(profile.id, { avatarPath: saved.path });
      profileCount += 1;
      continue;
    }

    const category = await cols.categories.findOne({ slug: base });
    if (!category) {
      console.log(`  skipped ${file}, no shoot type with the slug ${base}`);
      skipped += 1;
      continue;
    }
    const saved = await saveImage(blob, "photo");
    if ("error" in saved) {
      console.log(`  skipped ${file}, ${saved.error}`);
      skipped += 1;
      continue;
    }
    await cols.categories.setById(category.id, { imagePath: saved.path });
    categoryCount += 1;
  }

  console.log("");
  console.log(`  shoot type pictures  ${categoryCount}`);
  console.log(`  home page slides     ${heroCount}`);
  console.log(`  profile photos       ${profileCount}`);
  console.log(`  skipped              ${skipped}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
