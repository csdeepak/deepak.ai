"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide providers: theme (light / dark / system) + motion config.
 *
 * Dark is the default identity (bible §2.2, D-039): the lit scene and
 * the product's character are dark-first; light ("Paper") stays a
 * first-class equal, and "system" remains selectable. First visit
 * renders dark regardless of OS so the identity is consistent.
 *
 * `reducedMotion="user"` makes every Motion animation respect
 * prefers-reduced-motion globally — reduced-motion parity (docs/08)
 * is enforced here once, not per component.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
