# Spec — Gallery

> Status: **D-056 implemented** on `codex/ai-development-process` (uncommitted). This spec was written *after* the build, on 2026-08-10, to document what actually shipped — the feature was built while this file still read "Template. Do not implement." Everything below describes real code, not intent; open gaps are named as gaps in §9.

## Purpose

A photographic record of the work — builds, projects, and the people around them — presented as a cluster of images rather than an archive. It exists to make the site feel inhabited: proof that the systems described elsewhere were made by a person in real places.

Two surfaces, one language: a strip on the landing page that deepens into a full page at `/gallery`.

## Non-Goals

Named because each was possible and was declined:

- **No date headers, month grouping, search, or filters.** Scrolling is one continuous cluster. Date, time, place and info belong to the *photo* and appear only when one is selected. An archive UI would imply an archive's completeness.
- **No autoplay story player.** The "alive" quality comes from the visitor's own scroll, not a timer — which also keeps the design system's one-ambient-loop rule spent on Dex's breath, and honours "native scroll owns truth."
- **No nav lane.** D-021 caps the nav at four lanes; the gallery is reached from the landing strip.
- **No database, no admin editor, no uploads** in this version — see §6.
- **No cropping to a uniform tile shape.** See §3.
- **No coordinates, ever.** See §5.

## 1. System Shape

```text
<repo>/photos/*.jpeg          (source photos, hand-dropped)
  -> npm run gallery:process --workspace=web
       -> apps/web/public/gallery/{id}.webp        ~900px   grid rendition
       -> apps/web/public/gallery/{id}-full.webp   ~1800px  detail rendition
       -> apps/web/content/gallery/manifest.generated.json  (dims, orientation, blur)
  -> merged by id at import time with hand-authored PHOTO_META
       in apps/web/content/gallery.ts
  -> galleryPhotos[]  -> /gallery         (GalleryBrowser)
     featuredPhotos[] -> landing strip    (GalleryStrip)
```

## 2. Data Model — File-Backed

File-backed for the same reason Dex's knowledge space is (D-053): this is owner-curated content, not visitor-generated data. It does not need a table.

The content splits into two deliberately separate halves that merge by `id`:

| Half | File | Written by | Contains |
| --- | --- | --- | --- |
| Machine | `content/gallery/manifest.generated.json` | `npm run gallery:process` | `id`, `source`, `width`, `height`, `orientation`, `blurDataURL` |
| Hand | `PHOTO_META` in `content/gallery.ts` | The owner, by hand | `alt`, `caption`, `info`, `date`, `time`, `place`, `size`, `tilt`, `depth`, `featured` |

Re-running the pipeline rewrites the manifest wholesale and never touches `PHOTO_META`. A photo present in the manifest but absent from `PHOTO_META` still renders — it falls back to empty strings and neutral layout values, so it carries no caption rather than breaking the layout or inventing a location (LAW-008: an honest blank beats a fabricated label).

`GalleryPhoto` is the exported shape. `galleryPhotos` is the full set; `featuredPhotos` filters on `featured`.

## 3. "A cluster, not a grid"

The load-bearing design rule. Three mechanisms produce it, and all three are required — the first attempt used uniform values and read as a grid:

1. **Every photo keeps its true aspect ratio.** `--ar` comes from the file's real dimensions. Height is the sizing unit (`--base: clamp(8rem, 17vw, 15rem)`), width follows from the ratio — so a portrait stays tall and a panorama stays wide in the same run.
2. **Footprint varies ~0.7×–1.4×** (`--size`). Photos differ by nearly 2×, not by a few pixels. Below `48rem` the spread is damped toward 1 (`--size-eff`), because at full strength a 0.7× photo on a phone lands around 45px wide — technically varied, practically invisible.
3. **Nothing shares a baseline.** Each photo carries a `--tilt` (roughly ±5°, straightening on hover) and a vertical nudge driven by `--depth`. Rows never line up.

