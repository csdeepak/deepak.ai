import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { EmptyState } from "@/components/content/empty-state";
import { GalleryBrowser } from "@/features/gallery/gallery-browser";
import { getGalleryPhotos } from "@/services/gallery";

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
export default async function GalleryPage() {
  // The production 404 guard is gone (D-058 Phase F): photos are now curated
  // in /admin/gallery, where alt text is a required field — the release gate
  // that kept this page hidden. Only published items are returned, so an
  // un-curated photo can't reach here; zero of them is an honest empty state,
  // not a 404, matching /posts and /projects (LAW-008).
  const galleryPhotos = await getGalleryPhotos();

  return (
    <Container width="content">
      <div className="py-16 md:py-24">
        <p className="font-mono text-micro uppercase tracking-[0.14em] text-faint">
          The record
        </p>
        <h1 className="mt-3 max-w-2xl text-section text-ink">Moments from the work.</h1>

        {galleryPhotos.length > 0 ? (
          <>
            <p className="mt-4 max-w-xl text-body text-muted">
              {galleryPhotos.length}{" "}
              {galleryPhotos.length === 1 ? "photograph" : "photographs"}. Select any one
              for its caption, date and place.
            </p>
            <div className="mt-16">
              <GalleryBrowser photos={galleryPhotos} />
            </div>
          </>
        ) : (
          <EmptyState
            className="mt-12"
            title="No photographs are published here yet."
            body="This shelf is honestly empty. When there is something worth showing, it will appear here."
          />
        )}
      </div>
    </Container>
  );
}
