import Link from "next/link";
import SearchBar from "@/components/search-bar";
import HeroSlideshow, { type HeroSlide } from "@/components/hero-slideshow";
import FeaturedSlider from "@/components/featured-slider";
import SuggestionForm from "@/components/suggestion-form";
import HeroCamera from "@/components/hero-camera";
import JsonLd from "@/components/json-ld";
import { Avatar, Photo } from "@/components/photo";
import { RatingLine, SectionTitle, VerifiedBadge } from "@/components/ui";
import { LastCityChip } from "@/components/last-city";
import {
  dateShortcuts,
  featuredProfiles,
  getCategories,
  getCities,
  heroImages,
  platformStats,
  priceGuide,
  recentWork,
  searchPhotographers,
} from "@/lib/queries";
import { faqJsonLd, websiteJsonLd } from "@/lib/seo";
import { HOME_FAQ } from "@/lib/faq";
import { placeLine, rupees } from "@/lib/format";
import { rateUnit } from "@/lib/constants";

/** Used until the admin uploads real pictures for the home page. */
const FALLBACK_SLIDES = [
  "Wedding ceremony",
  "Pre wedding shoot",
  "Haldi",
  "Sangeet night",
  "Reception",
  "Birthday party",
  "Baby shoot",
  "Corporate event",
  "Ad film set",
  "Product shoot",
  "Drone over the venue",
  "Documentary interview",
  "Fashion shoot",
  "Album design",
];

