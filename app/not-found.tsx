import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
      <h1 className="mt-2 text-2xl font-bold">That page is not here</h1>
      <p className="mt-2 text-ink-soft">
        The link may be old, or the profile may have been paused.
      </p>
      <Link href="/search" className="btn btn-primary mt-6">Search photographers</Link>
    </div>
  );
}
