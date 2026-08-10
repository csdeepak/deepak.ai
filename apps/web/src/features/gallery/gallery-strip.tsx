import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ScrollReveal } from "@/animations/scroll-reveal";
import { featuredPhotos } from "../../../content/gallery";

/**
 * Landing-page photo cluster (D-056).
 *
 * A cluster, not a grid: every photo keeps its true aspect ratio, footprints
 * vary by nearly 2x, and each carries its own tilt and vertical nudge so no
 * two share a baseline.
 *
 * Motion is pure CSS bound to `animation-timeline: view()` (see the gallery
 * block in globals.css) — a presentation-style pop-in on first view, then a
 * scroll-driven Ken Burns zoom whose rate varies per photo by depth. This
 * component ships no client JavaScript of its own, so the landing cluster
 * costs nothing against the / First Load JS budget.
 *
 * Deliberately not autoplay. Google Photos gets its "alive" feel from a story
 * player; here the same feel comes from the visitor's own scroll, which keeps
 * the design system's one-ambient-loop rule intact.
 */
export function GalleryStrip() {
  if (featuredPhotos.length === 0) return null;

  return (
    <section className="section-rhythm overflow-hidden" aria-labelledby="gallery-heading">
      <Container width="content">
        <ScrollReveal>
          <p className="font-mono text-micro uppercase tracking-[0.14em] text-faint">
            The record
          </p>
          <h2 id="gallery-heading" className="mt-3 max-w-2xl text-section text-ink">
            Moments from the work.
          </h2>
        </ScrollReveal>

        <div className="gallery-cluster mt-14">
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
                style={{ viewTransitionName: `photo-${photo.id}` }}
              />
            </Link>
          ))}
        </div>

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
