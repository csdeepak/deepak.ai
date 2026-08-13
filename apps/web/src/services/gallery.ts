/**
 * Gallery service (docs/29 §4 Phase G1).
 *
 * Returns GalleryPhoto[] from the appropriate source:
 *   - CONTENT_SOURCE=db  → gallery_items table, R2 URLs via mediaPublicUrl()
 *   - CONTENT_SOURCE=file → static content/gallery.ts (local /gallery/* paths)
 *
 * The shape returned is identical in both modes so all gallery components
 * are source-agnostic.
 */

import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { galleryItems } from "@/db/schema";
import { mediaPublicUrl } from "@/lib/media/url";
import { galleryPhotos as fileGalleryPhotos } from "../../content/gallery";
import type { GalleryPhoto } from "../../content/gallery";

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  if (process.env.CONTENT_SOURCE !== "db") {
    return fileGalleryPhotos;
  }

  const db = getDb();
  // Published-only. Without this the admin's Published toggle would be
  // decorative and unpublished drafts would render on the public site the
  // moment they were added (D-058 Phase F).
  const rows = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.published, true))
    .orderBy(asc(galleryItems.sortOrder));

  return rows.map((row) => ({
    id: row.slug,
    src: mediaPublicUrl(row.gridKey),
    fullSrc: mediaPublicUrl(row.fullKey),
    width: row.width,
    height: row.height,
    aspectRatio: row.width / row.height,
    orientation: row.orientation as GalleryPhoto["orientation"],
    blurDataURL: row.blurData,
    alt: row.altText,
    caption: row.caption,
    info: row.info,
    date: row.date,
    time: row.time,
    place: row.place,
    size: row.size,
    tilt: row.tilt,
    depth: row.depth,
    featured: row.featured,
  }));
}
