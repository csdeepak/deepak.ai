import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

/**
 * Footer shell — structural placeholder (Sprint 0).
 * The full sitemap-of-record footer (docs/04 §3) lands with Sprint 1.
 */
export function FooterShell() {
  return (
    <footer className="border-t border-border">
      <Container
        width="wide"
        className="flex h-20 items-center justify-between text-small text-muted"
      >
        <span>{siteConfig.name}</span>
        {/* Freshness stamp — machine truth in mono (DSVL Law 12) */}
        <span className="font-mono text-micro tabular">
          v{siteConfig.version}
        </span>
      </Container>
    </footer>
  );
}
