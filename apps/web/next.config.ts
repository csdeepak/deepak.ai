import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are served via a CDN with on-the-fly variants per the
  // architecture (docs/11 §10). Remote patterns are added when the
  // media pipeline lands; until then next/image handles local assets.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The public site ships no third-party scripts (specs/landing.md §8).
};

export default nextConfig;
