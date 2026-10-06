export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-ink-faint">Last updated {updated}</p>
      <div className="mt-4 rounded-lg border border-gold/30 bg-brand-soft px-4 py-3 text-sm text-brand-deep">
        This is a working draft written for the build. Have a lawyer review and finalise it before the
        site goes live.
      </div>
      <div className="prose-page mt-6">{children}</div>
    </div>
  );
}
