import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb", "sharp"],
  experimental: {
    serverActions: {
      // Photos from a phone are several MB. The default limit is 1 MB, which
      // makes an upload fail with a plain "Failed to fetch".
      bodySizeLimit: "32mb",
    },
  },
};

export default nextConfig;
