import type { MetadataRoute } from "next";
import { ROUTES, BUILT_ROUTES } from "@/constants/routes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Per-route tuning — advisory only (search engines treat these as hints,
 * not commands), so this is deliberately not overthought. Any route added
 * to BUILT_ROUTES without an entry here still gets a sane default.
 */
const ROUTE_META: Partial<
  Record<string, Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority">>
> = {
  [ROUTES.home]: { changeFrequency: "weekly", priority: 1.0 },
  [ROUTES.projects]: { changeFrequency: "weekly", priority: 0.8 },
};

const DEFAULT_META: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority"> = {
  changeFrequency: "monthly",
  priority: 0.5,
};

/**
 * sitemap.xml — generated from BUILT_ROUTES (constants/routes.ts), the same
 * single source of truth the nav and footer read (LAW-008 graceful
 * absence). A route is listed here only once it actually exists, so this
 * can never advertise a 404 to search engines — and it can never drift
 * from what's actually built.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return Array.from(BUILT_ROUTES).map((route) => {
    const meta = ROUTE_META[route] ?? DEFAULT_META;
    return {
      url: `${SITE_URL}${route}`,
      changeFrequency: meta.changeFrequency,
      priority: meta.priority,
    };
  });
}
