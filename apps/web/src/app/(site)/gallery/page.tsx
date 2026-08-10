import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { GalleryBrowser } from "@/features/gallery/gallery-browser";
import { galleryPhotos } from "../../../../content/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from the work — projects, builds, and the people around them.",
};

/**
 * Gallery (D-056) — a cluster, not an archive.
 *
 * Deliberately absent: date headers, month grouping, search, filters. Scrolling
 * is one continuous cluster; the date, time, place and info belong to the photo
 * and appear only when one is selected.
 */
export default function GalleryPage() {
  // Deferred pending an owner alt-text/caption pass and a live review — all
  // 11 photos still ship with empty alt text (a release gate, not cosmetic;
  // see specs/gallery.md §9 Known Gaps #1) and the page has never been
  // reviewed live (§9 #6). Production 404s until that happens; dev stays
  // open so it's easy to review and re-enable.
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <Container width="content">
      <div className="py-16 md:py-24">
        <p className="font-mono text-micro uppercase tracking-[0.14em] text-faint">
          The record
        </p>
        <h1 className="mt-3 max-w-2xl text-section text-ink">Moments from the work.</h1>
        <p className="mt-4 max-w-xl text-body text-muted">
          {galleryPhotos.length} photographs. Select any one for its caption, date and
          place.
        </p>

        <div className="mt-16">
          <GalleryBrowser photos={galleryPhotos} />
        </div>
      </div>
    </Container>
  );
}
