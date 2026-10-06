"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/actions/auth";

const initial: FormState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input suppressHydrationWarning id="email" name="email" type="email" className="field" required autoComplete="email" />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Password</label>
        <input suppressHydrationWarning
          id="password"
          name="password"
          type="password"
          className="field"
          required
          autoComplete="current-password"
        />
      </div>
      {state.error ? <p className="text-sm text-brand">{state.error}</p> : null}
      <button suppressHydrationWarning type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Checking..." : "Log in"}
      </button>
    </form>
  );
}
