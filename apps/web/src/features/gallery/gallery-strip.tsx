import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { getGalleryPhotos } from "@/services/gallery";

/**
 * Landing-page photo cluster (D-056).
 *
 * A cluster, not a grid: every photo keeps its true aspect ratio, footprints
 * vary by nearly 2x, and each carries its own tilt and vertical nudge so no
 * two share a baseline.
 *
 * Motion is pure CSS (see the gallery block in globals.css) — a
 * presentation-style pop-in, then a scroll-driven Ken Burns zoom bound to
 * `animation-timeline: view()` whose rate varies per photo by depth. The
 * pop-in starts when the cluster is first seen: it is a ScrollReveal
 * "trigger" (D-074), because at load it ran, and finished, while the strip
 * was still far below the fold, so nobody ever saw it. ScrollReveal is
 * already on the page, so this adds no client JavaScript of its own.
 *
 * Deliberately not autoplay. Google Photos gets its "alive" feel from a story
 * player; here the same feel comes from the visitor's own scroll, which keeps
 * the design system's one-ambient-loop rule intact.
 */
export async function GalleryStrip() {
  const photos = await getGalleryPhotos();
  const featuredPhotos = photos.filter((p) => p.featured);
  if (featuredPhotos.length === 0) return null;

  return (
    <section className="section-rhythm overflow-hidden" aria-labelledby="gallery-heading">
      <Container width="content">
        <ScrollReveal>
          <p className="font-mono text-micro uppercase tracking-[0.2em] text-faint">
            The gallery
          </p>
          <h2 id="gallery-heading" className="mt-3 max-w-2xl text-section font-display font-medium text-ink">
            Moments from the work.
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="trigger" className="gallery-cluster mt-14">
          {featuredPhotos.map((photo, index) => (
            <Link
              key={photo.id}
              href={`/gallery#${photo.id}`}
              className="gallery-photo focus-ring"
              style={{
                ["--ar" as string]: photo.aspectRatio.toFixed(3),
                ["--size" as string]: photo.size,
                ["--tilt" as string]: `${photo.tilt}deg`,
                ["--depth" as string]: photo.depth,
                ["--i" as string]: index,
              }}
              aria-label={photo.caption || photo.alt || "Open gallery"}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                // Cluster tiles top out around a third of the viewport; an
                // accurate hint keeps the optimiser on small renditions
                // (~384px, 10-18kB each here).
                sizes="(max-width: 48rem) 50vw, 33vw"
                // Eager, not lazy. The cluster is a fixed set of 11 small
                // images, and lazy loading was observed leaving one of them
                // permanently blank when it entered the viewport mid-scroll.
                // A photo that silently never appears is worse than the small
                // upfront cost; /gallery stays lazy, where the set can grow.
                loading="eager"
                // Low priority (D-072): React 19's server renderer emits a
                // <link rel="preload"> for every non-lazy <img> in the HTML,
                // so eager tiles were preloaded at the very start of the page
                // load — nine of them, ahead of the hero poster that is the
                // LCP element, for a section near the bottom of the page.
                // "low" keeps them eager (no blank tiles) but behind the
                // critical path, and React skips the preload for it.
                fetchPriority="low"
                style={{ viewTransitionName: `photo-${photo.id}` }}
              />
            </Link>
          ))}
        </ScrollReveal>

        <div className="mt-14">
          <Link
            href="/gallery"
            className="gradient-underline-hover text-body text-muted underline-offset-4"
          >
            More images
          </Link>
        </div>
      </Container>
    </section>
  );
}
