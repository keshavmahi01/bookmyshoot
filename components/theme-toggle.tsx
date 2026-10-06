"use client";

/**
 * Light and dark switch.
 *
 * The markup is identical on the server and in the browser, which keeps React
 * happy: both icons are always rendered and CSS shows the right one. The
 * button also carries suppressHydrationWarning, because form filling browser
 * extensions add their own attributes to buttons before React starts.
 */
export default function ThemeToggle() {
  const flip = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("bms-theme", next);
    } catch {
      // private window, the choice just will not be remembered
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      suppressHydrationWarning
      aria-label="Switch between the light and dark theme"
      title="Light or dark"
      className="theme-toggle grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink-soft transition hover:border-brand hover:text-brand"
    >
      <svg className="icon-sun" width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="4" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M16 4l-1.4 1.4M5.4 14.6L4 16" />
        </g>
      </svg>
      <svg className="icon-moon" width="17" height="17" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M16.5 12.6A7 7 0 0 1 7.4 3.5a7 7 0 1 0 9.1 9.1z" fill="currentColor" />
      </svg>
    </button>
  );
}
