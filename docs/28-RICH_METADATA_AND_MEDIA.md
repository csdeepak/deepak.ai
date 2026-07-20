# 28 — Rich Metadata & Media Architecture

> **Status:** Ratified + implemented (Phases 1–3). D-048 accepted with the
> `skillsLearned` amendment (dedicated typed field). D-049 accepted — Cloudflare
> R2, with three conditions (env-only creds, one-command backup, upload
> constraints). All three met.
>
> **Decisions made here:** D-048 (rich typed metadata field matrix — extends
> the CTI model), D-049 (media storage vendor + `media` schema — extends D-013).
>
> **Governing documents:** `docs/09-DATABASE.md` (D-043 CTI model — the rule this
> sprint must not break), `docs/24` Part 10 (archetypes — the rendering homes)
> and Part 11 (admin editor philosophy), `docs/27` (admin architecture),
> `CONSTITUTION.md` (LAW-003 spine, LAW-005 graph-not-columns, LAW-008 honesty).
>
> **Out of scope:** public *pages* for Posts/Timeline/Skills/Research (fields +
> editors are built; those public pages are future sprints — new fields render on
> the *existing* Project detail page only, and are designed-but-dormant elsewhere);
> video upload (URL field only); Dex/embeddings; the hero scene; copy changes.

---

## 0. The governing principle (why this sprint is safe)

The owner's directive is "LinkedIn-grade flexibility." The constitutional reading
of that is **rich but typed**, not free-form:

- **No JSONB free-form field bag. No user-defined custom-field builder.** D-043
  rejected exactly this (Option A) and its opacity-compounds-over-a-decade cost.
  Every field below is a named, typed column, a typed `text[]` array, or a typed
  child table — queryable, constrainable, migratable.
- **Every new field is optional and self-hides when empty** (LAW-008). The only
  required gate stays `question`-to-publish (LAW-003). The one exception is image
  `alt_text` — required at upload, because an unlabeled image is a lie, not an
  absence.
- **Every field has a rendering home in a docs/24 archetype.** If a proposed
  field has no honest place to render, it is not added (three candidates were
  cut on this rule — see §5).
- **No parallel duplicate of the graph** (LAW-005). Anything expressible as a
  typed relation (skill↔project, project↔publication) stays a relation and is
  **not** re-added as a string column.

**Acceptance contract for the whole sprint:** a Project with every field filled
renders richly; the *same template* with nothing new filled renders byte-for-byte
as it does today. This is the side-by-side test in Phase 3.

---

## 1. What exists today (the honest baseline)

Per `src/db/schema.ts` and `types/content.ts`:

| Type | Existing fields (base `content_items` + child table) |
|------|------|
| **all** | `slug`, `title`, `content_type`, `status`, `published_at`, `scheduled_for`, `question` (spine), `verified` (LAW-008), `updated_at`, `created_at` + `abandoned_branches` (child) + `relations` |
| **project** | `problem`, `year`, `project_status`, `tags[]`, `featured`, `repo_url` |
| **publication** | `authors[]`, `venue`, `year`, `abstract`, `plain_summary`, `pdf_url`, `bibtex`, `doi` |
| **post** | `dek`, `body_markdown`, `reading_minutes`, `tags[]` |
| **timeline_entry** | `organization`, `role`, `start_date`, `end_date`, `summary` |
| **skill** | `context`, `current` |

Only **`/projects/[slug]`** is a live public page today. That page renders:
title → meta (year · status · tags) → `question` → abandoned branches → evidence
(repo + built-route relations). Everything below extends *that* page for real,
and is designed-but-dormant for the other types until their public pages ship.

---

## 2. Shared infrastructure (three new typed tables — no bags)

Rather than sprinkle media/link columns per type, three **typed, reusable**
tables serve every content type. This is the CTI discipline applied to
cross-cutting concerns.

### 2.1 `media` — the asset registry (D-049)

