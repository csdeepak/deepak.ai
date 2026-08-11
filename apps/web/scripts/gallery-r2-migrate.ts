/**
 * gallery-r2-migrate.ts — Phase G1 one-off migration (docs/29 §4).
 *
 * Reads source photos from <repo>/photos (the same JPEG originals that
 * gallery:process uses), re-encodes them to WebP in-memory with sharp
 * (same quality settings — 900px grid / 1800px full, EXIF stripped),
 * uploads both renditions straight to Cloudflare R2, and seeds the
 * gallery_items table from the manifest + gallery.ts metadata.
 *
 * Safe to re-run: R2 puts are idempotent (overwrite), DB inserts use
 * ON CONFLICT DO NOTHING so existing rows are not overwritten.
 *
 * Prereqs:
 *   1. npm run db:migrate --workspace=web   (creates the gallery_items table)
 *   2. R2 credentials in .env.local
 *   3. Local Postgres running (docker-compose.dev.yml)
 *
 * Run: npm run gallery:migrate-r2 --workspace=web
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { galleryItems } from "../src/db/schema";
import { galleryPhotos } from "../content/gallery";
import manifest from "../content/gallery/manifest.generated.json";

// ── Validate env ─────────────────────────────────────────────────────────────

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error(
    "Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
      "R2_SECRET_ACCESS_KEY, and R2_BUCKET in .env.local",
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set in .env.local");
  process.exit(1);
}

// ── Clients ──────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ── Sharp settings (must match process-gallery.mjs exactly) ──────────────────

const GRID_WIDTH = 900;
const FULL_WIDTH = 1800;
const GRID_QUALITY = 78;
const FULL_QUALITY = 82;

// Photos dir is three levels up from apps/web/scripts/ → repo root / photos
const PHOTOS_DIR = join(process.cwd(), "..", "..", "photos");

/** Sources excluded by gallery:process (non-gallery files in photos/). */
const EXCLUDE = new Set(["photo.PNG"]);

// ── Build a lookup: id → authored gallery metadata ────────────────────────────

const metaById = new Map(galleryPhotos.map((p) => [p.id, p]));

// ── Main ─────────────────────────────────────────────────────────────────────

interface ManifestEntry {
  id: string;
  source: string;
  width: number;
  height: number;
  orientation: string;
  blurDataURL: string;
}

async function main() {
  // Verify photos dir is reachable.
  const sourceFiles = (await readdir(PHOTOS_DIR))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !EXCLUDE.has(f))
    .sort();

  if (sourceFiles.length === 0) {
    console.error(`No source images found in ${PHOTOS_DIR}`);
    process.exit(1);
  }

  const entries = manifest as ManifestEntry[];
  console.log(`Processing ${entries.length} photos → R2 bucket "${bucket}"\n`);

  for (const [i, entry] of entries.entries()) {
    const srcPath = join(PHOTOS_DIR, entry.source);
    const gridKey = `gallery/${entry.id}.webp`;
    const fullKey = `gallery/${entry.id}-full.webp`;

    process.stdout.write(`  [${i + 1}/${entries.length}] ${entry.id}  ${entry.orientation.padEnd(9)} ${entry.source}\n`);

    // Process in-memory — same settings as gallery:process, EXIF stripped.
    const src = await readFile(srcPath);

    process.stdout.write("    ↳ grid…");
    const gridBuf = await sharp(src)
      .rotate()
      .resize({ width: GRID_WIDTH, withoutEnlargement: true })
      .webp({ quality: GRID_QUALITY })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: gridKey,
      Body: gridBuf,
      ContentType: "image/webp",
    }));
    process.stdout.write(" ✓  full…");

    const fullBuf = await sharp(src)
      .rotate()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: FULL_QUALITY })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: fullKey,
      Body: fullBuf,
      ContentType: "image/webp",
    }));
    process.stdout.write(" ✓\n");

    // Authored metadata (size, tilt, depth, featured, caption, alt, etc.)
    const authored = metaById.get(entry.id);

    await db
      .insert(galleryItems)
      .values({
        slug: entry.id,
        gridKey,
        fullKey,
        altText: authored?.alt ?? "",
        caption: authored?.caption ?? "",
        info: authored?.info ?? "",
        place: authored?.place ?? "",
        date: authored?.date ?? "",
        time: authored?.time ?? "",
        width: entry.width,
        height: entry.height,
        orientation: entry.orientation,
        blurData: entry.blurDataURL,
        size: authored?.size ?? 1.0,
        tilt: authored?.tilt ?? 0.0,
        depth: authored?.depth ?? 0.8,
        sortOrder: i,
        featured: authored?.featured ?? false,
        published: false, // awaiting owner alt-text / caption pass
      })
      .onConflictDoNothing();
  }

  await pool.end();

  const baseUrl = process.env.MEDIA_PUBLIC_BASE_URL ?? "(MEDIA_PUBLIC_BASE_URL not set)";
  console.log(`\n✓  ${entries.length} photos uploaded to R2.`);
  console.log(`   Public base: ${baseUrl}`);
  console.log(`   Example:     ${baseUrl}/gallery/g01.webp`);
  console.log(
    "\nNext steps:\n" +
      "  1. Start the dev server and visit /gallery — photos should load from R2.\n" +
      "  2. Fill alt text, captions, and places for each photo in /admin/gallery.\n" +
      "  3. Set published=true per photo when copy is ready.\n" +
      "  4. After confirming R2 works, remove apps/web/public/gallery/ from git.\n",
  );
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
