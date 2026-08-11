# 29 — R2 Storage Plan (Cloudflare object storage)

> **Status:** Planned — not executed. Extends D-049 (docs/28 §6) from "CMS media
> on R2" to "all growing user-uploaded objects on R2," and migrates the photo
> gallery off the filesystem.
>
> **Owner decisions locked (2026-08-11):**
> - Photo gallery **migrates to R2** (bytes leave git).
> - Public access model: **public bucket + unguessable random keys** (D-049 v1).
> - Public origin: **`pub-xxxx.r2.dev`** for now; custom domain later is a single
>   `MEDIA_PUBLIC_BASE_URL` change with zero data migration.
>
> **Governing documents:** `docs/28-RICH_METADATA_AND_MEDIA.md` (D-049 media
> vendor + `media`/`content_media` schema), `docs/09-DATABASE.md` (D-013 — no DB
> blobs; references + metadata only), `CONSTITUTION.md` (LAW-008 honesty:
> empty self-hides, alt text required).
>
> **Blocker:** `cloudflare.txt` at the repo root is currently **empty (0 bytes)**.
> The real R2 values (account id, access key id, secret, bucket, public r2.dev
> URL) must be pasted there, then moved into `.env.local` (dev) and Render's env
> store (prod). Never committed to git.

---

## 1. The key finding — the pipeline already exists

R2 integration (D-049) is **fully implemented** and dormant only because the four
`R2_*` env vars are unset. "Connecting Cloudflare" for CMS media is therefore
**configuration, not code**.

| Piece | File | Status |
|-------|------|--------|
| R2 S3 client (put/delete/list/get) | `apps/web/src/lib/media/storage.ts` | built (lazy-reads env) |
| Magic-byte validation + EXIF strip + sharp re-encode | `apps/web/src/lib/media/validate.ts` | built |
| Public URL derivation (key → URL) | `apps/web/src/lib/media/url.ts` | built |
| Upload + reference-checked delete actions | `apps/web/src/features/admin/actions/media.ts` | built |
| Media library page | `/admin/media` | built |
| DB registry (`media` + `content_media`) | `apps/web/src/db/schema.ts` | built |
| `next/image` R2 host allow-list | `apps/web/next.config.ts` | built (`*.r2.dev`) |
| One-command backup mirror | `apps/web/scripts/media-backup.ts` | built |

The only *new* engineering is the gallery migration (§4).

## 2. Storage-split principle (D-013 — unchanged)

> **Binaries live in R2. Only references + metadata live in Postgres. The public
> URL is derived at read time from `storage_key` + `MEDIA_PUBLIC_BASE_URL`, never
> stored.**

This is what keeps media portable: the bucket / CDN / vendor can change with one
env value and zero data migration. Every object below obeys it.

## 3. Object inventory → R2 mapping

| Object | R2 key prefix | Postgres home | Public? | Work |
|---|---|---|---|---|
| CMS content images (cover / in-body gallery) | `image/{uuid}.ext` | `media` + `content_media` | yes | none — wire env |
| CMS PDF attachments | `pdf/{uuid}.pdf` | `media` + `content_media` | yes | none — wire env |
| Photo-gallery grid tiles | `gallery/{slug}.webp` | `gallery_items` (new) | yes | new — §4 |
| Photo-gallery full renditions | `gallery/{slug}-full.webp` | `gallery_items` (new) | yes | new — §4 |
| Hero 3D assets, posters, `og-default.png` | stays in `public/` (git) | none | via app | none — see below |
| Media backups | local mirror | — | no | none — script exists |

**Hero / OG assets stay in `public/` (git), not R2.** They are deterministic
build artifacts with no runtime upload and no privacy concern; git already gives
versioning. R2 is for *admin-uploaded, growing* user content. Moving them would
only add a runtime fetch dependency for zero benefit.

## 4. Gallery migration — the one real build

The photo gallery today lives on the **filesystem**, committed to git:
`apps/web/public/gallery/{g01..g11}.webp` + `-full.webp`, with machine metadata in
`apps/web/content/gallery/manifest.generated.json` and hand-authored captions in
`apps/web/content/gallery.ts` (pipeline: `apps/web/scripts/process-gallery.mjs`).