```sql
CREATE TABLE media (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  kind        text        NOT NULL,              -- 'image' | 'pdf'
  storage_key text        NOT NULL UNIQUE,       -- object-storage key (never a full URL)
  mime_type   text        NOT NULL,              -- verified server-side (magic bytes)
  byte_size   integer     NOT NULL,
  -- Accessibility is honesty: alt is REQUIRED for images (the one non-optional field)
  alt_text    text,
  caption     text        NOT NULL DEFAULT '',
  width       integer,                           -- images only
  height      integer,                           -- images only
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_media_kind CHECK (kind IN ('image','pdf')),
  CONSTRAINT ck_image_has_alt CHECK (
    kind <> 'image' OR (alt_text IS NOT NULL AND alt_text <> '')
  )
);
```

The public URL is derived at read time from `storage_key` + the storage base URL
(an env value) — never stored, so the bucket/CDN can move without a data migration
(D-013 portability).

### 2.2 `content_media` — ordered attach of media to content

Cover / gallery / attachment are all "this item uses this asset in this role,
in this order." One join table, typed role, explicit order.

```sql
CREATE TABLE content_media (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id    uuid    NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  media_id   uuid    NOT NULL REFERENCES media(id)         ON DELETE RESTRICT,
  role       text    NOT NULL,                  -- 'cover' | 'gallery' | 'attachment'
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_content_media_role CHECK (role IN ('cover','gallery','attachment'))
);

-- At most one cover per item
CREATE UNIQUE INDEX uq_content_media_cover
  ON content_media (item_id) WHERE role = 'cover';
CREATE INDEX idx_content_media_item ON content_media (item_id, role, sort_order);
```

`ON DELETE RESTRICT` on `media_id` is the **reference-checked delete**: the DB
refuses to drop a `media` row still attached to any content, and the admin turns
that into an honest message ("Used by 2 items — remove it there first"). When an
*item* is deleted, its `content_media` rows cascade away but the `media` rows
survive (an asset can outlive one use).

### 2.3 `content_links` — labeled external links (not internal relations)

Internal cross-links are `relations` (LAW-005) and stay there. But "related
reading," a proof URL, a demo writeup — labeled *external* links — need a home
that isn't the graph. A typed child table, not a JSONB array:

```sql
CREATE TABLE content_links (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id    uuid    NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  label      text    NOT NULL,
  url        text    NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);
CREATE INDEX idx_content_links_item ON content_links (item_id, sort_order);
```

> **Note on `text[]` vs child tables:** simple ordered scalar lists
> (`collaborators`, `outcomes`, `highlights`) use typed `text[]` columns — the
> pattern `tags[]`/`authors[]`/`content_stages.body[]` already established in
> docs/09. Labeled/structured lists (links, media) use child tables. Neither is
> JSONB. This keeps the model uniform with what exists.

---

## 3. THE FIELD MATRIX

`E` = exists today · `N` = new (this sprint) · `R` = via relations (not a column) ·
**bold** = renders on a live page now (Project detail); others are
designed-but-dormant until their public page ships.

### 3.1 Project — `content_items` + `projects` (the live, rich target)