export default async function HomePage() {
  const stats = await platformStats();
  const categories = await getCategories();
  const cities = (await getCities()).filter((c) => c.popular);
  const featured = await featuredProfiles(10);
  const prices = (await priceGuide()).slice(0, 6);
  const work = await recentWork(14);
  const dates = dateShortcuts();
  const uploaded = await heroImages();
  const categoryMatches = await Promise.all(
    categories.map((cat) => searchPhotographers({ category: cat.slug })),
  );

  const slides: HeroSlide[] = uploaded.length
    ? uploaded.map((row) => ({ src: row.imagePath, caption: row.caption }))
    : FALLBACK_SLIDES.map((label, i) => ({
        src: `/api/img/hero-${i}?w=1600&h=900&tone=bright`,
        caption: label,
      }));

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(HOME_FAQ)} />

      {/* ----------------------------------------------------------- hero */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <HeroSlideshow slides={slides} />
        <HeroCamera />

        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <p className="eyebrow justify-center">Photographers, videographers and drone crews</p>

          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Book a photographer for <span className="hl">your date</span>, without twenty phone
            calls.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-ink-soft sm:text-lg">
            Wedding, birthday, corporate, ad film, product or drone. Pick your city and date and you
            will see only the people who are actually free, with their real starting rate.
          </p>

          <div className="mx-auto mt-8 max-w-3xl text-left">
            <SearchBar glow />
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-soft">
            {[
              "No payment on this site",
              "Only people who are free on your date",
              "Reviews only from finished jobs",
            ].map((line) => (
              <li key={line} className="inline-flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden="true" className="text-green">
                  <path d="M7.6 13.4L4.2 10l1.2-1.2 2.2 2.2 6-6L14.8 6z" fill="currentColor" />
                </svg>
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-ink-faint">Quick dates:</span>
            {dates.map((d) => (
              <Link
                key={d.label}
                href={`/search?date=${d.date}`}
                className="rounded-full border border-line bg-surface/80 px-3 py-1.5 text-sm text-ink-soft backdrop-blur transition hover:border-brand hover:text-brand"
              >
                {d.label}
              </Link>
            ))}
            <LastCityChip />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-ink-soft">
            <span>
              <strong className="text-ink">{stats.photographers}</strong>{" "}
              {stats.photographers === 1 ? "profile" : "profiles"} listed
            </span>
            <span>
              <strong className="text-ink">{stats.verified}</strong> verified
            </span>
            <span>
              <strong className="text-ink">{stats.cities}</strong>{" "}
              {stats.cities === 1 ? "city" : "cities"} covered
            </span>
            <span>
              <strong className="text-ink">{stats.completed}</strong>{" "}
              {stats.completed === 1 ? "job" : "jobs"} completed here
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- featured slider */}
      {featured.length ? (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <SectionTitle
            title="People you can book today"
            subtitle="Profiles our team has checked and put on the front page."
          />
          <FeaturedSlider>
            {featured.map((card) => (
              <article
                key={card.profile.id}
                data-card
                className="card lift w-[270px] shrink-0 snap-start overflow-hidden sm:w-[300px]"
              >
                <Link href={`/p/${card.profile.slug}`} className="relative block">
                  <Photo
                    imagePath={card.profile.coverPath}
                    seed={`${card.profile.slug}-cover`}
                    label={card.profile.coverPath ? undefined : card.profile.displayName}
                    alt={`Work by ${card.profile.displayName}`}
                    w={600}
                    h={400}
                    className="h-40 w-full object-cover"
                  />
                  <span className="absolute right-2 top-2">
                    <VerifiedBadge level={card.profile.verification} />
                  </span>
                </Link>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar src={card.profile.avatarPath} name={card.profile.displayName} size={38} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/p/${card.profile.slug}`}
                        className="block truncate font-bold hover:text-brand"
                      >
                        {card.profile.displayName}
                      </Link>
                      <p className="truncate text-xs text-ink-faint">{placeLine(card.city)}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <RatingLine average={card.rating.average} count={card.rating.count} />
                  </div>

                  <p className="mt-3 border-t border-line-soft pt-3 text-sm text-ink-soft">
                    {card.startingRate ? (
                      <>
                        From{" "}
                        <strong className="text-ink">{rupees(card.startingRate.amount)}</strong> /{" "}
                        {rateUnit(card.startingRate.type)}
                      </>
                    ) : (
                      "Rate on request"
                    )}
                  </p>
                </div>
              </article>
            ))}
          </FeaturedSlider>
        </section>
      ) : null}

      {/* ------------------------------------------------------- services */}
      <section className="border-y border-line bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow">What we cover</p>
          <SectionTitle
            title="What do you need shot?"
            subtitle="Every profile lists only the work it actually does, so these counts are real."
            action={{ label: "All shoot types", href: "/categories" }}
          />
          <div className="grid gap-3 animate-rise sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => {
              const count = categoryMatches[index].length;
              return (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="card lift group overflow-hidden"
                >
                  <Photo
                    imagePath={cat.imagePath}
                    seed={`cat-${cat.slug}`}
                    label={cat.imagePath ? undefined : cat.name}
                    alt={cat.name}
                    w={600}
                    h={260}
                    className="h-28 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold group-hover:text-brand">{cat.name}</p>
                      <span className="shrink-0 text-xs text-ink-faint">
                        {count} {count === 1 ? "profile" : "profiles"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{cat.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- price guide */}
      {prices.length ? (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow">Budget</p>
          <SectionTitle
            title="What things cost"
            subtitle="Worked out from the starting rates on live profiles, not a guess. The final price depends on days, travel and crew."
            action={{ label: "Read the cost guide", href: "/guides/wedding-photography-cost-india" }}
          />
          <div className="grid gap-3 animate-rise sm:grid-cols-2 lg:grid-cols-3">
            {prices.map((row) => (
              <Link
                key={row.category.id}
                href={`/search?category=${row.category.slug}`}
                className="card lift block p-5"
              >
                <p className="font-semibold">{row.category.name}</p>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {rupees(row.low)}
                  <span className="text-sm font-normal text-ink-faint"> and up</span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  Most start around {rupees(row.median)}
                  {row.high && row.high !== row.low ? `, highest ${rupees(row.high)}` : ""}.
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ real work */}
      {work.length >= 6 ? (
        <section className="border-y border-line bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <p className="eyebrow">Proof</p>
            <SectionTitle
              title="Work from people on BookMyShoot"
              subtitle="Every photo here was uploaded by a photographer whose profile our team approved."
              action={{ label: "See everyone", href: "/search" }}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {work.map(({ item, profile }) => (
                <Link
                  key={item.id}
                  href={`/p/${profile.slug}`}
                  className="group relative overflow-hidden rounded-lg border border-line"
                  title={`${item.title} by ${profile.displayName}`}
                >
                  <Photo
                    imagePath={item.imagePath}
                    seed={item.seed}
                    label={item.imagePath ? undefined : item.title}
                    alt={`${item.title} by ${profile.displayName}`}
                    w={400}
                    h={300}
                    className="h-24 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-28"
                  />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
                    {profile.displayName}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* --------------------------------------------------- how it works */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="eyebrow">How it works</p>
        <SectionTitle
          title="Three steps, no payment in between"
          subtitle="We make the introduction and keep the record. The money stays between you and the photographer."
        />
        <ol className="grid gap-4 animate-rise sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Search and shortlist",
              body: "Filter by city, date, budget, language and the extras you need, such as a drone or a second camera. Save up to three and compare them side by side.",
            },
            {
              step: "2",
              title: "Send a booking request",
              body: "One form with your date, venue and budget. The photographer replies with a quote, usually within a day.",
            },
            {
              step: "3",
              title: "Confirm and shoot",
              body: "Once he accepts, the date is blocked and a chat opens for both of you. After the shoot you rate each other.",
            },
          ].map((s) => (
            <li key={s.step} className="card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {s.step}
              </span>
              <p className="mt-3 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ----------------------------------------- faq and suggestion box */}
      <section className="border-y border-line bg-sand">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow">Questions</p>
            <SectionTitle title="Questions people ask" action={{ label: "More help", href: "/help" }} />
            <div className="grid gap-2">
              {HOME_FAQ.map((item) => (
                <details key={item.q} className="card p-4">
                  <summary className="cursor-pointer font-semibold">{item.q}</summary>
                  <p className="mt-2 text-sm text-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24">
            <SuggestionForm />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- cities */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="eyebrow">Where we are</p>
        <SectionTitle title="Popular cities" action={{ label: "All cities", href: "/cities" }} />
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/hire/${city.slug}/wedding`}
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm transition hover:border-brand hover:text-brand"
            >
              Wedding photographers in {city.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ photographer CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Are you a photographer or a film maker?</h2>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Listing is free. Put up your work, set your own rates per hour, per day, per week or per
              event, and keep your calendar honest. Our team checks every new profile before it goes
              live, which normally takes about an hour.
            </p>
          </div>
          <Link href="/join" className="btn btn-primary shrink-0">
            List your work, free
          </Link>
        </div>
      </section>
    </>
  );
}
