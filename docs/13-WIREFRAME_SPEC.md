# 13 — Master Wireframe Specification

> **Status:** Approved draft — v1.0 of the structural screen blueprint.
> **Owner:** Deepak (Design) · Authored in the role of Principal Product Designer.
> **Upstream (binding, never contradicted):** [`02-PRODUCT.md`](02-PRODUCT.md) · [`11-SYSTEM_ARCHITECTURE.md`](11-SYSTEM_ARCHITECTURE.md) · [`12-EXPERIENCE_ARCHITECTURE.md`](12-EXPERIENCE_ARCHITECTURE.md) · [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md) · [`04-INFORMATION_ARCHITECTURE.md`](04-INFORMATION_ARCHITECTURE.md).
> **Downstream:** high-fidelity UI design and implementation build from this document without structural assumptions.
> **Notation:** no colors, no typography styling — structure only. `[anim: …]` are placeholders referencing `08` tokens. Viewport heights are estimates (`~NNvh`) for rhythm, not law. ASCII diagrams show desktop unless marked.

---

## 0. Brief Reconciliation

The wireframe brief requested a 12-section landing (Hero · Identity · Current Mission · Featured Research · Featured Projects · Digital Twin Preview · Latest Posts · Latest News · Experience Snapshot · GitHub Activity · Contact · Footer). **D-022 caps the landing at 8 sections.** Nothing is lost — the 12 items map onto the 8 sections:

| Requested | Lives in |
| --- | --- |
| Hero, Identity, Current Mission | **S1 Hero** (identity statement *is* the mission — one sentence, D-022) |
| Featured Projects | **S2 Featured Work** |
| Featured Research | **S3 Research Highlight** |
| Experience Snapshot, GitHub Activity | **S4 Current Focus** (now-strip + latest era + activity sparkline) |
| Latest Posts | **S5 Latest Posts** |
| Digital Twin Preview | **S6 Dex Preview** *(renders only at v1.5 — graceful absence)* |
| Contact | **S7 Contact strip** |
| Footer | **S8 Footer** |
| Latest News | **v2 only** — inserted between S5 and S6 when Radar ships (D-006) |

A 12-section landing averages ~9 viewports of scroll; evaluators abandon before the CTA. Consolidation is the usability position, not a compromise.

---

## 1. Layout Inventory (system-wide)

**Grids**

| Breakpoint | Columns | Gutter | Margin | Container |
| --- | --- | --- | --- | --- |
| Desktop ≥1024 | 12 | 24px | 64px | content 1200 · reading 720 · wide 1440 |
| Tablet 640–1024 | 8 | 20px | 48px | fluid to 1200 |
| Mobile <640 | 4 | 16px | 24px | fluid |
| Large/ultra-wide | 12 (capped) | 24px | grows | containers hold max; space → margin/marginalia (DSVL §13) |

**Rhythm (from DSVL §4, binding):** section gap 96–160 desktop / 48–96 mobile · component gap 24–32 · in-component 4–16 · page-header→content 48–64 · card grid gap 24 (16 mobile).

**Whitespace strategy:** density is a mode — public = comfortable, admin = compact (one spacing token swapped). Empty-feeling layouts are fixed by hierarchy, never ornament.

**Sticky positioning (closed list):** condensed nav (global) · admin left rail · admin table headers · Dex/palette overlays are fixed, not sticky · post/project detail: nav hides on scroll-down, returns on up. **Nothing else sticks.** Sticky sidebars/TOCs were considered for post detail and rejected: at a 720px measure with ≤8-min reads, a TOC is furniture (challenge recorded; revisit for >15-min posts).

**Maximum readable width:** 720px (≈66ch) for all prose, everywhere, including admin previews and Dex answers.

## 2. Component Inventory (wireframe primitives)

Anatomies defined once; screens place them by name. Visual treatment belongs to DSVL §5.