`--depth` (0.6 far → 1.0 near) is a single knob driving parallax rate, Ken Burns amount, shadow opacity, and the baseline nudge together, so "nearer" is coherent across all four.

Both surfaces use the same `.gallery-cluster` / `.gallery-photo` primitives — one layout language, no second grid system.

## 4. Functional Requirements

### 4.1 Landing strip (`GalleryStrip`, beat 4 of 5)

- Renders `featuredPhotos` between Evidence and Collaborate. The landing is now a five-beat story: Hero → Mission → Evidence → **Gallery** → Collaborate.
- Self-hides entirely when there are no featured photos (graceful absence).
- Each tile links to `/gallery#{id}` — the deep link opens that photo directly.
- Closes with a "More images" link to `/gallery`.
- **Ships no client JavaScript.** All motion is CSS. The strip costs nothing against the `/` First Load JS budget.

### 4.2 Gallery page (`/gallery`, `GalleryBrowser`)

- Renders the full `galleryPhotos` set as the same cluster.
- Selecting a photo opens a modal detail view: full rendition, caption, info, and a `date · time · place` line — each self-hiding when empty, with an explicit "No caption yet." when there is none.
- Position indicator (`n / total`), previous/next, and close.
- **Keyboard:** `←` / `→` step, `Escape` closes. All three `preventDefault()` so arrows don't also scroll the page behind the overlay.
- **Focus:** moves into the dialog on open (required for a modal, and it stops keystrokes reaching the grid button underneath) and returns to the originating tile on close, so keyboard users are not dumped at the top of the document.
- Body scroll locks while the detail view is open.
- On mount only, a URL hash (`/gallery#g03`) opens that photo. Mount-only is deliberate — re-running it would fight the visitor's own navigation.

### 4.3 Adding photos

1. Drop sources into `<repo>/photos/`.
2. `npm run gallery:process --workspace=web`.
3. Author the new entries in `PHOTO_META`.

The pipeline fails loudly with the source path when the directory is empty, and skips non-images and the `EXCLUDE` set.

## 5. Privacy (binding)

Enforced at the pipeline, not the UI:

- **EXIF is stripped from every output.** `sharp` drops metadata unless `.withMetadata()` is called, and it is never called. `.rotate()` runs first so EXIF orientation is honoured *before* the metadata is discarded.
- **`place` is hand-typed at city granularity only.** A deliberate ceiling, not an oversight. Phone photos carry GPS precise enough to locate someone's home; the label a visitor sees is one the owner chose to write.

This is a hard rule. Any future change that reads location out of a source file instead of out of `PHOTO_META` contradicts D-056.

## 6. Motion

All motion is scroll-driven or interaction-driven — never an ambient loop.

| Moment | Mechanism | Degrades to |
| --- | --- | --- |
| Cluster entrance | CSS keyframe, staggered `calc(var(--i) * 65ms)` | no animation |
| Ken Burns drift | `animation-timeline: view()`, rate scaled by `--depth` | no animation (`@supports` guard) |
| Hover | photo straightens, lifts, brightens — as if picked off a pile | — |
| Grid → detail | View Transitions API shared-element zoom (`viewTransitionName: photo-{id}`) — the tile you clicked *becomes* the detail image | detail view simply opens |
| Next/previous | directional slide on `--ease-arc`, so the motion says which way you moved | no animation |
| Metadata | sequenced *after* the image settles — simultaneous arrival is the clearest amateur tell | no animation |

Every CSS animation block is wrapped in `@media (prefers-reduced-motion: no-preference)`, and `startViewTransition` checks the same query before calling into the API. Under reduced motion nothing animates and everything still works.

## 7. Non-Functional Requirements

