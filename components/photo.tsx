/* eslint-disable @next/next/no-img-element */

/** Uploaded file when there is one, otherwise a generated placeholder. */
export function photoSrc({
  imagePath,
  seed,
  label,
  w = 800,
  h = 600,
}: {
  imagePath?: string | null;
  seed: string;
  label?: string;
  w?: number;
  h?: number;
}) {
  if (imagePath) return imagePath;
  return `/api/img/${encodeURIComponent(seed)}?w=${w}&h=${h}&label=${encodeURIComponent(label ?? "")}`;
}

export function Photo({
  imagePath,
  seed,
  label,
  alt,
  w,
  h,
  className,
  priority,
}: {
  imagePath?: string | null;
  seed: string;
  label?: string;
  alt: string;
  w?: number;
  h?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={photoSrc({ imagePath, seed, label, w, h })}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

export function Avatar({
  src,
  name,
  size = 64,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full border-2 border-white object-cover shadow-sm ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border-2 border-white bg-brand font-bold text-white shadow-sm ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  );
}