| Primitive | Anatomy (top→bottom / left→right) | Notes |
| --- | --- | --- |
| `NavBar` | wordmark · lanes ×4 · [⌘K trigger] · [theme] · [● Dex v1.5] | 64px tall, condenses to 48px on scroll; mobile: wordmark · search-icon · menu-icon |
| `LaneTabs` | horizontal tab row under page header (2–3 items) | only on sibling lanes (IA §3) |
| `PageHeader` | breadcrumb? · H1 · dek (1 line) · meta row (counts/stamps) | 1 per page; ~160–220px |
| `Footer` | 4 link columns (Work·Research·Writing·Meta) · utility row (RSS·theme·email·outbound) · freshness stamp | identical everywhere; ~320px; minimal variant on /ai |
| `ProjectCard` | title · 1-line problem · year+status chip · relation chips · [whole card = link] | shared-element source |
| `PostRow` | title · dek · date+read-time · tags | no thumbnail (IA) |
| `PubRow` | title · authors (self-highlighted) · venue · year · inline actions (cite·PDF·→) | list semantics |
| `TimelineEntry` | node · role/degree · org · dates · 1-line output · produced-chips · [expand] | one open at a time |
| `SkillRow` | skill · 1-line context · evidence chips | rich (current) / compact (previous) |
| `GalleryTile` | image · [opens Lightbox] | caption lives in lightbox |
| `Lightbox` | image · caption+story · depicts-link · ←/→ · close | focus-trapped dialog |
| `RelatedTrail` | grouped by relation kind · ≤5 + "all related" · never empty (IA §2) | ends every detail page |
| `PrevNext` | ← prev title · next title → | chronological collections |
| `FactsStrip` | label:value pairs, tabular; mono for machine-truth | project/pub details |
| `FilterRow` | tag/status chips · URL-reflected · clear | becomes sheet on mobile |
| `StatStrip` | 2–4 large numbers + labels | no odometers |
| `EmptyState` | drawn illustration · 1 sentence · 1 action | IA §9 copy table |
| `ErrorState` | illustration · sentence · forward paths | IA §10 |
| `Skeleton*` | per-primitive geometry match | zero CLS (Law 16) |
| `DexDot` | presence mark · breathing | nav + affordances |
| `DexPanel` | header (● Dex · [history v2] · close) · message list · citations block · follow-up chips · input | side panel 400–480px / bottom sheet mobile |
| `Palette` | input · grouped results (Pages·Content·Actions·Ask Dex) · hint row | overlay 640×~480 max |
| `AdminRail` | dashboard · 9 content types · media · analytics · knowledge(v1.5) · settings | 240px; collapses to icons 64px |
| `AdminTable` | sticky header · compact rows (title·status·updated·actions) · pagination | keyboard row-nav |
| `EditorForm` | fields per type · markdown body+preview toggle · relations editor · media picker · version rail · publish bar | one grammar, 9 types |
| `PublishBar` | autosave stamp · draft/schedule/publish · status badge | sticky bottom of editor |
| `VersionRail` | version list · diff view · restore | expandable right rail |
| `RelationsEditor` | typed pickers (implements/writes-about/…) · reciprocal preview | first-class field |

## 3. Screen Archetypes

Five archetypes carry the 26 screens. Each screen below states its archetype + deltas only.

**A — Index** `NavBar → PageHeader(+LaneTabs?) → [FilterRow?] → collection (grid|list) → Footer`
Scroll: single region · interaction zones: filter row, cards/rows · keyboard: Tab through collection in DOM order, `/`-searchable via palette.

**B — Detail** `NavBar → breadcrumb+PageHeader → [FactsStrip?] → body (720 reading) → [media] → RelatedTrail → PrevNext → Footer`
Nav hides on scroll-down (posts/projects only) · shared-element arrival · keyboard: `←/→` prev/next.

**C — Single-surface** (Contact, Skills, GitHub, 404, Login) `NavBar → PageHeader → 1–3 purpose blocks → Footer`
Fits ~1–2 viewports; no storytelling.