- **Renditions:** 900px q78 for cluster tiles, 1800px q82 for detail. Blur placeholders are 16px WebP inlined as base64 in the manifest, so a tile never pops in from blank.
- **`sizes` hints are load-bearing:** `(max-width: 48rem) 50vw, 33vw` on tiles, `100vw` on detail. Without an accurate hint the optimiser upscales the 900px source toward 3840px. Tiles land at roughly 10–18 kB each.
- **Landing tiles are `loading="eager"`, deliberately.** The cluster is a fixed set of 11 small images, and lazy loading was observed leaving one permanently blank when it entered the viewport mid-scroll. A photo that silently never appears is worse than the small upfront cost. `/gallery` stays lazy, where the set can grow.
- **Accessibility:** modal has `role="dialog"` + `aria-modal`, labelled from the caption; tiles carry an `aria-label` falling back caption → alt → `Open photo {id}`; focus ring via the shared `focus-ring` utility. **See the alt-text gate in §9.**

## 8. API and Database Notes

**API: none.** There are no endpoints. Both surfaces are server-rendered from a static import; the only client code is `GalleryBrowser`'s interaction layer. This is a deliberate consequence of the file-backed model, recorded here so its absence doesn't read as an omission.

**Database: none today.** The `GalleryPhoto` shape in `content/gallery.ts` is intentionally exactly what an admin editor would write once this moves to R2 + a `gallery_items` table (`gallery_items` is already a deferred table in the docs/09 schema plan). Not scoped, not built.

## 9. Known Gaps

Honest state, all open:

1. **Alt text and captions are empty on all 11 photos.** `alt`, `caption`, `info` and `place` are placeholder-empty (`date` is mostly filled). The type requires `alt`; the content does not yet supply it. Tiles currently announce as "Open photo g03". **This is a release gate, not cosmetic** — an owner copy pass is required before the gallery is public.
2. **IDs are positional and therefore fragile.** `gallery:process` assigns `g01…gNN` by sorted filename index. Adding a photo that sorts earlier renumbers everything after it, silently breaking `PHOTO_META` keys and any shared `/gallery#gNN` link. Stable IDs (content hash, or an explicit source→id map) are the fix; not done.
3. **`/gallery` appears in no sitemap.** It is in `BUILT_ROUTES`, but the footer's curated `COLUMNS` has no Gallery entry, so the route is reachable only from the landing strip and by direct URL. D-021/D-023 call the footer the sitemap-of-record; a built public route missing from it is an inconsistency needing an owner ruling. (The `BUILT_ROUTES` doc comment in `constants/routes.ts` also still says only `/` and `/projects` are built — stale.)
4. **No orphan guard.** Nothing checks that `PHOTO_META` keys, manifest entries, and files in `public/gallery/` agree. A deleted source leaves stale WebP files behind.
5. **All 11 photos are `featured: true`**, so the landing strip and `/gallery` currently show the same set. The distinction exists but is not yet exercised.
6. **Not verified in-browser.** The View Transitions zoom, keyboard nav, reduced-motion path, and scroll-driven Ken Burns have not been reviewed live by the owner.

## 10. Future Ideas

- Admin editor writing to R2 + `gallery_items` (the shape is already aligned).
- Stable content-hash IDs (fixes §9.2).
- Per-photo project relations — link a photo to the project it depicts (`depicts` is already in D-021's closed relation taxonomy).
- A `check:gallery` guard in the mould of `check:bundle` / `check:dex`: assert every photo has alt text, every manifest entry has a file, and no orphans exist.

## Status

Implemented as **D-056** on `codex/ai-development-process`. **Deferred from the first production deploy (D-057, 2026-08-10):** all public surfaces (landing strip, footer link, `/gallery` route) are hidden in production until the owner completes the alt-text/caption copy pass in §9.1 and reviews the feature live in-browser. `/gallery` 404s in production; it remains accessible in dev for review. Re-enabling is a small diff — see D-057 consequences. See [`../memory/DECISIONS.md`](../memory/DECISIONS.md) D-056 and D-057, and the 2026-08-10 entries in [`../memory/AI_HANDOFF.md`](../memory/AI_HANDOFF.md).
