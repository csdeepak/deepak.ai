"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/index";
import { media, contentMedia, contentItems } from "@/db/schema";
import { putObject, deleteObject, isStorageConfigured } from "@/lib/media/storage";
import { validateUpload, MediaValidationError } from "@/lib/media/validate";
import { mediaPublicUrl } from "@/lib/media/url";

export interface MediaUploadState {
  error: string | null;
  uploaded?: {
    id: string;
    kind: "image" | "pdf";
    url: string;
    alt: string;
    caption: string;
  };
}

/**
 * Upload a media asset (auth-gated by the /admin middleware). Validates by
 * magic bytes, enforces size limits + EXIF strip (validate.ts), stores to R2
 * under a server-generated key, and records the row. alt text is REQUIRED for
 * images (accessibility is honesty, LAW-008).
 */
export async function uploadMedia(
  _prev: MediaUploadState,
  formData: FormData,
): Promise<MediaUploadState> {
  if (!isStorageConfigured()) {
    return {
      error:
        "Media storage is not configured. Add R2 credentials to your environment (README → Media / R2 setup), then restart.",
    };
  }

  const file = formData.get("file");
  const altText = ((formData.get("altText") as string) ?? "").trim();
  const caption = ((formData.get("caption") as string) ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }

  const raw = Buffer.from(await file.arrayBuffer());

  let validated;
  try {
    validated = await validateUpload(raw);
  } catch (e) {
    if (e instanceof MediaValidationError) return { error: e.message };
    return { error: "The file could not be processed. Try a different file." };
  }

  // alt text required for images — enforced here and by the DB CHECK.
  if (validated.kind === "image" && !altText) {
    return { error: "Alt text is required for images (describe it for screen readers)." };
  }

  const key = `${validated.kind}/${randomUUID()}.${validated.ext}`;

  try {
    await putObject(key, validated.buffer, validated.mimeType);
  } catch {
    return { error: "Upload to storage failed. Check the R2 configuration and try again." };
  }

  const db = getDb();
  const [row] = await db
    .insert(media)
    .values({
      kind: validated.kind,
      storageKey: key,
      mimeType: validated.mimeType,
      byteSize: validated.byteSize,
      altText: validated.kind === "image" ? altText : null,
      caption,
      width: validated.width ?? null,
      height: validated.height ?? null,
    })
    .returning({ id: media.id });

  if (!row) {
    // Row insert failed — clean up the orphaned object.
    await deleteObject(key).catch(() => {});
    return { error: "Failed to record the upload. Nothing was saved." };
  }

  revalidatePath("/admin/media");

  return {
    error: null,
    uploaded: {
      id: row.id,
      kind: validated.kind,
      url: mediaPublicUrl(key),
      alt: altText,
      caption,
    },
  };
}

/**
 * Delete a media asset — BLOCKED if any content still references it (the
 * reference-checked delete, docs/28 §2.2). The DB also enforces this via
 * ON DELETE RESTRICT; this check produces an honest message naming the users.
 */
export async function deleteMedia(
  mediaId: string,
): Promise<{ error: string | null }> {
  const db = getDb();

  const refs = await db
    .select({ itemId: contentMedia.itemId })
    .from(contentMedia)
    .where(eq(contentMedia.mediaId, mediaId));

  if (refs.length > 0) {
    const titles = await db
      .select({ title: contentItems.title })
      .from(contentItems)
      .where(inArray(contentItems.id, refs.map((r) => r.itemId)));
    const names = titles.map((t) => `“${t.title}”`).join(", ");
    return {
      error: `Still used by ${refs.length} item${refs.length === 1 ? "" : "s"} (${names}). Remove it there first.`,
    };
  }

  const [row] = await db
    .select({ storageKey: media.storageKey })
    .from(media)
    .where(eq(media.id, mediaId))
    .limit(1);

  if (!row) return { error: "That media no longer exists." };

  await db.delete(media).where(eq(media.id, mediaId));
  await deleteObject(row.storageKey).catch(() => {
    // The row is gone; a lingering object is swept by the backup/GC later.
  });

  revalidatePath("/admin/media");
  return { error: null };
}
