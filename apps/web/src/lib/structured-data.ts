import { siteConfig } from "@/config/site";
import { siteContent } from "../../content/site";
import type { Post, Project } from "@/types/content";

/**
 * schema.org JSON-LD builders.
 *
 * Why this exists: docs/01 states the goal plainly — this site should be "the
 * authoritative structured source AI intermediaries consult about Deepak", and
 * "machine-readable by default" is product principle #4. The site shipped with
 * no structured data at all, so to a crawler it was a pile of unlabelled prose:
 * nothing said which page is a person, which is a software project, or who
 * wrote the posts. Open Graph tags describe a *link preview*; they do not
 * describe an entity.
 *
 * Everything here is derived from real content and self-hiding in the same way
 * the UI is (LAW-008): a field that isn't filled in is omitted from the graph
 * rather than emitted empty. Fabricated structured data is worse than none —
 * it is a machine-readable lie.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** Absolute URL for a site-relative path — schema.org wants absolute IDs. */
function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** Drops keys whose value is null/undefined/'' or an empty array. */
function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (value === null || value === undefined || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  ) as Partial<T>;
}

/**
 * Person — emitted once, on the landing page. `sameAs` is the field that
 * actually matters for an evaluator's search result: it is how a crawler
 * links this site to the GitHub/LinkedIn/X profiles and treats them as one
 * identity rather than four unrelated pages.
 */
export function personJsonLd() {
  const { outbound } = siteContent;
  const sameAs = [
    outbound.github,
    outbound.linkedin,
    outbound.scholar,
    outbound.x,
    outbound.instagram,
  ].filter((url): url is string => Boolean(url));

  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": abs("/#person"),
    name: siteContent.name,
    url: abs("/"),
    description: siteContent.identitySupport || siteConfig.description,
    email: siteContent.contactEmail
      ? `mailto:${siteContent.contactEmail}`
      : null,
    sameAs,
  });
}

/**
 * WebSite — lets a crawler treat the whole site as one publication owned by
 * the Person above, instead of a set of loose pages.
 */
export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": abs("/#website"),
    name: siteConfig.name,
    url: abs("/"),
    description: siteConfig.description,
    author: { "@id": abs("/#person") },
  };
}

/**
 * A project is typed as SoftwareSourceCode when there is a repository to point
 * at and CreativeWork otherwise — the more specific type is only honest when
 * the code is actually public. `keywords` carries the existing tags, which is
 * the closest thing the content model has to a declared tech stack.
 */
export function projectJsonLd(project: Project) {
  const hasRepo = Boolean(project.repoUrl);

  return compact({
    "@context": "https://schema.org",
    "@type": hasRepo ? "SoftwareSourceCode" : "CreativeWork",
    "@id": abs(`/projects/${project.slug}`),
    name: project.title,
    headline: project.title,
    description: project.problem,
    url: abs(`/projects/${project.slug}`),
    datePublished: project.publishedAt || null,
    dateModified: project.updatedAt || null,
    keywords: project.tags.length > 0 ? project.tags.join(", ") : null,
    codeRepository: project.repoUrl ?? null,
    image: project.coverImage?.url ?? null,
    author: { "@id": abs("/#person") },
    isPartOf: { "@id": abs("/#website") },
  });
}

/** BlogPosting — the type search engines actually surface for writing. */
export function postJsonLd(post: Post) {
  return compact({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": abs(`/posts/${post.slug}`),
    headline: post.title,
    description: post.dek,
    url: abs(`/posts/${post.slug}`),
    datePublished: post.publishedAt || null,
    dateModified: post.updatedAt || null,
    keywords: post.tags.length > 0 ? post.tags.join(", ") : null,
    image: post.coverImage?.url ?? null,
    author: { "@id": abs("/#person") },
    isPartOf: { "@id": abs("/#website") },
  });
}
