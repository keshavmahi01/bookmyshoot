import type { MetadataRoute } from "next";

const base = process.env.SITE_URL ?? "https://bookmyshoot.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/account", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
