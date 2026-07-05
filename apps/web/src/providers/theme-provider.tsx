"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide providers: theme (light / dark / system) + motion config.
 *
 * `reducedMotion="user"` makes every Motion animation respect
 * prefers-reduced-motion globally — reduced-motion parity (docs/08)
 * is enforced here once, not per component.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
