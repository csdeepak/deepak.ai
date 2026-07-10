import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_LANES, isRouteBuilt } from "@/constants/routes";
import { siteConfig } from "@/config/site";

/**
 * NavBar (docs/13 §2 primitive): wordmark · lanes (D-021) · theme.
 *
 * Graceful absence (LAW-008): a lane appears only when its page is built
 * (driven by the shared BUILT_ROUTES registry — same source as the
 * footer, no duplication). Unbuilt lanes self-hide rather than 404; no
 * "coming soon" affordance. Until the Work pages ship, the bar is the
 * wordmark + theme toggle alone — correct, not incomplete.
 *
 * Still to land in later sprints: condense-on-scroll, ⌘K visible
 * trigger + palette UI, mobile sheet, Dex dot (v1.5 — graceful absence).
 */
export function NavShell() {
  const lanes = NAV_LANES.filter((lane) => isRouteBuilt(lane.href));

  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-border bg-canvas theme-surface">
      <Container width="wide" className="flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-6">
          {lanes.length > 0 && (
            <nav aria-label="Primary">
              <ul className="flex items-center gap-6 text-small">
                {lanes.map((lane) => (
                  <li key={lane.href}>
                    <Link
                      href={lane.href}
                      className="text-muted hover:text-ink"
                    >
                      {lane.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
