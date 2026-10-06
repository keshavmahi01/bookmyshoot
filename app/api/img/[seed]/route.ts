import { NextRequest } from "next/server";

/**
 * Deterministic placeholder images.
 * Real photo files are not shipped with this project, so gallery images are
 * generated as SVG from the item seed. Replace this route with your real
 * image CDN (Cloudinary or S3 plus CloudFront) when photos start coming in.
 */

function hashOf(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ seed: string }> },
) {
  const { seed } = await context.params;
  const url = new URL(request.url);
  const w = Math.min(1600, Number(url.searchParams.get("w") ?? 800));
  const h = Math.min(1600, Number(url.searchParams.get("h") ?? 600));
  const label = url.searchParams.get("label") ?? "";

  const hash = hashOf(seed);
  const hue = hash % 360;
  const hue2 = (hue + 35 + (hash % 40)) % 360;
  // "bright" is used behind the home page, where a dark picture disappears.
  const bright = url.searchParams.get("tone") === "bright";
  const light = bright ? 52 + (hash % 16) : 38 + (hash % 18);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 42% ${light}%)"/>
      <stop offset="1" stop-color="hsl(${hue2} 48% ${Math.max(18, light - (bright ? 20 : 16))}%)"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${(hash % w)}" cy="${(hash % h)}" r="${Math.min(w, h) / 3}" fill="hsl(${hue2} 60% 72%)" fill-opacity="0.18"/>
  <circle cx="${w - (hash % (w / 2))}" cy="${h - (hash % (h / 2))}" r="${Math.min(w, h) / 4}" fill="hsl(${hue} 70% 85%)" fill-opacity="0.14"/>
${
    label
      ? `<rect x="0" y="${h - 48}" width="${w}" height="48" fill="rgba(0,0,0,0.26)"/>
  <text x="16" y="${h - 18}" font-family="system-ui, sans-serif" font-size="14" fill="rgba(255,255,255,0.92)">${label
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .slice(0, 60)}</text>`
      : ""
  }
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
