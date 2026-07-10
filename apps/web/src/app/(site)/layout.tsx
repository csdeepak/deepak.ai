import { NavShell } from "@/components/layout/nav-shell";
import { Footer } from "@/components/layout/footer";

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
      <NavShell />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
