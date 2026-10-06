import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { newId } from "./ids";

/**
 * Local disk storage for uploaded photos.
 *
 * Files are written to data/uploads and served by the /media route, not from
 * public/, because Next only serves the public folder as it was at build time.
 * On a host with a read only filesystem, such as Vercel, swap the two
 * functions below for an S3 or Cloudinary upload. Nothing else changes.
 */

export const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export type SavedImage = { path: string } | { error: string };

export async function saveImage(
  file: File,
  kind: "avatar" | "cover" | "photo",
): Promise<SavedImage> {
  if (!file || file.size === 0) return { error: "No file was picked." };
  if (!ALLOWED.includes(file.type)) {
    return { error: "Please upload a JPG, PNG or WEBP image." };
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { error: `That photo is ${mb} MB. Please upload a photo under ${MAX_MB} MB.` };
  }

  const sizes = { avatar: 512, cover: 1800, photo: 1600 } as const;
  const width = sizes[kind];

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input).rotate().resize({ width, withoutEnlargement: true });
    const output =
      kind === "avatar"
        ? await pipeline.jpeg({ quality: 86 }).toBuffer()
        : await pipeline.webp({ quality: 82 }).toBuffer();

    const name = `${kind}-${newId()}.${kind === "avatar" ? "jpg" : "webp"}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), output);
    return { path: `/media/${name}` };
  } catch {
    return { error: "That file could not be read as an image." };
  }
}

export async function deleteImage(publicPath: string | null | undefined) {
  if (!publicPath || !publicPath.startsWith("/media/")) return;
  const name = path.basename(publicPath);
  await fs.rm(path.join(UPLOAD_DIR, name), { force: true });
}
