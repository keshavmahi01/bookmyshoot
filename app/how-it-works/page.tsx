import type { Metadata } from "next";
import Link from "next/link";
import SearchBar from "@/components/search-bar";

export const metadata: Metadata = { title: "How it works" };

const steps = [
  {
    title: "1. Search with your city and date",
    body: "The list shows who is free on that exact date. A photographer who has not opened his calendar in a week drops down the list, so you are not calling dead profiles.",
  },
  {
    title: "2. Compare on things that matter",
    body: "Starting rate, rate type, team size, delivery time, backup camera, drone, language, and reviews from jobs that were actually completed here.",
  },
  {
    title: "3. Send one booking request",
    body: "One form with your date, venue, budget and what you need. It goes to that photographer only. Your number is not shown to anyone else.",
  },
  {
    title: "4. He accepts and the date is blocked",
    body: "If he accepts within 24 hours, the date is marked busy on his calendar and contact details open for both sides. If he does not reply, we show you others who are free on the same date.",
  },
  {
    title: "5. Agree the money directly",
    body: "BookMyShoot does not take payment for shoots. Advance, final payment and the written terms are between you and the photographer. Put everything in the chat before paying.",
  },
  {
    title: "6. After the shoot, both sides review",
    body: "Once the booking is marked complete, you rate on five points and he rates you. This is the only way a review can be written here.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">How a booking works</h1>
      <p className="mt-2 text-ink-soft">
        Six steps, no payment gateway in the middle. We make the introduction and keep the record.
      </p>

      <ol className="mt-8 space-y-4">
        {steps.map((s) => (
          <li key={s.title} className="card p-5">
            <p className="font-semibold">{s.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <h2 className="mb-3 font-bold">Start with your date</h2>
        <SearchBar compact />
      </div>

      <p className="mt-8 text-sm text-ink-faint">
        Questions? Read the <Link href="/help" className="text-brand hover:underline">help page</Link> or{" "}
        <Link href="/contact" className="text-brand hover:underline">write to us</Link>.
      </p>
    </div>
  );
}
