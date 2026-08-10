import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/providers/theme-provider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display face for the Instrument system (docs/DESIGN_SYSTEM §2).
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Deepak Labs",
    template: "%s · Deepak Labs",
  },
  description:
    "The personal operating system of a researcher-engineer — research, systems, writing, and experience as one canonical record.",
  openGraph: {
    type: "website",
    title: "Deepak Labs",
    description:
      "The personal operating system of a researcher-engineer — research, systems, writing, and experience as one canonical record.",
    url: "/",
    siteName: "Deepak Labs",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deepak Labs",
    description:
      "The personal operating system of a researcher-engineer — research, systems, writing, and experience as one canonical record.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
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
