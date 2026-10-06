import type { Metadata } from "next";
import Link from "next/link";
import { getCities } from "@/lib/queries";
import SignupForm from "./signup-form";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; ref?: string }>;
}) {
  const { role, ref } = await searchParams;
  const cities = await getCities();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Already have one?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
        .
      </p>
      <div className="card mt-6 p-6">
        <SignupForm
          cities={cities.map((c) => ({ id: c.id, name: c.name, state: c.state }))}
          defaultRole={role === "photographer" ? "PHOTOGRAPHER" : "CUSTOMER"}
          referral={ref ?? ""}
        />
      </div>
    </div>
  );
}
