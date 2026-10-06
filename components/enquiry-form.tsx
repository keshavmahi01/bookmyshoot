"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { RATE_TYPES } from "@/lib/constants";

const initial: EnquiryState = {};

export default function EnquiryForm({
  photographerId,
  photographerName,
  categories,
  defaultDate,
  defaultCity,
  today,
}: {
  photographerId: string;
  photographerName: string;
  categories: { id: string; name: string }[];
  defaultDate?: string;
  defaultCity: string;
  today: string;
}) {
  const [state, action, pending] = useActionState(sendEnquiry, initial);
  const openedAt = useRef<HTMLInputElement>(null);

  // Set after the page is interactive, so a form filled in under three seconds
  // can be spotted as a bot. Doing this in render would not be pure.
  useEffect(() => {
    if (openedAt.current) openedAt.current.value = String(Date.now());
  }, []);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-green/25 bg-green-soft p-5 text-sm text-green">
        <p className="font-semibold">Request sent to {photographerName}.</p>
        <p className="mt-1">
          He usually replies within a day. If there is no reply in 24 hours we will show you other
          people who are free on the same date.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-4">
      <input suppressHydrationWarning type="hidden" name="photographerId" value={photographerId} />
      <input ref={openedAt} type="hidden" name="openedAt" defaultValue="" />
      {/* Left empty by people, filled in by bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-3">
        <div>
          <label className="field-label" htmlFor="customerName">Your name</label>
          <input suppressHydrationWarning id="customerName" name="customerName" className="field" required />
        </div>
        <div>
          <label className="field-label" htmlFor="customerPhone">Mobile number</label>
          <input suppressHydrationWarning
            id="customerPhone"
            name="customerPhone"
            inputMode="numeric"
            maxLength={10}
            className="field"
            required
          />
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="field-label" htmlFor="eventDate">Event date</label>
          <input suppressHydrationWarning
            id="eventDate"
            name="eventDate"
            type="date"
            min={today}
            className="field"
            defaultValue={defaultDate}
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="endDate">Last day, if more than one</label>
          <input suppressHydrationWarning id="endDate" name="endDate" type="date" min={today} className="field" />
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="field-label" htmlFor="eventType">Shoot type</label>
          <select suppressHydrationWarning id="eventType" name="eventType" className="field" required>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="rateType">How do you want to book</label>
          <select suppressHydrationWarning id="rateType" name="rateType" className="field" defaultValue="PACKAGE">
            {RATE_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="field-label" htmlFor="cityName">City of the event</label>
          <input suppressHydrationWarning id="cityName" name="cityName" className="field" defaultValue={defaultCity} required />
        </div>
        <div>
          <label className="field-label" htmlFor="venue">Venue, if decided</label>
          <input suppressHydrationWarning id="venue" name="venue" className="field" />
        </div>
      </div>

      <div className="grid gap-3">
        <div>
          <label className="field-label" htmlFor="budget">Your budget in rupees</label>
          <input suppressHydrationWarning id="budget" name="budget" inputMode="numeric" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="hours">Hours needed, for hourly booking</label>
          <input suppressHydrationWarning id="hours" name="hours" inputMode="numeric" className="field" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="message">Anything else he should know</label>
        <textarea suppressHydrationWarning id="message" name="message" rows={3} className="field" />
      </div>

      {state.error ? <p className="text-sm text-brand">{state.error}</p> : null}

      <button suppressHydrationWarning type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending..." : "Send booking request"}
      </button>
      <p className="text-xs text-ink-faint">
        Your number is shown to this photographer only. No payment is taken on BookMyShoot.
      </p>
    </form>
  );
}
