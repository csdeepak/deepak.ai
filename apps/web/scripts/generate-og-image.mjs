/**
 * OG image generator (pre-deploy SEO/social pass).
 *
 *   npm run og:generate --workspace=web
 *
 * Renders a brand-safe 1200x630 link-preview card as an SVG string — dark
 * stage background, the "Deepak Labs" wordmark, the real hero tagline from
 * content/site.ts, and a thin accent-gradient rule — and rasterizes it to
 * apps/web/public/og-default.png via sharp.
 *
 * No photo, no AI-generated portraiture: the brand law (D-024, D-020) is
 * wordmark-first. This follows the same committed, rerunnable-script
 * convention as the rest of the asset pipeline (scripts/generate-hero-face.mjs,
 * scripts/process-gallery.mjs) rather than a hand-placed file.
 *
 * Colours and copy are pulled from the real committed sources, not invented
 * — rerun this script after either changes so the card stays in sync:
 *   - background / ink / muted tone -> src/styles/globals.css (.dark tokens)
 *   - accent gradient stops         -> src/styles/globals.css (--grad-1/2/3)
 *   - tagline                       -> content/site.ts (identitySentence)
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "..", "public");
const OUT_FILE = join(OUT_DIR, "og-default.png");

const WIDTH = 1200;
const HEIGHT = 630;

// content/site.ts -> siteContent.identitySentence (the owner-ratified hero
// tagline, D-052 2026-07-21). Edit the copy there, not here, then rerun.
const TAGLINE = "Turning curiosity into working systems.";

// src/styles/globals.css -> .dark tokens (the Instrument system's dark stage,
// the site's default identity).
const BG_STAGE = "#0a0b0d"; // --bg-canvas (dark)
const INK = "#f2f3f5"; // --text-primary (dark) — rgb(var(--stage-ink)), 242 243 245
const INK_MUTED = "rgba(242, 243, 245, 0.6)"; // --text-muted (dark)

// src/styles/globals.css -> the Gemini accent gradient — directed energy
// only, never a flat brand fill.
const GRAD_1 = "#4f8cff"; // blue — leading edge
const GRAD_2 = "#b69cff"; // violet — midpoint
const GRAD_3 = "#ff9cb0"; // warm pink — diffusing tail

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSvg() {
  const tagline = escapeXml(TAGLINE);

  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${GRAD_1}" />
      <stop offset="50%" stop-color="${GRAD_2}" />
      <stop offset="100%" stop-color="${GRAD_3}" />
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG_STAGE}" />

  <!-- Kicker rule: the accent gradient as directed energy, never a flat fill. -->
  <rect x="96" y="232" width="72" height="5" rx="2.5" fill="url(#accent)" />

  <text x="96" y="336" font-family="'Inter Tight','Inter',Arial,sans-serif" font-size="84" font-weight="700" fill="${INK}">Deepak Labs</text>

  <text x="96" y="396" font-family="'Inter',Arial,sans-serif" font-size="32" font-weight="400" fill="${INK_MUTED}">${tagline}</text>
</svg>
`.trim();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const svg = buildSvg();
  await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .png()
    .toFile(OUT_FILE);

  console.log(`✓ OG image (${WIDTH}x${HEIGHT}) written to ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
