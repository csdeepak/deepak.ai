import path from "node:path";
import type { NextConfig } from "next";

/**
 * Media host allow-list for next/image (D-049). The R2 public base URL is an
 * env value (MEDIA_PUBLIC_BASE_URL); its host is added here at config load. The
 * r2.dev / cloudflarestorage.com fallbacks cover the default bucket domains.
 * When no media host is configured (file mode / CI), the list is the two
 * fallbacks only — harmless, since no image is served without a base URL.
 */
function mediaRemotePatterns() {
  const patterns: { protocol: "https"; hostname: string }[] = [
    { protocol: "https", hostname: "*.r2.dev" },
    { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
  ];
  const base = process.env.MEDIA_PUBLIC_BASE_URL;
  if (base) {
    try {
      patterns.unshift({ protocol: "https", hostname: new URL(base).hostname });
    } catch {
      // Malformed env value — ignore; the fallbacks still apply.
    }
  }
  return patterns;
}

const adminSecurityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Monorepo root (a stray lockfile in the user home dir otherwise
  // confuses workspace inference).
  outputFileTracingRoot: path.join(__dirname, "../../"),
  // Images are served from Cloudflare R2 (D-049) and optimized on-the-fly by
  // next/image (sharp) on the Render server. Remote hosts are allow-listed
  // from the R2 base URL env + bucket-domain fallbacks.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: mediaRemotePatterns(),
  },
  // The public site ships no third-party scripts (specs/landing.md §8).
  async headers() {
    return [
      {
        // Security headers on all /admin/* responses (docs/27 §13).
        source: "/admin/:path*",
        headers: adminSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
