import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-2 text-sm text-ink-soft">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
        .
      </p>

      <div className="card mt-6 p-6">
        <LoginForm />
      </div>

      <div className="card mt-5 bg-sand p-4 text-sm">
        <p className="font-semibold">Demo logins</p>
        <ul className="mt-2 space-y-1 text-ink-soft">
          <li>Photographer: harman-studios@example.com / photo123</li>
          <li>Customer: neha@example.com / neha123</li>
          <li>Admin: admin@bookmyshoot.in / admin123</li>
        </ul>
      </div>
    </div>
  );
}
