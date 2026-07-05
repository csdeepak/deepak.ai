import Link from "next/link";
import { Container } from "@/components/layout/container";
import { NAV_LANES } from "@/constants/routes";
import { siteConfig } from "@/config/site";

/**
 * Navigation shell — structural placeholder (Sprint 0).
 * Final behavior (condense-on-scroll, palette trigger, Dex dot at v1.5)
 * lands with Sprint 1 per docs/13 §2 NavBar and specs/landing.md.
 */
export function NavShell() {
  return (
    <header className="sticky top-0 z-(--z-nav) border-b border-border bg-canvas theme-surface">
      <Container width="wide" className="flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold">
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-small">
            {NAV_LANES.map((lane) => (
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
      </Container>
    </header>
  );
}
