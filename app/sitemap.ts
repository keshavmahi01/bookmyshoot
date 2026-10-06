import type { MetadataRoute } from "next";
import { getCategories, getCities, searchPhotographers } from "@/lib/queries";
import { GUIDES } from "@/content/guides";

const base = process.env.SITE_URL ?? "https://bookmyshoot.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, categories, profiles] = await Promise.all([
    getCities(),
    getCategories(),
    searchPhotographers({}),
  ]);

  const staticPages = [
    "", "/search", "/categories", "/cities", "/how-it-works", "/join",
    "/about", "/contact", "/help", "/terms", "/privacy", "/cancellation", "/grievance", "/guides",
  ].map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 }));

  const hirePages = cities.flatMap((city) =>
    categories.map((cat) => ({
      url: `${base}/hire/${city.slug}/${cat.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  );

  const profilePages = profiles.map((p) => ({
    url: `${base}/p/${p.profile.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const guidePages = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...hirePages, ...guidePages, ...profilePages];
}
