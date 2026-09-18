"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_LANES, isRouteBuilt } from "@/constants/routes";
import { DexNavTrigger } from "@/features/dex/dex-nav-trigger";
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
        <div className="flex items-center gap-3 sm:gap-6">
          {lanes.length > 0 && (
            <nav aria-label="Primary">
              <ul className="flex items-center gap-2 text-micro sm:gap-4">
                {lanes.map((lane) => {
                  const active =
                    pathname === lane.href ||
                    pathname.startsWith(`${lane.href}/`);
                  return (
                    <li key={lane.href}>
                      <Link
                        href={lane.href}
                        aria-current={active ? "page" : undefined}
                        // px-2 py-3 turns a 16px-tall text link into a ~40px
                        // touch target inside the 64px bar. The gap shrinks to
                        // compensate, so the lanes sit where they always did.
                        className={cn(
                          "inline-flex items-center px-2 py-3 transition-colors duration-(--duration-hover)",
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
          {/* The one persistent door into Dex — on every public page, not
              just the hero (see DexNavTrigger for the full reasoning). */}
          <DexNavTrigger />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
