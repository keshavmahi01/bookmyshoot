import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Help" };

const faqs = [
  {
    q: "Does BookMyShoot take my payment?",
    a: "No. We do not collect money for shoots. You pay the photographer directly on the terms the two of you agree. If anyone asks you to pay BookMyShoot for a booking, report it to us.",
  },
  {
    q: "What does the verified badge actually mean?",
    a: "ID verified means we matched a government ID with the profile name and did a selfie check. Work verified means that plus original camera files of three shoots checked and two past clients spoken to. It is not a promise about the quality of the work.",
  },
  {
    q: "The photographer has not replied. What now?",
    a: "A request that gets no reply in 24 hours goes cold on its own, and we show you three other people who are free on the same date.",
  },
  {
    q: "Can I book someone from another city?",
    a: "Yes. Many profiles travel. The profile shows how far he travels, and travel and stay are listed as add on charges.",
  },
  {
    q: "Who can write a review?",
    a: "Only a customer whose booking was marked complete on BookMyShoot. There is no open review box, so competitors cannot post about each other.",
  },
  {
    q: "A photo on the site is mine. How do I get it removed?",
    a: "Report it from the grievance page. A valid copyright complaint is acted on quickly, and three valid reports drop that profile back to the unverified level.",
  },
  {
    q: "I am a photographer. What does listing cost?",
    a: "Listing is free. We do not take a commission on your shoot. Paid plans for better placement will come later, and they will be clearly marked as paid.",
  },
  {
    q: "How do I set my rates?",
    a: "You can switch on any of four rate types: per hour, per day, per week or a fixed event package. You can use all four if you want, and add travel, stay, drone and album as separate add on charges.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Help</h1>
      <p className="mt-2 text-ink-soft">The questions we get most often.</p>

      <div className="mt-8 space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="card p-5">
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-sm text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>

      <p className="mt-8 text-sm text-ink-faint">
        Still stuck? <Link href="/contact" className="text-brand hover:underline">Write to us</Link>.
      </p>
    </div>
  );
}
