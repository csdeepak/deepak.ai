import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Per-page metadata (D-071).
 *
 * Measured on production before this existed: every page — every project,
 * every post, /about — carried og:title "Deepak Labs", og:url pointing at the
 * homepage, and the site tagline as og:description. Next.js replaces a child's
 * `openGraph` wholesale rather than merging it, and the pages only set
 * `title`/`description`, so the root layout's homepage card was inherited by
 * everything. A project shared on LinkedIn previewed as the homepage, and
 * crawlers that canonicalise on og:url could fold it into `/`. There was also
 * no canonical URL anywhere.
 *
 * This builds the whole set from one call so the three can never disagree.
 */

const DEFAULT_IMAGE = { url: "/og-default.png", width: 1200, height: 630 };

/** Inline markdown that reads as noise in a search snippet or link preview. */
export function plainText(value: string): string {
  return value
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, "$1$2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A description a search result can show whole: whole sentences up to `max`
 * characters (Google truncates around 155–160), else a word-boundary cut.
 * The 753-character paragraph that used to ship here was cut mid-sentence by
 * every consumer, each at a different point.
 */
export function metaDescription(value: string, max = 160): string {
  const text = plainText(value);
  if (text.length <= max) return text;

  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break;
    out += sentence;
  }
  if (out.trim()) return out.trim();

  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  /** The page's own title; the layout template appends the site name. */
  title: string;
  description: string;
  /** Site-relative path, resolved against `metadataBase`. */
  path: string;
  type?: "website" | "article";
}): Metadata {
  const summary = metaDescription(description);
  return {
    title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type,
      title,
      description: summary,
      url: path,
      siteName: siteConfig.name,
      images: [DEFAULT_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      images: [DEFAULT_IMAGE.url],
    },
  };
}
