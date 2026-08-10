"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_LANES, isRouteBuilt } from "@/constants/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * NavBar — Instrument chrome (docs/DESIGN_SYSTEM §5): a fixed glass bar
 * (8px blur over 60% stage), the wordmark in the display face, and a single
 * accent-gradient underline on the active route. Capped at ≤5 lanes.
 *
 * Graceful absence (LAW-008): a lane appears only when its page is built
 * (shared BUILT_ROUTES registry — same source as the footer). Until the Work
 * pages ship, the bar is the wordmark + theme toggle alone — correct, not
 * incomplete.
 */
export function NavShell() {
  const pathname = usePathname();
  const lanes = NAV_LANES.filter((lane) => isRouteBuilt(lane.href)).slice(0, 5);

  // Force dark-glass nav while the hero stage is in view.
  // The hero section has `data-hero-section=""` and is always dark (#0A0B0D).
  // In light mode the default glass tint is warm-white; the IntersectionObserver
  // switches the header to `.dark` so `bg-glass` resolves to dark-glass instead.
  const [overHero, setOverHero] = useState(false);
  useEffect(() => {
    const hero = document.querySelector("[data-hero-section]");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setOverHero(entry?.isIntersecting ?? false),
      { threshold: 0.01 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-(--z-nav) border-b border-border bg-glass backdrop-blur-[8px] theme-surface",
        overHero && "dark",
      )}
    >
      <Container width="wide" className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-card-title font-semibold tracking-[-0.01em] text-ink"
        >
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-8">
          {lanes.length > 0 && (
            <nav aria-label="Primary">
              <ul className="flex items-center gap-8 text-micro">
                {lanes.map((lane) => {
                  const active =
                    pathname === lane.href ||
                    pathname.startsWith(`${lane.href}/`);
                  return (
                    <li key={lane.href}>
                      <Link
                        href={lane.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "transition-colors duration-(--duration-hover)",
                          active
                            ? "gradient-underline text-ink"
                            : "text-muted hover:text-ink",
                        )}
                      >
                        {lane.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