**D — Tool** (Admin, /ai) `chrome-minimal · persistent rail or pinned input · compact density · state-first`
No marketing sections, no reveals; `[anim: none]` except state feedback.

**E — Overlay** (Palette, Dex panel, Lightbox, dialogs) `fixed · scrim · focus-trap · Esc + return-to-trigger`
Never navigates the page under it without explicit action.

**Global keyboard grammar** (all screens, from IA §3): `⌘K` palette · `Esc` close/return · `Tab` = DOM = priority order · `g`-chords · skip-link first Tab · focus ring never suppressed.

---

## 4. Screen Specifications

### 4.1 Landing — `/` *(bespoke; the only non-archetype public screen)*

Purpose: 90-second comprehension → route personas. Grid: 12-col/1200. CTA: **View work** · secondary: **Download CV**.

```
┌────────────────────────────────────────────────┐
│ NavBar                                          │ sticky
├────────────────────────────────────────────────┤
│ S1 HERO                                  ~85vh │
│   [name]                                        │
│   [identity sentence = mission]   (cols 1–9)    │
│   [current-focus line ← skills data]            │
│   [View work] [Download CV]                     │
│   [anim: hero-cinematic, behind text, ≤2s]      │
├────────────────────────────────────────────────┤
│ S2 FEATURED WORK                         ~70vh │
│   H2 · dek                                      │
│   [ProjectCard]  [ProjectCard]   (2-up, 6+6)    │
│   [ghost: All projects →]                       │
├────────────────────────────────────────────────┤
│ S3 RESEARCH HIGHLIGHT                    ~50vh │
│   H2 · theme block (cols 1–7)                   │
│   StatStrip: pubs·venues·years (cols 8–12)      │
│   [ghost: Explore research →]                   │
├────────────────────────────────────────────────┤
│ S4 CURRENT FOCUS                         ~40vh │
│   now-strip (skills-current) (cols 1–6)         │
│   latest TimelineEntry (cols 7–9)               │
│   GitHub sparkline+stamp (cols 10–12)           │
├────────────────────────────────────────────────┤
│ S5 LATEST POSTS                          ~35vh │
│   PostRow ×3 · [ghost: All posts →]             │
├────────────────────────────────────────────────┤
│ S6 DEX PREVIEW (v1.5 only)               ~30vh │
│   ● one-line intro · 3 question chips           │
│   [chip → opens DexPanel with question]         │
├────────────────────────────────────────────────┤
│ S7 CONTACT STRIP                         ~25vh │
│   sentence · email(copy) · [Contact →]          │
├────────────────────────────────────────────────┤
│ S8 Footer                                       │
└────────────────────────────────────────────────┘
```

| S | Purpose | Priority | Anim | Exit/Interaction | Deps | Future |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | identity in frame one | 1 | cinematic behind text, once | CTAs; scroll | skills(current) feed | v1.5: none — hero never gains sections |
| S2 | proof of building | 2 | reveal-once @base | cards → detail (shared-element) | admin featured flag | 3rd card slot |
| S3 | proof of research | 3 | reveal-once | theme → /research | themes + pub counts | per-theme rotation |
| S4 | currency (PRD G2) | 4 | none (data is still) | chips → timeline/skills/github | 3 data feeds + cache | presence-honesty (XA §13) |
| S5 | writing door | 5 | none | rows → posts | posts feed | — |
| S6 | Dex introduction | 6 | dot breathing only | chips → panel | Dex live | v2: history resume |
| S7 | collaboration close | 7 | none | copy / contact | — | — |

