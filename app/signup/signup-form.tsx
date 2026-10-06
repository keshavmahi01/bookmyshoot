"use client";

import { useActionState, useState } from "react";
import { signup, type FormState } from "@/app/actions/auth";

const initial: FormState = {};

export default function SignupForm({
  cities,
  defaultRole,
  referral = "",
}: {
  cities: { id: string; name: string; state: string }[];
  defaultRole: "CUSTOMER" | "PHOTOGRAPHER";
  referral?: string;
}) {
  const [role, setRole] = useState(defaultRole);
  const [state, action, pending] = useActionState(signup, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="ref" value={referral} />
      <div>
        <span className="field-label">I am</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "CUSTOMER", label: "Booking a shoot" },
              { value: "PHOTOGRAPHER", label: "A photographer" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                role === option.value ? "border-brand bg-brand-soft text-brand-deep" : "border-line bg-surface"
              }`}
            >
              <input suppressHydrationWarning
                type="radio"
                name="role"
                value={option.value}
                className="sr-only"
                checked={role === option.value}
                onChange={() => setRole(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="name">
          {role === "PHOTOGRAPHER" ? "Your name or studio name" : "Your name"}
        </label>
        <input suppressHydrationWarning id="name" name="name" className="field" required />
      </div>

      {role === "PHOTOGRAPHER" ? (
        <div>
          <label className="field-label" htmlFor="cityId">Base city</label>
          <select suppressHydrationWarning id="cityId" name="cityId" className="field" required>
            <option value="">Pick your city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.state}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label className="field-label" htmlFor="phone">Mobile number</label>
        <input suppressHydrationWarning id="phone" name="phone" inputMode="numeric" maxLength={10} className="field" required />
      </div>
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input suppressHydrationWarning id="email" name="email" type="email" className="field" required />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Password</label>
        <input suppressHydrationWarning id="password" name="password" type="password" className="field" required minLength={6} />
      </div>

      {state.error ? <p className="text-sm text-brand">{state.error}</p> : null}

      <button suppressHydrationWarning type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Creating..." : "Create account"}
      </button>
      <p className="text-xs text-ink-faint">
        By creating an account you agree to our terms of use and privacy policy.
      </p>
    </form>
  );
}
