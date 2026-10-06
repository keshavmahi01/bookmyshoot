import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { platformStats } from "@/lib/queries";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const stats = await platformStats();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">About {SITE.name}</h1>
      <div className="prose-page mt-4">
        <p>
          Finding a photographer in India still works on references. You ask a cousin, you ask the
          banquet hall, you scroll Instagram, and then you make ten calls to find out who is free on
          your date. Rates are hidden, portfolios are often borrowed, and nobody can tell you whether
          the files will arrive on time.
        </p>
        <p>
          {SITE.name} puts that in one place. Every photographer keeps a profile with real work
          samples, the rates he actually charges, and a calendar he updates himself. You search by
          city, date and shoot type, and you see only the people who are free.
        </p>
        <h2>What we do not do</h2>
        <p>
          We do not take payment for shoots, and we do not promise that anyone&apos;s work is good.
          A badge on this site says only what we checked, and the join page spells out exactly what
          that is. The agreement for the shoot is between you and the photographer.
        </p>
        <h2>Where we are</h2>
        <p>
          We started in the Chandigarh tricity area and we are adding cities one at a time. A city
          goes live only when there are enough people listed for a search to be useful. Right now
          there are {stats.photographers} profiles across {stats.cities} cities.
        </p>
        <h2>Talk to us</h2>
        <p>
          Write to us at{" "}
          <Link href="/contact" className="text-brand hover:underline">the contact page</Link>. If you
          are a photographer and the profile form looks like work, send your Instagram handle and we
          will build the first version for you.
        </p>
      </div>
    </div>
  );
}
