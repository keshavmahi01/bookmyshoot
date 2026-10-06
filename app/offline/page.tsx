import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "No connection", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">You are offline</h1>
      <p className="mt-2 text-ink-soft">
        BookMyShoot needs a connection to show profiles and dates. Check your network and try again.
      </p>
      <Link href="/" className="btn btn-primary mt-6">
        Try again
      </Link>
    </div>
  );
}
