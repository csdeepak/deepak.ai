/**
 * Media validation (D-049 / docs/28 §6.3) — server-only.
 *
 * Trust nothing the client declares. The content type is verified by MAGIC
 * BYTES, not the browser-supplied MIME. Size limits are enforced here before a
 * byte reaches storage. Images are re-encoded through sharp (which strips EXIF
 * and any embedded payload) and their real dimensions are read. Nothing
 * uploaded is ever executed — the bucket serves static assets only.
 */

import "server-only";
import sharp from "sharp";

export const LIMITS = {
  imageBytes: 8 * 1024 * 1024, // 8 MB
  pdfBytes: 20 * 1024 * 1024, // 20 MB
} as const;

export type MediaKind = "image" | "pdf";

export interface ValidatedMedia {
  kind: MediaKind;
  buffer: Buffer; // re-encoded (images) or original (pdf)
  mimeType: string; // the verified type
  ext: string;
  byteSize: number;
  width?: number;
  height?: number;
}

/** Sniff the real content type from magic bytes. Returns null if unrecognized. */
function sniff(buf: Buffer): { mime: string; ext: string; kind: MediaKind } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg", kind: "image" };
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { mime: "image/png", ext: "png", kind: "image" };
  }
  // WebP: "RIFF"...."WEBP"
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { mime: "image/webp", ext: "webp", kind: "image" };
  }
  // PDF: "%PDF"
  if (buf.length >= 4 && buf.toString("ascii", 0, 4) === "%PDF") {
    return { mime: "application/pdf", ext: "pdf", kind: "pdf" };
  }
  return null;
}

export class MediaValidationError extends Error {}

/**
 * Validate + normalize an uploaded file. Throws MediaValidationError with an
 * honest message on any failure.
 */
export async function validateUpload(raw: Buffer): Promise<ValidatedMedia> {
  const sniffed = sniff(raw);
  if (!sniffed) {
    throw new MediaValidationError(
      "Unsupported file. Only JPEG, PNG, WebP images and PDF documents are allowed.",
    );
  }

  if (sniffed.kind === "pdf") {
    if (raw.length > LIMITS.pdfBytes) {
      throw new MediaValidationError(
        `PDF is too large (${mb(raw.length)} MB). The limit is ${mb(LIMITS.pdfBytes)} MB.`,
      );
    }
    return {
      kind: "pdf",
      buffer: raw,
      mimeType: "application/pdf",
      ext: "pdf",
      byteSize: raw.length,
    };
  }

  // Image path
  if (raw.length > LIMITS.imageBytes) {
    throw new MediaValidationError(
      `Image is too large (${mb(raw.length)} MB). The limit is ${mb(LIMITS.imageBytes)} MB.`,
    );
  }

  // Re-encode through sharp: strips EXIF/metadata + any embedded payload,
  // and gives us the true dimensions. Auto-orient first so rotation sticks.
  const pipeline = sharp(raw, { failOn: "error" }).rotate();
  const meta = await pipeline.metadata();

  let buffer: Buffer;
  let mimeType: string;
  let ext: string;
  if (sniffed.mime === "image/png") {
    buffer = await pipeline.png().toBuffer();
    mimeType = "image/png";
    ext = "png";
  } else if (sniffed.mime === "image/webp") {
    buffer = await pipeline.webp({ quality: 90 }).toBuffer();
    mimeType = "image/webp";
    ext = "webp";
  } else {
    buffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
    mimeType = "image/jpeg";
    ext = "jpg";
  }

  return {
    kind: "image",
    buffer,
    mimeType,
    ext,
    byteSize: buffer.length,
    width: meta.width,
    height: meta.height,
  };
}

function mb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}
