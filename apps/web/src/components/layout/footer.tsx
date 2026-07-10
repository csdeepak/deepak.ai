import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ROUTES, isRouteBuilt } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { siteContent } from "../../../content/site";

/**
 * Footer — the sitemap of record (docs/04 §3; docs/13 primitive).
 * Identical on every public page; it is the safety net that makes the
 * lane nav viable. The freshness stamp is v1.0's quiet reveal (R3):
 * for a statically generated site, build time IS last-updated —
 * an honest stamp by construction.
 *
 * Graceful absence (LAW-008): footer links filter through the SAME
 * BUILT_ROUTES registry as the nav (one source of truth). A sitemap of
 * record that points at 404s is a fabricated affordance — so unbuilt
 * routes self-hide and columns left empty drop out entirely. Outbound
 * links and the CV are content, not routes: they render only when their
 * site.ts fields are filled (the existing graceful-absence pattern).
 */
const COLUMNS: ReadonlyArray<{
  heading: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}> = [
  {
    heading: "Work",
    links: [
      { label: "Projects", href: ROUTES.projects },
      { label: "GitHub", href: ROUTES.github },
      { label: "Skills", href: ROUTES.skills },
    ],
  },
  {
    heading: "Research",
    links: [
      { label: "Research", href: ROUTES.research },
      { label: "Publications", href: ROUTES.publications },
    ],
  },
  {
    heading: "Writing",
    links: [{ label: "Posts", href: ROUTES.posts }],
  },
  {
    heading: "Meta",
    links: [
      { label: "About", href: ROUTES.about },
      { label: "Timeline", href: ROUTES.timeline },
      { label: "Contact", href: ROUTES.contact },
      { label: "Search", href: ROUTES.search },
    ],
  },
];

export function Footer() {
  // Evaluated at build time on this static route (honest stamp).
  const builtOn = new Date().toISOString().slice(0, 10);

  // Filter through the shared registry, then drop columns with no
  // surviving links — no empty headings, no links to unbuilt pages.
  const columns = COLUMNS.map((col) => ({
    ...col,
    links: col.links.filter((link) => isRouteBuilt(link.href)),
  })).filter((col) => col.links.length > 0);

  return (
    <footer className="border-t border-border">
      <Container width="content" className="py-12">
        {columns.length > 0 && (
          <nav aria-label="Footer">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {columns.map((col) => (
                <div key={col.heading}>
                  <h2 className="text-micro font-medium uppercase tracking-wide text-faint">
                    {col.heading}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-small text-muted hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-4 ${
            columns.length > 0 ? "mt-12 border-t border-border pt-6" : ""
          }`}
        >
          <span className="text-small text-muted">{siteConfig.name}</span>
          <div className="flex items-center gap-4 text-small text-muted">
            {siteContent.outbound.github && (
              <a href={siteContent.outbound.github} className="hover:text-ink">
                GitHub
              </a>
            )}
            {siteContent.outbound.scholar && (
              <a href={siteContent.outbound.scholar} className="hover:text-ink">
                Scholar
              </a>
            )}
            {siteContent.outbound.linkedin && (
              <a
                href={siteContent.outbound.linkedin}
                className="hover:text-ink"
              >
                LinkedIn
              </a>
            )}
            {/* The page's last word is a timestamp (specs/landing.md §2.8) */}
            <span className="font-mono text-micro tabular text-faint">
              updated {builtOn}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