| Field | E/N | Column type | Editor control (group) | Public rendering home | Empty behavior |
|-------|-----|-------------|------------------------|-----------------------|----------------|
| **title** | E | `text` (base) | Text (Basics) | H1 | required |
| **slug** | E | `text` (base) | Text (Basics) | URL | required |
| **question** | E | `text` (base) | Textarea (Basics) | "The question that created it" | required to publish |
| **problem** | E | `text` | Textarea (Basics) | one-line thesis under H1 | hide line |
| **overview** | **N** | `text` (markdown) | Markdown + preview (Body) | **reading column body — the "Decisions & trade-offs" spine (docs/24 §10.2)** | hide body |
| **year** | E | `integer` | Number (Dates) | meta row (fallback when no dates) | — |
| **startDate** | **N** | `date` | Date (Dates) | **meta row duration** | fall back to `year` |
| **endDate** | **N** | `date` | Date (Dates) | **meta row: "2025 – present" if null** | "present" |
| **context** | **N** | `text` | Text (Dates & Context) | **meta: "PES coursework / Personal / SahayAI"** | hide |
| **role** | **N** | `text` | Text (Dates & Context) | **meta: "Solo" / "Lead, team of 4"** | hide |
| **collaborators** | **N** | `text[]` | Add/remove rows (Context) | **"With —" line** | hide |
| **tags** (= technologies/stack) | E | `text[]` | Chip add/remove (Basics) | tag row | hide row |
| **skillsLearned** | **N** ⚠ | `text[]` | Add/remove rows (Skills) | **"What it taught" chips** | hide — ⚠ *dedup ruling needed, see §5.1* |
| **repoUrl** | E | `text` | URL (Links) | Evidence: "Source repository ↗" | hide |
| **liveUrl** | **N** | `text` | URL (Links) | **Evidence: "Live demo ↗"** | hide |
| **videoUrl** | **N** | `text` (URL only) | URL (Links) | **Evidence: "Demo video ↗"** (no embed/upload) | hide |
| **coverImage** | **N** | `content_media` role=cover | Media picker (Media) | **detail hero image, above H1** | no image, layout intact |
| **gallery** | **N** | `content_media` role=gallery | Media picker, orderable (Media) | **figure set in body** | hide section |
| **attachments** (PDF) | **N** | `content_media` role=attachment | Media picker (Media) | **Evidence: "Report (PDF) ↗"** | hide |
| **outcomes** | **N** | `text[]` | Add/remove rows (Body) | **"Outcomes" bullet section** | hide section |
| **abandonedBranches** | E | child table | Ordered list (Body) | "Abandoned branches" | hide section |
| **relations** | E | `relations` | Relation builder (Advanced) | Evidence trail (built routes) | hide |
| **projectStatus** | E | `text` | Select (Advanced) | status badge | — |
| **featured** | E | `boolean` | Toggle (Advanced) | index card weight | — |
| **verified** | E | `boolean` | Toggle (Advanced) | (internal; LAW-008) | — |

### 3.2 Publication — `content_items` + `publications`

| Field | E/N | Column type | Editor control | Rendering home (designed — future page) | Empty |
|-------|-----|-------------|----------------|------------------------------------------|-------|
| authors | E | `text[]` | Chip rows | tabular meta | hide |
| venue | E | `text` | Text | meta | hide |
| year | E | `integer` | Number | meta | — |
| pubDate | **N** | `date` | Date | precise date (overrides year display) | fall back to year |
| pubStatus | **N** | `text` `preprint\|published\|under-review` | Select | status badge | default 'published' |
| abstract | E | `text` | Textarea (serif preview) | abstract (editorial serif) | hide |
| plainSummary | E | `text` | Textarea | researcher→engineer bridge | hide |
| doi | E | `text` | Text | meta: DOI link | hide |
| arxivUrl | **N** | `text` | URL | meta: "arXiv ↗" | hide |
| pdfUrl | E | `text` | URL | "PDF ↗" | hide |
| pdf attachment | **N** | `content_media` attachment | Media picker | "PDF ↗" (uploaded alt to pdfUrl) | hide |
| bibtex | E | `text` | Textarea (mono) | "Cite" copy block | hide |
| abandonedBranches | E | child | Ordered list | dead-ends | hide |

### 3.3 Post — `content_items` + `posts`

| Field | E/N | Column type | Editor control | Rendering home (designed — future page) | Empty |
|-------|-----|-------------|----------------|------------------------------------------|-------|
| dek (summary) | E | `text` | Text | standfirst | hide |
| bodyMarkdown | E | `text` | Markdown + preview | reading column | — |
| readingMinutes | E | `integer` (auto) | auto from body | meta | — |
| tags | E | `text[]` | Chip rows | tag row | hide |
| coverImage | **N** | `content_media` cover | Media picker | post hero | no image |
| attachments | **N** | `content_media` attachment | Media picker | "Attachment ↗" | hide |
| relatedLinks | **N** | `content_links` | Label+URL rows | "Related reading" list | hide |
| readingContext | **R** | — | — | **maps to base `question`** (LAW-003) — *not a new column* | — |

### 3.4 Timeline entry — `content_items` + `timeline_entries`

