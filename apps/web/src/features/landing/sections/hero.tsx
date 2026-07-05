import Link from "next/link";
import { Container } from "@/components/layout/container";
import { GraphMotif } from "@/features/landing/graph-motif";
import { siteContent } from "../../../../content/site";
import { ROUTES } from "@/constants/routes";

/** Hero stamp freshness window — R5 (specs/landing.md §2.1). */
const FRESH_DAYS = 30;

/**
 * S1 — Hero (specs/landing.md §2.1, D-026/D-027).
 * Identity legible frame one: the text block is server-rendered with a
 * CSS-only entrance (zero hydration on the LCP path). The motif layers
 * in beside it (cols 8–12), never under text. 85vh with next-section
 * peek — the scroll cue (chevron cut in review, R1). Left-anchored:
 * document, not poster.
 */
export function Hero() {
  const focus = siteContent.currentFocus;
  const stampFresh =
    focus !== null &&
    Date.now() - new Date(focus.updatedAt).getTime() <
      FRESH_DAYS * 24 * 60 * 60 * 1000;

  return (
    <Container width="content">
      <div className="grid min-h-[min(85svh,60rem)] grid-cols-1 content-center gap-12 py-16 md:grid-cols-12 md:gap-6">
        <div className="animate-entrance md:col-span-8 md:self-center">
          <p className="text-h4 font-medium text-muted">{siteContent.name}</p>
          <h1 className="mt-3 max-w-[24ch] text-display font-semibold tracking-tight">
            {siteContent.identitySentence}
          </h1>

          {focus && (
            <p className="mt-6 text-body text-muted">
              Currently: {focus.phrase}
              {stampFresh && (
                <span className="ml-2 font-mono text-micro tabular text-faint">
                  updated{" "}
                  {new Date(focus.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.projects}
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-body font-medium text-on-accent transition-colors duration-(--duration-fast) hover:bg-accent-hover"
            >
              View work
            </Link>
            {siteContent.cvUrl && (
              <a
                href={siteContent.cvUrl}
                className="inline-flex h-12 items-center justify-center rounded-md border border-border px-6 text-body font-medium transition-colors duration-(--duration-fast) hover:border-border-emphasis"
              >
                Download CV
              </a>
            )}
          </div>
        </div>

        {/* Motif beside text, never under it (contrast law). Mobile:
            below text at capped height, simplified by scale. */}
        <div className="md:col-span-4 md:self-center">
          <GraphMotif className="mx-auto max-h-[30vh] w-full max-w-xs md:max-h-none md:max-w-none" />
        </div>
      </div>
    </Container>
  );
}
