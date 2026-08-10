/**
 * Gallery image pipeline (D-056).
 *
 *   npm run gallery:process --workspace=web
 *
 * Reads source photos from <repo>/photos, writes optimised WebP into
 * apps/web/public/gallery/, and prints a manifest stub to paste into
 * apps/web/content/gallery.ts.
 *
 * Two renditions per photo:
 *   <id>.webp       ~900px  — the grid/landing tile
 *   <id>-full.webp  ~1800px — the detail view
 *
 * Metadata is stripped on every output (sharp drops EXIF unless you call
 * .withMetadata()). That is deliberate: phone photos can carry GPS
 * coordinates precise enough to locate someone's home, and this gallery
 * shows a place label that the owner types by hand instead.
 *
 * Blur placeholders are inlined as base64 in the manifest, so a tile never
 * pops in from blank.
 */

import sharp from "sharp";
import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..", "..");
const SRC_DIR = join(REPO_ROOT, "photos");
const OUT_DIR = join(HERE, "..", "public", "gallery");
/** Machine-generated dimensions/blur live here; captions are authored in content/gallery.ts. */
const MANIFEST_DIR = join(HERE, "..", "content", "gallery");

const GRID_WIDTH = 900;
const FULL_WIDTH = 1800;
const GRID_QUALITY = 78;
const FULL_QUALITY = 82;
const BLUR_WIDTH = 16;

/** Sources that are not gallery photos. */
const EXCLUDE = new Set(["photo.PNG"]);

function orientationOf(width, height) {
  if (width > height * 1.05) return "landscape";
  if (height > width * 1.05) return "portrait";
  return "square";
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !EXCLUDE.has(f))
    .sort();

  if (files.length === 0) {
    console.error(`No source images found in ${SRC_DIR}`);
    process.exit(1);
  }

  const manifest = [];

  for (const [index, file] of files.entries()) {
    const id = `g${String(index + 1).padStart(2, "0")}`;
    const src = join(SRC_DIR, file);
    const meta = await sharp(src).metadata();

    await sharp(src)
      .rotate() // honour EXIF orientation before we discard the metadata
      .resize({ width: GRID_WIDTH, withoutEnlargement: true })
      .webp({ quality: GRID_QUALITY })
      .toFile(join(OUT_DIR, `${id}.webp`));

    await sharp(src)
      .rotate()
      .resize({ width: FULL_WIDTH, withoutEnlargement: true })
      .webp({ quality: FULL_QUALITY })
      .toFile(join(OUT_DIR, `${id}-full.webp`));

    const blur = await sharp(src)
      .rotate()
      .resize({ width: BLUR_WIDTH })
      .webp({ quality: 40 })
      .toBuffer();

    manifest.push({
      id,
      source: file,
      width: meta.width,
      height: meta.height,
      orientation: orientationOf(meta.width, meta.height),
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    });

    console.log(`  ${id}  ${orientationOf(meta.width, meta.height).padEnd(9)} ${file}`);
  }

  await mkdir(MANIFEST_DIR, { recursive: true });
  const stub = join(MANIFEST_DIR, "manifest.generated.json");
  await writeFile(stub, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\n✓ ${files.length} photos → ${OUT_DIR}`);
  console.log(`  manifest data written to ${stub}`);
  console.log(`  captions, dates and places are authored by hand in content/gallery.ts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
