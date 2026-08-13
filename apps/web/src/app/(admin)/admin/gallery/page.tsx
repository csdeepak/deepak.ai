import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { galleryItems } from "@/db/schema";
import { mediaPublicUrl } from "@/lib/media/url";
import { listMedia } from "@/features/admin/queries/media";
import {
  GalleryManager,
  type GalleryItemRow,
} from "@/features/admin/components/GalleryManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const db = getDb();

  const [rows, allMedia] = await Promise.all([
    db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder)),
    listMedia(),
  ]);

  const items: GalleryItemRow[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    url: mediaPublicUrl(r.gridKey),
    altText: r.altText,
    caption: r.caption,
    info: r.info,
    place: r.place,
    date: r.date,
    time: r.time,
    size: r.size,
    tilt: r.tilt,
    depth: r.depth,
    sortOrder: r.sortOrder,
    featured: r.featured,
    published: r.published,
    orientation: r.orientation,
    width: r.width,
    height: r.height,
  }));

  // Offer only images not already in the gallery. gridKey holds the media
  // storageKey, and mediaPublicUrl is a pure derivation of it, so comparing
  // resolved URLs matches without re-querying the media table by key.
  const used = new Set(rows.map((r) => mediaPublicUrl(r.gridKey)));
  const availableMedia = allMedia.filter((m) => m.kind === "image" && !used.has(m.url));

  return <GalleryManager items={items} availableMedia={availableMedia} />;
}
