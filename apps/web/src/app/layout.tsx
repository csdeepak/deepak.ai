import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/theme-provider";
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
        {/* Root is minimal chrome: site nav/footer live in the (site)
            route group so immersive experiences (e.g. /memory) can render
            without them. */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