| Field | E/N | Column type | Editor control | Rendering home (designed — future page) | Empty |
|-------|-----|-------------|----------------|------------------------------------------|-------|
| organization | E | `text` | Text | entry org | hide |
| role | E | `text` | Text | entry role | hide |
| startDate / endDate | E | `date` | Date | era range (null end = present) | "present" |
| place | **N** | `text` | Text | "· Bengaluru" | hide |
| summary | E | `text` | Textarea | one-line | hide |
| highlights | **N** | `text[]` | Add/remove rows | bullet list under entry | hide |
| logo/image | **N** | `content_media` cover | Media picker | small entry logo | no logo |
| proofUrl | **N** | `content_links` (label='Proof') | Label+URL row | "Proof ↗" | hide |
| skills used | **R** | — | Relation builder | `evidences` trail — *not a column* | hide |

### 3.5 Skill — `content_items` + `skills`

| Field | E/N | Column type | Editor control | Rendering home (designed — future page) | Empty |
|-------|-----|-------------|----------------|------------------------------------------|-------|
| context | E | `text` | Text | chip context | hide |
| current | E | `boolean` | Toggle | Currently/Previously split | — |
| category | **N** | `text` | Text/Select | skill grouping header | ungrouped |
| sinceYear | **N** | `integer` | Number | "since 2023" | hide |
| evidence (project/paper) | **R** | — | Relation builder | `evidences` → links to proof — *not a column* | hide |

**No skill-bars, no percentages** (docs/24 §10.7 — the #1 template tell, banned).
`evidence note` from the brief is served by the existing `context` field + the
`evidences` relation; no new column.

---

## 4. Version history across the new fields

`content_versions.snapshot` is self-contained JSONB. `buildSnapshot()` (in
`actions/projects.ts`) extends to capture: base row + type row (now with the new
columns) + `abandoned_branches` + `content_media` rows (ids + role + order) +
`content_links` rows. `diffFields()` already diffs every key of base + type +
branches; it gains `contentMedia` and `contentLinks` comparisons. Restore
re-applies all of them in the same transaction (still forcing `status='draft'`).
Media *binaries* are never snapshotted — only the references, because the `media`
row is immutable once uploaded (alt/caption edits create no binary churn). A
Phase 2 acceptance step is a save→edit→restore round-trip proving cover, gallery,
attachments, and links all survive.

---

## 5. What was cut, and one open dedup ruling

### 5.1 `skillsLearned` on Project — ⟨RULED: Option 1⟩

The brief listed both a Project `skillsLearned` list **and** skill↔project via
relations. **Owner ruling (2026-07-12): keep `skillsLearned` as a dedicated
typed field** (`text[]`), distinct from `tags`. Semantics: `tags` =
technologies/topics the project used; `skillsLearned` = what building it taught
the owner (informal takeaways, not registry Skill entities). Formal Skill
entities still use the `evidences` relation. They coexist because they mean
different things (a takeaway vs. a first-class Skill claim). Rendering home: a
self-hiding "What I learned" block on `/projects/[slug]`.

### 5.2 Fields proposed and cut (no honest rendering home)

- **`readingContext` as its own column** — cut; it *is* the origin `question`
  (LAW-003). Reusing the spine field, not duplicating it.
- **`duration` as a stored field** — cut; derived from `startDate`/`endDate` at
  render, never stored (no denormalized truth to drift).
- **`stack` separate from `tags`** — cut; today's `tags` already hold the
  technology list ("Python", "Go", "FastAPI"). A second parallel list is the
  duplicate-column smell. `tags` *is* the structured technologies chip input.

---

## 6. MEDIA ARCHITECTURE — D-049 ⟨PROPOSED, pending ratification⟩

D-013 already ratified the *category*: "S3-compatible object storage (references
in Postgres); optimized variants via image CDN; no DB blobs." This decision picks
the concrete vendor + flow, exactly as D-041 picked Render for D-012's category.

### 6.1 The three options, judged for one maintainer / decade / Render

