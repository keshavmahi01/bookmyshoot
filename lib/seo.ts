import type { Category, City, Photographer } from "@/db/schema";
import type { PhotographerDetail } from "./queries";
import { placeLine } from "./format";

export const SITE_URL = process.env.SITE_URL ?? "https://bookmyshoot.in";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BookMyShoot",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?city={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function photographerJsonLd(detail: PhotographerDetail) {
  const { profile, city, rating, startingRate } = detail;
  const sameAs = [profile.instagram, profile.facebook, profile.youtube, profile.website].filter(
    Boolean,
  );

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: profile.displayName,
    description: profile.tagline,
    url: `${SITE_URL}/p/${profile.slug}`,
    image: profile.coverPath ? `${SITE_URL}${profile.coverPath}` : undefined,
    areaServed: profile.travelsAllIndia ? "India" : placeLine(city),
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: "IN",
    },
    knowsLanguage: profile.languages,
  };

  if (sameAs.length) data.sameAs = sameAs;
  if (startingRate) {
    data.priceRange = `From ₹${startingRate.amount}`;
    data.makesOffer = detail.rates.map((rate) => ({
      "@type": "Offer",
      name: rate.title,
      price: rate.amount,
      priceCurrency: "INR",
    }));
  }
  if (rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(rating.average.toFixed(1)),
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return data;
}

export function listJsonLd(
  city: City,
  category: Category,
  profiles: { profile: Photographer }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.singular}s in ${city.name}`,
    numberOfItems: profiles.length,
    itemListElement: profiles.slice(0, 25).map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/p/${row.profile.slug}`,
      name: row.profile.displayName,
    })),
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${SITE_URL}${step.path}`,
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  summary: string;
  slug: string;
  updated: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: `${SITE_URL}/guides/${article.slug}`,
    dateModified: article.updated,
    publisher: { "@type": "Organization", name: "BookMyShoot", url: SITE_URL },
  };
}
