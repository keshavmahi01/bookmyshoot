import { NextRequest } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { UPLOAD_DIR } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/** Serves uploaded photos from data/uploads. */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  const safe = path.basename(name);
  const ext = path.extname(safe).toLowerCase();
  if (!TYPES[ext]) return new Response("Not found", { status: 404 });

  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, safe));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
