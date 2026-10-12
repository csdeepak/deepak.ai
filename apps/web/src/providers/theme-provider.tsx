"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * App-wide providers: theme (light / dark / system).
 *
 * Dark is the default identity (bible §2.2, D-039): the lit scene and
 * the product's character are dark-first; light ("Paper") stays a
 * first-class equal, and "system" remains selectable. First visit
 * renders dark regardless of OS so the identity is consistent.
 *
 * Motion's `MotionConfig` used to wrap everything here, which put the Motion
 * runtime in every page's first load. Since D-072 the landing reveals are CSS
 * and the only Motion consumer is /memory, which carries its own config
 * (`features/memory/motion-scope.tsx`). CSS animations honour
 * prefers-reduced-motion in globals.css — docs/08 parity is unchanged.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      // Instant, atomic theme swap (D-072). Component colour transitions sat
      // out of step with each other and with the page: a toggle measured 10
      // intermediate states over ~245ms. next-themes suspends every
      // transition for the frame of the switch.
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
