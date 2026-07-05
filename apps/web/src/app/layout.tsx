import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/theme-provider";
import { NavShell } from "@/components/layout/nav-shell";
import { FooterShell } from "@/components/layout/footer-shell";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Deepak Labs",
    template: "%s · Deepak Labs",
  },
  description:
    "The personal operating system of a researcher-engineer — research, systems, writing, and experience as one canonical record.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AppProviders>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-notification) focus:rounded-sm focus:bg-raised focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <NavShell />
          <main id="main">{children}</main>
          <FooterShell />
        </AppProviders>
      </body>
    </html>
  );
}