The generic `media` table is single-object and cannot cleanly hold the gallery's
shape (two renditions per photo, blur placeholder, hand-authored place/date,
curated ordering). `schema.ts:7` already anticipated a deferred `gallery_items`
table. Proposed:

```sql
CREATE TABLE gallery_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text        NOT NULL UNIQUE,        -- stable id (fixes the g01…gNN "breaks on insert" gap)
  grid_key    text        NOT NULL,               -- R2 key, ~900px tile
  full_key    text        NOT NULL,               -- R2 key, ~1800px detail
  alt_text    text        NOT NULL,               -- accessibility = honesty (LAW-008)
  caption     text        NOT NULL DEFAULT '',
  place       text        NOT NULL DEFAULT '',    -- hand-typed (EXIF/GPS stripped at process time)
  taken_on    date,                               -- authored, never from EXIF
  width       integer     NOT NULL,               -- full-rendition dimensions
  height      integer     NOT NULL,
  orientation text        NOT NULL,               -- landscape | portrait | square (derived)
  blur_data   text        NOT NULL,               -- base64 placeholder (no blank pop-in)
  sort_order  integer     NOT NULL DEFAULT 0,
  published   boolean     NOT NULL DEFAULT false, -- self-hides until owner copy pass (LAW-008)
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_gallery_orientation CHECK (orientation IN ('landscape','portrait','square'))
);
CREATE INDEX idx_gallery_sort ON gallery_items (published, sort_order);
```

**Why a slug not `g01`:** the known gap (positional ids break on insert;
`/gallery#g03` deep links shift) is fixed for free by a stable slug + explicit
`sort_order`.

Two phases so we can ship fast and add authoring later:

- **Phase G1 (bytes → R2, minimal code):** upload the existing 22 `.webp` files
  to `gallery/…`; seed `gallery_items` from the current manifest +
  `content/gallery.ts`; repoint `gallery-strip.tsx` / `gallery-browser.tsx` from
  `/gallery/…` to `mediaPublicUrl(key)`. Bytes leave git; `/gallery` renders from
  the DB. No new UI.
- **Phase G2 (optional, admin authoring):** an `/admin/gallery` manager that
  reuses the existing `validate.ts` / `storage.ts` upload path — reorder, edit
  caption/place/alt, publish toggle. Defer until G1 is proven. **Scope decision
  pending owner confirmation.**

## 5. What "connecting Cloudflare" requires (no new app code for CMS media)

1. **Fill `cloudflare.txt`** with account id, R2 access key id, secret, bucket
   name, and the `pub-xxxx.r2.dev` public URL. Move to `.env.local` (dev) and
   Render env store (prod). Never git.
2. **Bucket setup in Cloudflare:** create bucket `deepak-labs-media`; enable
   public access (r2.dev); add **CORS** allowing `GET`/`HEAD` from the site
   origin. Uploads are server-side, so CORS can stay read-only (no browser `PUT`).
3. **Render env:** add `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
   (secrets), `R2_BUCKET`, `MEDIA_PUBLIC_BASE_URL`.
4. **Verify:** `next.config.ts` already allow-lists `*.r2.dev`; `next/image` works
   the moment `MEDIA_PUBLIC_BASE_URL` is set.

## 6. Execution roadmap (on "go")

1. Configure bucket + CORS in Cloudflare; fill `cloudflare.txt`; set env locally.
2. Smoke-test the already-built CMS upload: `/admin/media` → upload an image →
   confirm it lands in R2 and renders. Proves the connection with zero new code.
3. Gallery Phase G1: migration `0005_gallery_items.sql`; a one-off script to
   upload the existing photos + ingest the manifest; repoint components.
4. `npm run media:backup` — confirm the portable mirror works end-to-end.
5. Later: Gallery Phase G2 admin manager; custom-domain swap via one env change.

## 7. Open items

- **`cloudflare.txt` is empty** — real R2 values needed before execution.
- **Gallery Phase G2 (admin authoring)** — in scope now, or deferred? Pending
  owner confirmation.
- **Custom domain** (e.g. `media.deepak.ai`) — deferred; one `MEDIA_PUBLIC_BASE_URL`
  change when the domain is finalized.