**Why this order:** identity before evidence (nothing matters until *who* is answered) → building before research (broadest audience first; researchers will scroll, recruiters won't) → currency immediately after proof (the "is this current?" doubt strikes once credibility forms) → writing as depth-door → Dex only after the visitor has seen what it can talk about → contact once there's a reason to act. Mobile: identical order (priority = DOM = stacking, IA law); S3 stat strip stacks under theme; S4 stacks 3-up vertically.
Tablet: S2 cards 2-up (4+4); S4 becomes 2+1 rows. Sticky: nav only. Expandable: none — the landing is doors, not drawers.

### 4.2 About — `/about` *(B-detail, reading)*
`PageHeader(portrait right, cols 10–12; text 1–8) → LaneTabs(About·Timeline·Skills) → narrative (720, ~3 viewports) → "How I work" list → CV block (download + stamp) → RelatedTrail(era/theme chips) → Footer`.
CTA: Download CV. Anim: none after load (reading page). Mobile: portrait above H1, ~30vh max. Keyboard: standard. Future: colophon link in footer of narrative.

### 4.3 Projects — `/projects` *(A-index)*
`PageHeader + count → LaneTabs(Projects·GitHub) → Featured (≤2 wide cards, 6+6) → FilterRow (tags·status, URL) → Grid 3-up (4+4+4) → Footer`.
Interaction zones: filter chips (instant, no reload), whole-card links. Tablet 2-up; mobile 1-up, FilterRow → sheet triggered by [Filter] button. Empty: IA §9. Skeleton: 6 card ghosts.

### 4.4 Project Detail — `/projects/[slug]` *(B-detail, reference layout)*

```
┌ NavBar (hide-on-scroll-down) ──────────────────┐
│ breadcrumb: Projects / [title]                  │
│ H1 · dek · year · status · tags        ~25vh   │
├─ FactsStrip: role|stack|timeframe|links ~10vh  ─┤
├─ BODY (720 col)                        ~4–6vp  ─┤
│   Problem → Approach → Decisions &              │
│   trade-offs → Outcome → "What I'd change"      │
│   [framed media between blocks, cols 2–11]      │
├─ RelatedTrail (typed groups)            ~30vh  ─┤
├─ PrevNext ──────────────────────────────────────┤
└─ Footer ────────────────────────────────────────┘
```
CTA: Visit repo (in FactsStrip + end of Outcome). Anim: shared-element arrival; body still. Expandable: none (long-form is honest scroll). Mobile: FactsStrip → stacked label:value pairs. Deps: relations, media service. Future: inline demo embed slot after Outcome.

### 4.5 Research — `/research` *(A-index variant: narrative blocks)*
`PageHeader + one-liner → LaneTabs(Research·Publications) → ThemeBlock ×N (current-first: name · question 2–3 sent · drawn motif cols 9–12 · pub/project chips · status) → Trajectory paragraph → Footer`.
Anim: motifs `[draw-in @narrative, once]` — the one non-landing scrollytelling license (XA §6). Each ThemeBlock ~45vh. Mobile: motif above text, ~25vh. Future: theme detail pages if themes exceed ~5.

### 4.6 Publication List — `/publications` *(A-index, rows)*
`PageHeader + per-year count strip → year group (H2 = year) → PubRow ×N → Footer`.
No FilterRow until >25 entries (IA challenge, upheld). Interaction: inline copy-cite (announces success), PDF, row → detail. Zero animation (evidence is still). Mobile: actions collapse to overflow menu on row.

### 4.7 Publication Detail — `/publications/[slug]` *(B-detail)*
`breadcrumb → H1(full title) · full authors · venue+year → Abstract (720) → Citation block (formatted + BibTeX, copy buttons, mono) → Links strip (PDF·venue·code·dataset) → Plain-language summary (2–3 sentences) → RelatedTrail → Footer`.
CTA: copy citation / PDF. Must stand alone (cold external arrivals). Anim: none. Future: altmetrics line under venue.

### 4.8 Posts Feed — `/posts` *(A-index, rows)*
`PageHeader + [RSS] → PostRow ×N (reverse-chron) → FilterRow(tags, URL) → Footer`. Pagination: load-more (not infinite — footer must stay reachable; challenge to infinite-scroll recorded). Mobile: rows full-bleed within margins.

### 4.9 Post Detail — `/posts/[slug]` *(B-detail, reading reference)*
`breadcrumb → H1 · dek · date · read-time · tags → BODY (720; code blocks per DSVL; framed figures; footnotes: popover-on-focus + endnotes) → end-block: RelatedTrail + PrevNext + RSS line → Footer`.
Nav hide-on-scroll. No sticky TOC (§1). No in-flow CTAs (reading is never interrupted). Perf: SEO workhorse — no third-party in reading path. Future: series navigation slot above end-block.

### 4.10 Gallery — `/gallery` *(A-index, tiles; v1.5)*
`PageHeader (one humble line) → tile grid 3-up/2-up/1-up → [optional contained filmstrip — the product's only horizontal scroll] → Footer`. Lightbox (E-overlay): image · caption+story · depicts-link · ←/→ · Esc. All tiles lazy; luminance-capped dark mode.

### 4.11 Skills — `/skills` *(C-single)*
`PageHeader + last-updated stamp (the point) → LaneTabs → CURRENTLY (SkillRow rich ×N) → PREVIOUSLY (SkillRow compact ×N, visually receded) → Footer`. No bars, no clouds (IA, upheld). Interaction: evidence chips → artifacts. ~2 viewports total.

### 4.12 Experience Timeline — `/timeline` *(bespoke list)*
`PageHeader → Timeline: drawn line (aria-hidden) + era labels + TimelineEntry ×N (recent-first; accordion, one open) → CV line → Footer`.
Anim: line `[draw-in @narrative, once]`; entries `[reveal-once]`. Expandable: entries (disclosure pattern). Mobile: line tightens left-aligned, entries full-width. Keyboard: entries are buttons; ↑/↓ moves, Enter toggles.

### 4.13 GitHub — `/github` *(C-single, data)*
`PageHeader + last-synced stamp (mono) → activity strip (system-style heatmap/sparkline, cols 1–12, ~25vh) → repo cards 2-up → language bar (direct-labeled) → Footer`.
All from cache (D-010); no odometers; sync-failure state per IA §10. Interaction: repo cards outbound + project-chip inbound.

### 4.14 AI Assistant — `/ai` *(D-tool; the centerpiece; v1.5)*

```
┌ NavBar ────────────────────────────────────────┐
│ ┌──────────────────────────────┬─────────────┐ │
│ │ IDENTITY AREA          ~15vh │ CONTEXT     │ │
│ │  ● Dex (breathing dot)       │ PANEL       │ │
│ │  1-line self-intro (D-015)   │ (cols 9–12) │ │
│ │  knowledge-freshness stamp   │             │ │
│ ├──────────────────────────────┤ Sources in  │ │
│ │ CONVERSATION AREA            │ this convo  │ │
│ │  (cols 1–8, 720 max)         │ [cited pages│ │
│ │                              │  as links]  │ │
│ │  empty = 4–6 suggested       │             │ │
│ │  prompt chips spanning       │ Recommended │ │
│ │  narrative arc               │ [ProjectCard│ │
│ │                              │  mini ×2]   │ │
│ │  messages:                   │ [PubRow     │ │
│ │   answer (streamed)          │  mini ×2]   │ │
│ │   citations block            │ ← fed by    │ │
│ │   follow-up chips ×2–3       │   retrieval │ │
│ │   [take me there →]          │             │ │
│ ├──────────────────────────────┤ [history    │ │
│ │ INPUT (pinned bottom)        │  — v2 slot] │ │
│ │  field · send · [stop]       │ [voice — ▷  │ │
│ │  scope note under input      │  future]    │ │
│ └──────────────────────────────┴─────────────┘ │
│ Footer (minimal variant)                        │
└────────────────────────────────────────────────┘
```

- **Scroll regions:** conversation list only (page itself ~static); context panel independently scrollable.
- **States:** idle (chips) · thinking (dot deepens + "thinking…" text) · streaming (plain render + [stop]) · no-answer (in-character decline + nearest-topic redirect, IA §10) · offline (page renders scope note + "resting" line + site links — never a dead app) · slow (>8s timeout + retry).
- **Context panel population:** retrieval results drive Sources; recommendations = top related artifacts of cited content (graph traversal, IA §8). Collapses under tablet → inline "sources" rows beneath each answer; mobile = DexPanel bottom-sheet grammar instead of this page? **No** — `/ai` exists on mobile as a full screen: identity area compresses to one row, context panel becomes per-answer source rows, input pinned above keyboard.
- **Keyboard:** field autofocus; ↑ edits last question; Esc stops generation then closes; citations tabbable in order; live-region announcements chunked.
- **Future slots (reserved, empty):** conversation history rail entry (v2 memory), voice mode toggle (▷ placeholder in input row), "remember this conversation" header slot.

### 4.15 News / Radar — `/news` *(A-index, rows; v2)*
`PageHeader + freshness stamp (auto-hide page from nav if stale, D-006) → week group (H2 = week) → NewsRow (title·source·category tag·date·[bookmark]) ×N → FilterRow(categories) → bookmarks entry → digest line (future) → Footer`. Bookmark = anonymous token; interaction zone on row end.

### 4.16 Contact — `/contact` *(C-single, ~1.5 viewports)*
`PageHeader ("what's welcome" line) → DIRECT block (email + copy — above the form, IA upheld) → FORM (name·email·message, 3 fields only; inline validation; button carries in-flight state) → ELSEWHERE row (GitHub·Scholar·LinkedIn·CV) → Footer`.
Sent-state: replaces form — confirmation + "what happens next" `[anim: celebration @base — 1 of 2 permitted]`. Keyboard: form is the page; correct input types.

### 4.17 Search Results — `/search` *(A-index, grouped)*
`Search field (autofocus, `/` shortcut, URL ?q=) → type filter chips → result groups (Pages·Projects·Publications·Posts·…) each: H2 + count + rows with FTS snippets → "Ask Dex instead →" quiet row (v1.5) → Footer`.
States: no-query (suggested searches + recent) · no-results (IA §10: suggestions + reset + Dex hand-off) · loading (row skeletons, debounced). Keyboard: ↑/↓ traverses results, Enter opens.

### 4.18 Command Palette *(E-overlay)*

```
┌──────── scrim (page visible below) ────────┐
│ ┌────────────── 640px ──────────────┐      │
│ │ [input: search or command…]        │      │
│ │ ── PAGES ────────────────────────  │      │
│ │  → route rows                      │      │
│ │ ── CONTENT ──────────────────────  │      │
│ │  → title + snippet rows            │      │
│ │ ── ACTIONS ──────────────────────  │      │
│ │  → copy citation·CV·theme·RSS·email│      │
│ │ ── ASK DEX (v1.5) ───────────────  │      │
│ │  → "ask: ⟨query⟩" hand-off row     │      │
│ │ hint row: ↑↓ navigate · ↵ open ·   │      │
│ │           esc close                │      │
│ └───────────────────────────────────┘      │
└────────────────────────────────────────────┘
```
Opens ⌘K/trigger `[anim: @base]`; glass treatment (one of two, D-020). Focus-trapped; Esc → return-to-trigger; recent-first within groups on reopen; max height ~480px, groups scroll internally. Mobile: full-screen sheet from search icon.

### 4.19 404 / 500 / Offline *(C-single)*
`NavBar (full, never hidden) → illustration (~20vh) → one honest sentence → forward paths: search field (404) · lane links ×4 · "email me" (500) → Footer (full — max wayfinding at the moment of loss)`. No animation. Copy per IA §10.

### 4.20 Admin Dashboard — `/admin` *(D-tool, compact, 1440 wide)*

```
┌──────┬─────────────────────────────────────────┐
│ Admin│ H1 Dashboard          [⌘K] [view site →] │
│ Rail │ ┌─ FRESHNESS BOARD ──────────── ~30vh ─┐ │
│ 240px│ │ stale warnings (amber rows):          │ │
│ st-  │ │ "Skills — 34 days" [update →] …       │ │
│ icky │ └───────────────────────────────────────┘ │
│      │ ┌─ QUICK CREATE ─────────────── ~10vh ─┐ │
│ dash │ │ [+Post] [+Project] [+Pub] [+…]        │ │
│ 9    │ └───────────────────────────────────────┘ │
│ types│ ┌─ DRAFTS & SCHEDULED ───────── ~25vh ─┐ │
│ media│ │ AdminTable: title·type·status·date    │ │
│ ana- │ └───────────────────────────────────────┘ │
│ lytic│ ┌─ ANALYTICS GLANCE ─┬─ SYNC STATUS ───┐ │
│ knowl│ │ sparklines·top now │ github·embed·news│ │
│ sett-│ │ (tables-first)     │ last-run stamps  │ │
│ ings │ └────────────────────┴──────────────────┘ │
└──────┴─────────────────────────────────────────┘
```
Priority: freshness → create → queue → glance (greets with *what needs attention*, PRD). Rail collapses to icon column ≤1024; mobile admin = rail becomes bottom tabs (dashboard·content·media·more) — functional, not optimized (admin is desktop-primary; challenge: building a full mobile admin is scope the PRD's one-user reality doesn't justify — mobile covers triage + quick edits).

### 4.21 Admin CRUD — `/admin/[type]` *(D-tool; one grammar × 9 types)*
**List view:** `H1(type)+count · [+New] · search-within · AdminTable (title·status badge·updated·actions: edit·view·history·delete-confirm) · pagination`. Keyboard: ↑/↓ rows, Enter edit, ⌘N new.
**Editor view:**
```
┌ Rail ┬ EDITOR (720 form col) ──────┬ VERSION RAIL ┐
│      │ breadcrumb: type / title    │ (collapsed   │
│      │ [fields per content type]   │  by default) │
│      │ [markdown body ⇄ preview]   │ v12 · now    │
│      │ [RelationsEditor: typed     │ v11 · date   │
│      │  pickers + reciprocal view] │ [diff][rest] │
│      │ [media picker → library]    │              │
│      ├─ PublishBar (sticky bottom) ┤              │
│      │ saved-stamp · Draft·Sched·  │              │
│      │ Publish · status            │              │
└──────┴─────────────────────────────┴──────────────┘
```
Autosave (honest stamp, mono); schedule = date-picker inline in PublishBar; publish fans out per architecture §3. Draft/version/schedule behaviors identical across all 9 types — learn once. Delete: type-name-to-confirm dialog (E-overlay). Type-specific field deltas live in each `specs/*.md`.

### 4.22 Admin Media — `/admin/media`
`H1 + [Upload] (drag-drop zone, whole main area accepts drop) · FilterRow(type·usage) · tile grid (thumb·filename·size·used-in count) · detail drawer (preview·alt-text field — required before use·usage list·replace·delete)`. Alt-text enforcement at the library level is the a11y chokepoint.

### 4.23 Admin Analytics — `/admin/analytics`
`H1 + range picker · StatStrip (views·visitors·CV downloads·contact sends) · top content AdminTable · referrers table · per-content sparkline drawer`. Tables-first (DSVL §11); aggregate-only (privacy, PRD); no real-time dashboard theater — daily granularity.

### 4.24 Admin Knowledge — `/admin/knowledge` *(v1.5)*
`H1 + corpus freshness stamp · coverage table (content type·items·chunks·last-embedded·[re-embed]) · uploaded documents section (+upload: CV, PDFs → corpus per architecture §11) · TEST CONSOLE (ask-as-visitor field → answer + retrieved chunks + gate-pass indicator) · decline-log review (questions Dex refused — gap discovery)`. The test console is the trust tool: every content change can be verified against Dex before visitors meet it.

### 4.25 Admin Settings — `/admin/settings`
`profile/canonical bio fields · site settings (title·social links·CV file) · integrations (GitHub token·LLM keys — masked) · Dex guardrails (read-only D-015 rules display) · appearance defaults · danger zone (export all content — the own-your-data PRD promise, JSON+markdown)`. Export is not a nice-to-have; it is the canonical-record insurance.

### 4.26 Login — `/login` *(C-single, centered 400px)*
`wordmark · email · password · [MFA slot] · submit · rate-limit courtesy`. No public links here; errors never confirm account existence.

### 4.27 Cross-cutting: Loading / Empty / Error states
- **Loading:** every A-index ships `Skeleton*` ghosts matching its primitive (6 cards / 8 rows); B-detail: header renders instantly (SSG), media lazy; D-tool: table skeletons; sub-150ms = no loader (Law).
- **Empty:** per IA §9 table — `EmptyState` primitive placements: index pages center it in the collection zone (~40vh); Dex's empty state *is* the prompt chips; admin lists center it with [+New].
- **Error:** per IA §10 — inline for zones (GitHub strip failure shows stamp+last-good in place, page otherwise healthy); page-level only for 404/500. Errors never take more layout than the content they replace.

## 5. Interaction Inventory

| Interaction | Zones | Behavior |
| --- | --- | --- |
| Whole-card link | all cards/rows | single target; inner links (chips) stop propagation |
| Chip → filter | FilterRows | instant, URL-reflected, no reload |
| Chip → relation | trails, cards | navigates; shared-element where card-sourced |
| Copy actions | citations, email, code | `[anim: copy→check @fast]` + announce |
| Expand/disclose | timeline entries, admin drawers | one-open accordion (timeline); independent (admin) |
| Hover | cards, rows, nav | tone-step in @fast out @instant; never gates content |
| Drag | admin media upload only | whole-zone drop target |
| Swipe | lightbox (native), sheets | system gestures only (IA §11) |
| Long-form scroll | B-details | nav hide/return; no other scroll listeners |
| Overlay lifecycle | palette·Dex·lightbox·dialogs | trap → Esc → return-to-trigger, always |
| Stop generation | Dex | [stop] + Esc; "stopped — finish?" affordance |

## 6. Responsive Blueprint (summary)

| Screen | Desktop → Tablet → Mobile deltas |
| --- | --- |
| Landing | 12-col compositions → stacked pairs → single column in priority order |
| A-indexes | 3-up → 2-up → 1-up; FilterRow → [Filter] sheet |
| B-details | reading col constant; FactsStrip pairs → stacked; media full-width |
| /ai | conversation+context → context inline per-answer → full-screen, input above keyboard |
| Palette | centered overlay → full-screen sheet |
| Admin | rail 240 → icon rail 64 → bottom tabs (triage-grade mobile) |
| Global | nav lanes → sheet; 44px targets; hover-independence everywhere |

## 7. Future Extensibility & Implementation Notes

**Extensibility:** new content types inherit archetype A+B + the admin grammar (§4.21) — a new type costs: fields definition, card/row primitive variant, spec file. Reserved slots are marked throughout (hero never gains sections; landing v2 News slot; /ai voice + history slots; post series slot; project demo slot). The knowledge map (XA §13) will be a new bespoke screen — nothing here constrains it.

**For the high-fidelity designer (human or AI):**
1. Apply DSVL tokens to these structures — nothing here may move, reorder, or merge without a D-entry; visual treatment is entirely yours within DSVL law.
2. Design states in this order per screen: default → empty → loading → error → reduced-motion. A screen isn't done at "default."
3. The four grammar-setters (Landing, Project Detail, Post Detail, Admin Editor) are designed first and reviewed against DSVL's 25 laws before any other screen starts — every later screen is a remix.
4. Wireframe fidelity of this spec = structure + behavior. Where a measurement is absent (exact paddings within primitives), the DSVL spacing scale is the palette; invent nothing off-scale.
5. Honest-state rule: every async zone (GitHub strip, sync stamps, Dex, autosave) shows *when* it last succeeded, in mono. If a design hides the stamp, it contradicts D-010/PRD-freshness and fails review.
