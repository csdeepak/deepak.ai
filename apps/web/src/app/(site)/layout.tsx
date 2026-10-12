import { NavShell } from "@/components/layout/nav-shell";
import { Footer } from "@/components/layout/footer";
import { DexPanel } from "@/features/dex/dex-panel";
import { KeyboardShortcuts } from "@/components/overlays/keyboard-shortcuts";
import { siteContent } from "../../../content/site";
import { RevealBootstrap } from "@/animations/reveal-bootstrap";

/**
 * Site chrome layout — the standard public frame (nav · main · footer)
 * for every ordinary page. Immersive experiences (e.g. /memory) live
 * outside this group and render without chrome.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-(--z-notification) focus:rounded-sm focus:bg-raised focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <NavShell cvUrl={siteContent.cvUrl} />
      <main id="main">{children}</main>
      <Footer />
      {/* After every ScrollReveal block, so it can find them all (D-072). */}
      <RevealBootstrap />
      <DexPanel />
      <KeyboardShortcuts />
    </>
  );
}