| | (a) Render persistent disk | (b) S3-compatible object storage | (c) repo-committed `/public` |
|-|----------------------------|----------------------------------|------------------------------|
| Runtime admin upload | ✅ works (writable disk) | ✅ works (SDK PUT) | ❌ **impossible** — Render fs is ephemeral; the repo isn't writable at runtime; uploads would require a git commit |
| Decouples storage from compute | ❌ pinned to one instance | ✅ fully decoupled | ⚠ ships with the app image |
| Backup story | ⚠ Render disk snapshots only | ✅ provider durability (11 nines) + versioning | ✅ git history (but permanent bloat) |
| Migration-out | ⚠ manual copy off the disk | ✅ S3 API is portable (rclone one-liner) | ⚠ binaries wedged in git forever |
| CDN / image optimization | ❌ served from the app process | ✅ CDN edge + next/image | ⚠ served by the app |
| Horizontal scale | ❌ disk attaches to one instance | ✅ any instance count | ✅ |
| Cost at our scale | disk add-on (~$/GB-mo, always paid) | **$0 (free tier)** | $0 but git bloat is a permanent tax |
| Honors D-013 / D-012 | ⚠ partial | ✅ exactly | ❌ contradicts D-013 ("no DB/app blobs") |

**(c) is disqualified by the core requirement** — the sprint mandates auth-gated
*runtime* upload from the admin; Render's filesystem can't accept it and git-as-a-
media-store bloats the repo permanently. **(a) works but couples media to the
compute instance**, gives the weakest backup/CDN story, and quietly re-paints the
D-007 monolith into a stateful single instance.

### 6.2 Recommendation: (b) — **Cloudflare R2**, S3-compatible

- **Zero egress fees.** Images and PDFs are egress-heavy for a decade; R2 charges
  $0 for egress where S3/B2-direct charge per GB. This is the decade-cost killer.
- **10 GB storage + 1M writes + 10M reads free per month** — realistically **$0/mo
  for years** at personal scale. First paid tier is $0.015/GB-mo beyond 10 GB.
- **S3-compatible API** → use the standard `@aws-sdk/client-s3` pointed at the R2
  endpoint. Portable per D-012/D-013: swapping to Backblaze B2 or AWS S3 later is
  an endpoint + credential change, no code rewrite.
- **Backblaze B2** is the documented fallback (also S3-compatible, also cheap via
  the Cloudflare-B2 egress alliance) — if you'd rather not add a Cloudflare account.

**Cost implication for D-041's total:** **+$0/month** at current and foreseeable
scale (R2 free tier). D-041's monthly figure is unchanged. The only new secrets
are R2 credentials — no new *always-paid* line item.

### 6.3 Upload flow security (auth-gated, validated, non-executable)

1. Upload is a **Server Action** behind the iron-session admin gate (D-047) —
   never a public route. Middleware already blocks unauthenticated `/admin/*`.
2. **Content-type verified by magic bytes**, not the client-declared MIME
   (sniff the header: JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `RIFF…WEBP`, PDF
   `25 50 44 46`). Reject anything else.
3. **Size limits enforced server-side:** images ≤ 8 MB, PDFs ≤ 20 MB (reject
   before upload to storage).
4. **Images:** dimensions read via `sharp`; **EXIF stripped** (docs/24 §11.3);
   re-encoded to strip any embedded payload. `width`/`height` persisted.
5. **`alt_text` required** in the upload form for `kind='image'` (DB CHECK +
   app validation) — no image is usable without it.
6. **Storage keys are server-generated** (`{uuid}.{ext}`) — no client-controlled
   path, so no path traversal and no overwrite of another key.
7. Served with correct `Content-Type` and `Content-Disposition: inline` for PDFs;
   the bucket serves static assets only — **nothing uploaded is ever executed**.
8. Published media in a public bucket (unguessable keys); draft-only media MAY use
   short-lived signed URLs — but v1 keeps it simple: public bucket, random keys.

### 6.4 How content references media (CTI discipline)

Via the `content_media` join table (§2.2) — `role` ∈ cover/gallery/attachment,
ordered by `sort_order`, `ON DELETE RESTRICT` for the reference-checked delete.
**No JSONB array of media ids on the content row.** Cover uniqueness is a partial
unique index, not a nullable FK on every type table (one mechanism, uniform).

### 6.6 Backup / export — media is never vendor-hostage (D-049 condition 2)

