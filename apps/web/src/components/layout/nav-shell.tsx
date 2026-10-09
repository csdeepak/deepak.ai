"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LANES, ROUTES, isRouteBuilt } from "@/constants/routes";
import { DexNavTrigger } from "@/features/dex/dex-nav-trigger";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * The footer's non-lane routes, offered again inside the mobile menu because
 * docs/04 §11 specifies the sheet as "the lanes + full sitemap groups (footer
 * equivalent) + theme toggle". Filtered through the same BUILT_ROUTES
 * registry as every other link, so nothing here can point at a 404.
 */
const MORE_LINKS = [
  { label: "Experience", href: ROUTES.timeline },
  { label: "Memory", href: ROUTES.memory },
  { label: "Gallery", href: ROUTES.gallery },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * NavBar — Instrument chrome (docs/DESIGN_SYSTEM §5): a fixed glass bar
 * (8px blur over 60% stage), the wordmark in the display face, and a single
 * accent-gradient underline on the active route. Capped at ≤5 lanes.
 *
 * Graceful absence (LAW-008): a lane appears only when its page is built
 * (shared BUILT_ROUTES registry — same source as the footer). Until the Work
 * pages ship, the bar is the wordmark + theme toggle alone — correct, not
 * incomplete.
 *
 * Below `md` the lanes move into a bottom sheet (D-071). The bar was laid out
 * for two lanes; at five it measured 498px wide on every phone from 320 to
 * 430px, which pushed Ask Dex and the theme toggle off-screen and let the
 * whole page pan sideways. Note `md` is 1024px in this project (custom
 * breakpoints in globals.css): at 768px the five lanes fit with exactly 0px to
 * spare, so one longer label would break a tablet — the menu takes over there.
 *
 * `cvUrl` arrives as a prop from the server layout: importing `content/site`
 * here would ship every project's prose to the browser to read one string.
 */
export function NavShell({ cvUrl }: { cvUrl?: string | null }) {
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
      <Container width="wide" className="flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-display text-card-title font-semibold tracking-[-0.01em] text-ink"
        >
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
          {lanes.length > 0 && (
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-4 text-micro">
                {lanes.map((lane) => {
                  const active = isActive(pathname, lane.href);
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
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
          <MobileMenu pathname={pathname} lanes={lanes} cvUrl={cvUrl} />
        </div>
      </Container>
    </header>
  );
}

/**
 * The mobile menu: docs/04 §11's bottom sheet — thumb-reach, lanes first,
 * then the footer-equivalent routes, then the theme toggle the bar no longer
 * has room for. Radix supplies the focus trap, Esc, scroll lock and
 * return-focus-to-trigger; it is already in every page's bundle via DexPanel,
 * so the sheet costs this component and nothing more.
 */
function MobileMenu({
  pathname,
  lanes,
  cvUrl,
}: {
  pathname: string;
  lanes: ReadonlyArray<{ label: string; href: string }>;
  cvUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const more = MORE_LINKS.filter((link) => isRouteBuilt(link.href));

  // Every link closes the sheet on tap; this also covers back/forward, which
  // change the route without touching a link.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex size-11 items-center justify-center rounded-sm text-muted transition-colors duration-(--duration-fast) hover:bg-surface hover:text-ink md:hidden"
      >
        <Menu size={20} aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        // No description: the title and the links are the whole content.
        // Passing undefined explicitly is how Radix is told that is intended.
        aria-describedby={undefined}
        className="sheet-enter px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
              Menu
            </SheetTitle>
            <SheetClose
              aria-label="Close menu"
              className="-mr-3 inline-flex size-11 items-center justify-center rounded-sm text-muted hover:text-ink"
            >
              <X size={20} aria-hidden />
            </SheetClose>
          </div>

          {lanes.length > 0 && (
            <nav aria-label="Primary">
              <ul className="mt-1 divide-y divide-border">
                {lanes.map((lane) => {
                  const active = isActive(pathname, lane.href);
                  return (
                    <li key={lane.href}>
                      <SheetClose asChild>
                        <Link
                          href={lane.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-12 items-center py-2 font-display text-card-title font-semibold",
                            active ? "text-ink" : "text-muted hover:text-ink",
                          )}
                        >
                          <span className={cn(active && "gradient-underline")}>
                            {lane.label}
                          </span>
                        </Link>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {more.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-6 border-t border-border pt-3">
              {more.map((link) => (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      aria-current={isActive(pathname, link.href) ? "page" : undefined}
                      className="inline-block py-2.5 text-small text-muted hover:text-ink aria-[current=page]:text-ink"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
            {cvUrl ? (
              <a href={cvUrl} download className="cta-pill cta-pill--energy text-small">
                Download CV
              </a>
            ) : (
              <span />
            )}
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
