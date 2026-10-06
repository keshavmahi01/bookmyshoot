import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">Contact us</h1>
      <p className="mt-2 text-ink-soft">
        We read everything. For anything about a specific booking, include the date and the
        photographer&apos;s name.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Email</p>
          <p className="mt-1 font-semibold">{SITE.email}</p>
          <p className="mt-2 text-sm text-ink-soft">We reply within one working day.</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Phone</p>
          <p className="mt-1 font-semibold">{SITE.phone}</p>
          <p className="mt-2 text-sm text-ink-soft">10 am to 6 pm, Monday to Saturday.</p>
        </div>
      </div>

      <form className="card mt-6 space-y-4 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="name">Your name</label>
            <input suppressHydrationWarning id="name" name="name" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Mobile number</label>
            <input suppressHydrationWarning id="phone" name="phone" inputMode="numeric" maxLength={10} className="field" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="subject">Subject</label>
          <input suppressHydrationWarning id="subject" name="subject" className="field" />
        </div>
        <div>
          <label className="field-label" htmlFor="body">Message</label>
          <textarea suppressHydrationWarning id="body" name="body" rows={5} className="field" />
        </div>
        <button suppressHydrationWarning type="button" className="btn btn-primary" disabled>
          Send message
        </button>
        <p className="text-xs text-ink-faint">
          Connect this form to your inbox or your CRM before launch. It does not send anything yet.
        </p>
      </form>
    </div>
  );
}
