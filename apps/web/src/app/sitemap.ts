import type { MetadataRoute } from "next";
import { ROUTES, BUILT_ROUTES } from "@/constants/routes";
import { contentService } from "@/services";

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
  [ROUTES.posts]: { changeFrequency: "weekly", priority: 0.7 },
  [ROUTES.skills]: { changeFrequency: "monthly", priority: 0.7 },
  [ROUTES.timeline]: { changeFrequency: "monthly", priority: 0.7 },
  [ROUTES.about]: { changeFrequency: "monthly", priority: 0.7 },
};

const DEFAULT_META: Pick<MetadataRoute.Sitemap[number], "changeFrequency" | "priority"> = {
  changeFrequency: "monthly",
  priority: 0.5,
};

/** A content page's own `updatedAt`, when it parses as a real date. */
function lastModified(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * sitemap.xml — the index routes from BUILT_ROUTES (constants/routes.ts, the
 * same single source of truth the nav and footer read, so this can never
 * advertise a 404), PLUS every published project and post.
 *
 * The detail pages are the point. Before this, the sitemap listed four index
 * URLs and nothing else: /projects/asmos, /projects/turb-detr and every post
 * — the actual work, and the only pages with substantive content — were never
 * submitted to a search engine at all. For a site whose stated purpose is
 * being found by evaluators, that was the single cheapest discoverability
 * gap on the whole project.
 *
 * `lastModified` comes from each item's own `updatedAt` rather than build
 * time, so re-deploying an unchanged page doesn't claim it changed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const indexRoutes: MetadataRoute.Sitemap = Array.from(BUILT_ROUTES).map(
    (route) => {
      const meta = ROUTE_META[route] ?? DEFAULT_META;
      return {
        url: `${SITE_URL}${route}`,
        changeFrequency: meta.changeFrequency,
        priority: meta.priority,
      };
    },
  );

  // Detail pages are listed only when their index route is built — a
  // project URL is not reachable as a lane if /projects doesn't exist, and
  // the graceful-absence rule (LAW-008) applies to crawlers too.
  const [projects, posts] = await Promise.all([
    BUILT_ROUTES.has(ROUTES.projects)
      ? contentService.getProjects()
      : Promise.resolve([]),
    BUILT_ROUTES.has(ROUTES.posts)
      ? contentService.getPosts()
      : Promise.resolve([]),
  ]);

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}${ROUTES.projects}/${project.slug}`,
    lastModified: lastModified(project.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}${ROUTES.posts}/${post.slug}`,
    lastModified: lastModified(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...indexRoutes, ...projectPages, ...postPages];
}
