/**
 * Media read queries for the admin (server-only, not a Server Action).
 * Used by the media library page and the editor's media picker.
 */

import "server-only";
import { sql, eq, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { media, contentMedia } from "@/db/schema";
import { mediaPublicUrl } from "@/lib/media/url";

export interface MediaListItem {
  id: string;
  kind: "image" | "pdf";
  url: string;
  alt: string;
  caption: string;
  byteSize: number;
  width: number | null;
  height: number | null;
  refCount: number;
  createdAt: string;
}

/** All media assets, newest first, each with how many items reference it. */
export async function listMedia(): Promise<MediaListItem[]> {
  const db = getDb();
  const refCount = sql<number>`count(${contentMedia.id})`.mapWith(Number);

  const rows = await db
    .select({
      id: media.id,
      kind: media.kind,
      storageKey: media.storageKey,
      altText: media.altText,
      caption: media.caption,
      byteSize: media.byteSize,
      width: media.width,
      height: media.height,
      createdAt: media.createdAt,
      refCount,
    })
    .from(media)
    .leftJoin(contentMedia, eq(contentMedia.mediaId, media.id))
    .groupBy(media.id)
    .orderBy(desc(media.createdAt));

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind === "pdf" ? "pdf" : "image",
    url: mediaPublicUrl(r.storageKey),
    alt: r.altText ?? "",
    caption: r.caption ?? "",
    byteSize: r.byteSize,
    width: r.width,
    height: r.height,
    refCount: r.refCount,
    createdAt: r.createdAt.toISOString(),
  }));
}
