/**
 * Gallery content (D-056).
 *
 * Two halves, deliberately separated:
 *
 *   manifest.generated.json — machine-written by `npm run gallery:process`
 *                             (dimensions, orientation, blur placeholder).
 *                             Never hand-edit; re-running the script rewrites it.
 *
 *   PHOTO_META below        — hand-authored: caption, info, date, time, place,
 *                             and the layout knobs. Re-running the script never
 *                             touches this.
 *
 * The two merge at import time by `id`. A photo missing from PHOTO_META still
 * renders — it just carries no caption or place, rather than breaking the
 * layout or inventing a location (LAW-008: an honest blank beats a fabricated
 * label).
 *
 * `place` is written by hand at city granularity on purpose. Source photos have
 * their metadata stripped during processing, so nothing here can leak a GPS
 * coordinate.
 *
 * File-backed for now. The shape below is exactly what the admin editor will
 * write once this moves to R2 + a gallery_items table.
 */

import generated from "./gallery/manifest.generated.json";

export type PhotoOrientation = "landscape" | "portrait" | "square";

export interface GalleryPhoto {
  id: string;
  /** Cluster rendition (~900px). */
  src: string;
  /** Detail rendition (~1800px). */
  fullSrc: string;
  /** True pixel dimensions — the cluster sizes from these, never from a fixed ratio. */
  width: number;
  height: number;
  aspectRatio: number;
  orientation: PhotoOrientation;
  blurDataURL: string;

  /** Required for images — accessibility is honesty (LAW-008). */
  alt: string;
  /** Short title shown first in the detail view. */
  caption: string;
  /** Longer free-text detail. The "more info" field, authored per photo. */
  info: string;
  /** ISO date, e.g. "2026-08-04". Empty string = not recorded. */
  date: string;
  /** Display time, e.g. "10:09 PM". Empty string = not recorded. */
  time: string;
  /** City granularity only, e.g. "Bengaluru". Never coordinates. */
  place: string;

  /**
   * Layout knobs — what stops the cluster reading as a grid.
   *
   * size   relative footprint, ~0.7 to ~1.4. Drives how much room the photo
   *        takes; its real aspect ratio then decides the shape.
   * tilt   degrees, roughly -5 to 5. Straightens on hover.
   * depth  0.6 (far) to 1.0 (near). Sets parallax rate and the Ken Burns
   *        zoom amount, so nearer photos move and breathe more.
   */
  size: number;
  tilt: number;
  depth: number;
  /** Show in the landing cluster. The full set always appears on /gallery. */
  featured: boolean;
}

type AuthoredMeta = Pick<
  GalleryPhoto,
  | "alt"
  | "caption"
  | "info"
  | "date"
  | "time"
  | "place"
  | "size"
  | "tilt"
  | "depth"
  | "featured"
>;

/**
 * TODO(copy): captions, info, dates, times and places are placeholders —
 * replace with the real details. Alt text should describe what is actually in
 * the frame, for anyone using a screen reader.
 *
 * The size/tilt/depth values ARE tuned — they are the composition. Vary them
 * generously; uniform values are what made the first attempt read as a grid.
 */
const PHOTO_META: Record<string, AuthoredMeta> = {
  g01: { alt: "", caption: "", info: "", date: "2026-07-14", time: "", place: "", size: 1.15, tilt: -2.5, depth: 1.0, featured: true },
  g02: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 0.78, tilt: 3.0, depth: 0.72, featured: true },
  g03: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 1.32, tilt: 1.5, depth: 0.9, featured: true },
  g04: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 0.72, tilt: -4.0, depth: 0.64, featured: true },
  g05: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 1.05, tilt: 2.0, depth: 0.96, featured: true },
  g06: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 1.24, tilt: -1.5, depth: 0.84, featured: true },
  g07: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 0.86, tilt: 4.0, depth: 0.68, featured: true },
  g08: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 1.38, tilt: -0.8, depth: 1.0, featured: true },
  g09: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 0.94, tilt: -3.2, depth: 0.8, featured: true },
  g10: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 0.7, tilt: 2.6, depth: 0.6, featured: true },
  g11: { alt: "", caption: "", info: "", date: "2026-08-04", time: "", place: "", size: 1.2, tilt: -2.0, depth: 0.92, featured: true },
};

const FALLBACK_META: AuthoredMeta = {
  alt: "",
  caption: "",
  info: "",
  date: "",
  time: "",
  place: "",
  size: 1,
  tilt: 0,
  depth: 0.8,
  featured: false,
};

interface GeneratedEntry {
  id: string;
  source: string;
  width: number;
  height: number;
  orientation: string;
  blurDataURL: string;
}

export const galleryPhotos: GalleryPhoto[] = (generated as GeneratedEntry[]).map(
  (entry) => {
    const meta = PHOTO_META[entry.id] ?? FALLBACK_META;
    return {
      id: entry.id,
      src: `/gallery/${entry.id}.webp`,
      fullSrc: `/gallery/${entry.id}-full.webp`,
      width: entry.width,
      height: entry.height,
      aspectRatio: entry.width / entry.height,
      orientation: entry.orientation as PhotoOrientation,
      blurDataURL: entry.blurDataURL,
      ...meta,
    };
  },
);

/** Photos for the landing cluster, in manifest order. */
export const featuredPhotos: GalleryPhoto[] = galleryPhotos.filter((p) => p.featured);
