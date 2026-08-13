"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, asc } from "drizzle-orm";
import sharp from "sharp";
import { getDb } from "@/db/index";
import { galleryItems, media } from "@/db/schema";
import { getObjectBytes } from "@/lib/media/storage";

export interface GalleryFormState {
  error: string | null;
}

/** Blur placeholder width — matches scripts/process-gallery.mjs. */
const BLUR_WIDTH = 16;

function orientationOf(width: number, height: number): string {
  if (width > height * 1.05) return "landscape";
  if (height > width * 1.05) return "portrait";
  return "square";
}

/** URL-safe slug from an alt/caption line, with a short uniqueness suffix. */
function slugify(source: string, fallback: string): string {
  const base = source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  return base || fallback;
}

/**
 * Add an existing media image to the gallery.
 *
 * `gallery_items` predates this flow and expects two renditions plus a blur
 * placeholder, which `media` doesn't carry (see D-058 Phase F):
 *   - gridKey/fullKey both point at the single media object. `next/image`
 *     already serves a correctly-sized rendition per breakpoint via `sizes`,
 *     so a second stored copy would buy nothing.
 *   - blurData is generated here with sharp. It's REQUIRED (notNull, no
 *     default) and every gallery component passes it to `placeholder="blur"`,
 *     which throws on an empty value — so this can't be deferred. sharp
 *     already runs on this path at upload time (lib/media/validate.ts), so
 *     it's a proven runtime dependency here, not a new one.
 */
export async function addToGallery(mediaId: string): Promise<GalleryFormState> {
  const db = getDb();

  const [asset] = await db
    .select({
      storageKey: media.storageKey,
      altText: media.altText,
      caption: media.caption,
      width: media.width,
      height: media.height,
      kind: media.kind,
    })
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1);

  if (!asset) return { error: "That media no longer exists." };
  if (asset.kind !== "image") return { error: "Only images can be added to the gallery." };
  if (!asset.width || !asset.height) {
    return { error: "That image has no recorded dimensions — re-upload it and try again." };
  }

  const existing = await db
    .select({ id: galleryItems.id })
    .from(galleryItems)
    .where(eq(galleryItems.gridKey, asset.storageKey))
    .limit(1);
  if (existing.length > 0) return { error: "That image is already in the gallery." };

  let blurData: string;
  try {
    const bytes = await getObjectBytes(asset.storageKey);
    const blur = await sharp(bytes).resize({ width: BLUR_WIDTH }).webp({ quality: 40 }).toBuffer();
    blurData = `data:image/webp;base64,${blur.toString("base64")}`;
  } catch {
    return {
      error:
        "Could not read that image from storage to build its blur placeholder. Check the R2 configuration and try again.",
    };
  }

  const [maxRow] = await db
    .select({ max: sql<number | null>`max(${galleryItems.sortOrder})` })
    .from(galleryItems);

  // Slug is unique — fall back to a counter suffix if the alt text collides.
  const base = slugify(asset.altText ?? "", "photo");
  let slug = base;
  for (let n = 2; ; n += 1) {
    const clash = await db
      .select({ id: galleryItems.id })
      .from(galleryItems)
      .where(eq(galleryItems.slug, slug))
      .limit(1);
    if (clash.length === 0) break;
    slug = `${base}-${n}`;
  }

  await db.insert(galleryItems).values({
    slug,
    gridKey: asset.storageKey,
    fullKey: asset.storageKey,
    altText: asset.altText ?? "",
    caption: asset.caption ?? "",
    width: asset.width,
    height: asset.height,
    orientation: orientationOf(asset.width, asset.height),
    blurData,
    sortOrder: (maxRow?.max ?? -1) + 1,
    published: false,
    featured: false,
  });

  revalidateGallery();
  return { error: null };
}

/** Save the hand-authored copy + layout knobs for one gallery item. */
export async function saveGalleryItem(
  _prev: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Missing gallery item ID." };

  const altText = ((formData.get("altText") as string) ?? "").trim();
  if (!altText) {
    return { error: "Alt text is required — a photo without it is unreadable to screen readers." };
  }

  const num = (name: string, fallback: number) => {
    const raw = ((formData.get(name) as string) ?? "").trim();
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  const db = getDb();
  await db
    .update(galleryItems)
    .set({
      altText,
      caption: ((formData.get("caption") as string) ?? "").trim(),
      info: ((formData.get("info") as string) ?? "").trim(),
      place: ((formData.get("place") as string) ?? "").trim(),
      date: ((formData.get("date") as string) ?? "").trim(),
      time: ((formData.get("time") as string) ?? "").trim(),
      size: num("size", 1),
      tilt: num("tilt", 0),
      depth: num("depth", 0.8),
      sortOrder: Math.trunc(num("sortOrder", 0)),
      featured: formData.get("featured") === "true",
      published: formData.get("published") === "true",
    })
    .where(eq(galleryItems.id, id));

  revalidateGallery();
  return { error: null };
}

/**
 * Remove an item from the gallery. The underlying media object is left alone —
 * this un-publishes a photo from the gallery, it does not delete the asset
 * (that stays the media library's job, where the reference check lives).
 */
export async function removeFromGallery(id: string): Promise<GalleryFormState> {
  const db = getDb();
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
  revalidateGallery();
  return { error: null };
}

/** Move an item one place up or down the running order. */
export async function moveGalleryItem(
  id: string,
  direction: "up" | "down",
): Promise<GalleryFormState> {
  const db = getDb();
  const rows = await db
    .select({ id: galleryItems.id, sortOrder: galleryItems.sortOrder })
    .from(galleryItems)
    .orderBy(asc(galleryItems.sortOrder));

  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return { error: "That gallery item no longer exists." };
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= rows.length) return { error: null };

  // Rewrite the whole run as 0..n-1 with the item moved. Cheap at this size
  // and it repairs any duplicate/gapped sortOrder left by earlier edits.
  const reordered = [...rows];
  const [moved] = reordered.splice(index, 1);
  if (!moved) return { error: null };
  reordered.splice(swapWith, 0, moved);

  await db.transaction(async (tx) => {
    for (const [i, row] of reordered.entries()) {
      await tx.update(galleryItems).set({ sortOrder: i }).where(eq(galleryItems.id, row.id));
    }
  });

  revalidateGallery();
  return { error: null };
}

/** Every surface that reads gallery data — admin, landing strip, /gallery. */
function revalidateGallery() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}