`npm run media:backup` (`apps/web/scripts/media-backup.ts`) downloads **every**
object in the R2 bucket to local disk, preserving each object's key as its path:

```
npm run media:backup                 # → apps/web/media-backup/
npm run media:backup -- /some/dir    # → a custom directory
```

The result is a complete, portable mirror — re-uploadable to any S3-compatible
store (keys preserved), so the media can move vendors with the content. The
script is self-contained (it does not import the app's server-only storage
module) and reads R2 credentials from `.env.local`. Run it on whatever cadence
you like; there is no lock-in.

### 6.5 Image optimization & budgets (Phase 3 obligation)

- `next/image` with the R2 base in `images.remotePatterns`; the Render Node
  server runs the sharp optimizer. Below-the-fold images `loading="lazy"`
  (next/image default); the cover uses `priority` only if it becomes the LCP.
- **three.js stays absent** from all public First Load JS (the CI guard is
  unaffected — media adds no client JS). `/` stays ~152 kB. `/projects` First
  Load JS is **measured before/after** and reported; images are payload, not JS,
  and lazy below the fold.

---

## 7. Phase 2 / Phase 3 preview (only after ratification)

**Phase 2 (schema + editors):** migration adding the new type columns +
`media`/`content_media`/`content_links`; `db-ingest.ts` maps existing real
content cleanly (new fields start empty — no invented values); editors grouped
**Basics / Dates & Context / Links / Skills / Media / Advanced**, every new field
visibly optional, structured lists get add/remove row controls (no comma hacks
for the new lists); version snapshot/restore extended and round-trip verified.

**Phase 3 (media pipeline + public render):** R2 upload Server Action + media
library (list/delete-with-reference-check) + alt-text-at-upload; Project detail
renders cover / gallery / attachments / duration / context / role / collaborators
/ outcomes / skillsLearned / live+video links — each self-hiding; side-by-side
proof that an empty project renders identically to today; budgets measured and
held; `OWNER_CONTENT_CHECKLIST.md` updated (cover/gallery/PDF/skills are optional
enrichment, not launch-blocking).

---

## Implementation record (Phases 2–3)

- **Schema (migration `0002_romantic_martin_li.sql`):** rich columns on
  `projects`/`publications`/`timeline_entries`/`skills` + `media`,
  `content_media`, `content_links` tables + the `ck_image_has_alt` CHECK, the
  `uq_content_media_cover` partial unique index, and hot-path indexes. Applied.
- **Read path:** `db-content.ts` reads the rich scalar columns on every project
  query and loads cover/gallery/attachments (via `content_media`) on the detail
  path only. `types/content.ts` gained the optional fields + `MediaAsset` /
  `ExternalLink`. `lib/media/url.ts` derives public URLs from the storage key.
- **Editors:** `ProjectEditor` regrouped into Basics / Body / Dates & Context /
  Links / Skills / Media / Advanced; `StringListEditor` (structured rows) for
  collaborators/outcomes/skillsLearned; `MediaPicker` attaches library assets.
  `actions/projects.ts` persists all fields + `content_media`; `buildSnapshot`
  and `restoreVersion` include them (round-trip verified).
- **Media pipeline:** `lib/media/storage.ts` (R2 S3 client, server-only),
  `lib/media/validate.ts` (magic-byte sniff + size limits + sharp EXIF strip),
  `actions/media.ts` (`uploadMedia`, reference-checked `deleteMedia`),
  `/admin/media` library, `queries/media.ts`. `next.config.ts` allow-lists the
  R2 host for `next/image`. `scripts/media-backup.ts` = the one-command mirror.
- **Public render:** `/projects/[slug]` renders cover, duration, context/role/
  collaborators, overview, gallery, outcomes, "What I learned", and live/video/
  PDF evidence — each self-hiding. An empty project renders as before.
- **Budgets:** `/` 152 kB (unchanged); `/projects` 106 kB (unchanged);
  `/projects/[slug]` 106 → 111 kB (+5 kB = `next/image` on the detail route,
  the required optimization path). three.js + admin + aws-sdk all absent from
  every public First Load JS (CI guards pass).
