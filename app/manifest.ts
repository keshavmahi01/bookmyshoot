import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BookMyShoot",
    short_name: "BookMyShoot",
    description:
      "Find and book a verified photographer, videographer or drone crew anywhere in India.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0e13",
    theme_color: "#0f0e13",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search photographers", url: "/search" },
      { name: "My bookings", url: "/account" },
    ],
  };
}
