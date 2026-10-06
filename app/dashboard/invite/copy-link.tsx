"use client";

import { useState } from "react";

export default function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const message = encodeURIComponent(
    `I am listed on BookMyShoot, it sends me booking requests for my city and dates. Listing is free. ${link}`,
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input readOnly value={link} className="field min-w-56 flex-1" onFocus={(e) => e.target.select()} />
      <button type="button" onClick={copy} className="btn btn-ghost">
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={`https://wa.me/?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Share on WhatsApp
      </a>
    </div>
  );
}
