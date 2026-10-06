"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function NearMeButton({ radiusKm = 50 }: { radiusKm?: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const findMe = () => {
    if (!("geolocation" in navigator)) {
      setError("Your browser cannot share your location.");
      return;
    }
    setBusy(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = new URLSearchParams(params.toString());
        next.set("lat", pos.coords.latitude.toFixed(4));
        next.set("lng", pos.coords.longitude.toFixed(4));
        next.set("radius", String(radiusKm));
        next.delete("city");
        next.delete("state");
        next.delete("district");
        setBusy(false);
        router.push(`/search?${next.toString()}`);
      },
      () => {
        setBusy(false);
        setError("We could not read your location. Please allow it, or pick a city.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div>
      <button suppressHydrationWarning type="button" onClick={findMe} className="btn btn-ghost w-full" disabled={busy}>
        <svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.5a5.8 5.8 0 0 0-5.8 5.8c0 4.2 5.1 10.5 5.3 10.8a.7.7 0 0 0 1 0c.2-.3 5.3-6.6 5.3-10.8A5.8 5.8 0 0 0 10 1.5zm0 8a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4z"
            fill="currentColor"
          />
        </svg>
        {busy ? "Finding you..." : "Near me"}
      </button>
      {error ? <p className="mt-1 text-xs text-brand">{error}</p> : null}
    </div>
  );
}
