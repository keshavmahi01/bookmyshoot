"use client";

import { useActionState } from "react";
import { sendSuggestion, type SuggestionState } from "@/app/actions/suggestions";

const initial: SuggestionState = {};

export default function SuggestionForm() {
  const [state, action, pending] = useActionState(sendSuggestion, initial);

  if (state.ok) {
    return (
      <div className="card border-green/30 bg-green-soft p-5 text-sm text-green">
        <p className="font-semibold">Thank you, we have it.</p>
        <p className="mt-1">
          We read every one of these. If it is something we can do, it goes on the list.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card relative p-5">
      <h3 className="font-bold">Tell us what is missing</h3>
      <p className="mt-1 text-sm text-ink-soft">
        Something you wanted and could not find? Write it here. Two lines is enough.
      </p>

      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="sg-company">Company</label>
        <input id="sg-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="field-label" htmlFor="sg-body">Your suggestion</label>
          <textarea
            id="sg-body"
            name="body"
            rows={4}
            className="field"
            required
            maxLength={1200}
            placeholder="For example: let me filter by photographers who speak Punjabi"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="sg-name">Your name, optional</label>
            <input id="sg-name" name="name" className="field" />
          </div>
          <div>
            <label className="field-label" htmlFor="sg-contact">Phone or email, optional</label>
            <input id="sg-contact" name="contact" className="field" />
          </div>
        </div>
      </div>

      {state.error ? <p className="mt-2 text-sm text-brand">{state.error}</p> : null}

      <button className="btn btn-primary mt-4 w-full" type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send suggestion"}
      </button>
      <p className="mt-2 text-xs text-ink-faint">
        We only use your contact to reply about this suggestion.
      </p>
    </form>
  );
}
