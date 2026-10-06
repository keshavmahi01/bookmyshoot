import { socialLabel, type SocialKind } from "@/lib/social";

const ICONS: Record<SocialKind, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="14" height="14" rx="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="10" cy="10" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14.3" cy="5.8" r="1" fill="currentColor" />
    </>
  ),
  facebook: (
    <path
      d="M11.6 18v-7h2.3l.4-2.7h-2.7V6.6c0-.8.2-1.3 1.3-1.3h1.4V2.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2H6.6V11h2.3v7z"
      fill="currentColor"
    />
  ),
  youtube: (
    <>
      <rect x="2.2" y="4.6" width="15.6" height="10.8" rx="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.6 7.6l4.4 2.4-4.4 2.4z" fill="currentColor" />
    </>
  ),
  website: (
    <>
      <circle cx="10" cy="10" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 10h14.4M10 2.8c2 2.2 2.9 4.7 2.9 7.2s-.9 5-2.9 7.2c-2-2.2-2.9-4.7-2.9-7.2S8 5 10 2.8z" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
};

export default function SocialLinks({
  links,
  size = "normal",
}: {
  links: { kind: SocialKind; url: string }[];
  size?: "normal" | "small";
}) {
  const shown = links.filter((l) => l.url);
  if (shown.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {shown.map(({ kind, url }) => (
        <li key={kind}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface text-ink-soft transition hover:border-brand hover:text-brand ${
              size === "small" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
            }`}
          >
            <svg width={size === "small" ? 13 : 15} height={size === "small" ? 13 : 15} viewBox="0 0 20 20" aria-hidden="true">
              {ICONS[kind]}
            </svg>
            {socialLabel(kind, url)}
          </a>
        </li>
      ))}
    </ul>
  );
}
