# 04 — Information Architecture & UX Blueprint

> **Status:** Approved draft — v1.0 of the structural blueprint.
> **Owner:** Deepak (UX) · Authored in the role of Principal UX Architect.
> **Upstream (binding):** [`02-PRODUCT.md`](02-PRODUCT.md) (PRD) · [`11-SYSTEM_ARCHITECTURE.md`](11-SYSTEM_ARCHITECTURE.md) (system) · [`12-EXPERIENCE_ARCHITECTURE.md`](12-EXPERIENCE_ARCHITECTURE.md) (XA) · [`03-DESIGN_LANGUAGE.md`](03-DESIGN_LANGUAGE.md) (DSVL).
> **Downstream:** wireframes, `specs/*`, and implementation build from this document. Structural changes require a [`../memory/DECISIONS.md`](../memory/DECISIONS.md) entry.
> This document discharges the XA's obligations to `docs/04`: routes, content model, relation taxonomy, palette sources.

---

## 0. Structural Position — assumptions challenged

1. **Search is a page, not only a palette.** XA §4 makes the palette the accelerator but never the sole path. `/search` exists as the visible, linkable, SEO-legible fallback; the palette is its keyboard skin. One index, two skins.
2. **The landing carries 8 sections, not 11.** The brief's example lists Hero, Mission, Featured Work, Research Highlight, AI Preview, Latest Posts, Current Focus, News Preview, Footer. Cut: *Mission* (merged into the Hero — a separate mission section is marketing-speak the PRD's tone forbids), *News Preview* (News is v2/D-006; a stub violates graceful absence — the section appears when Radar ships). *AI Preview* appears only at v1.5 with Dex. A landing that scrolls forever buries the 90-second goal.
3. **Skills and Timeline stay separate pages but share a spine.** Considered merging (skills are temporal too); rejected — evaluators scan skills as a checklist (seconds), timeline as a narrative (minutes). Different questions, different pages, heavy cross-linking instead.
4. **Settings is not a public page.** Public "settings" = theme toggle (nav/footer) + reduced-motion (OS-inherited). A settings *page* exists only in the admin. The future visitor-preferences surface (XA §13 lenses) would live in the palette, not a page.
5. **Every page has one clear purpose** — enforced below: each blueprint opens with a single primary goal; anything serving a second goal equally was split or cut.

---

## 1. Sitemap & Route Map

```
PUBLIC (v1.0 unless marked)
/                         Landing — 90-second comprehension
/about                    Narrative + CV
/projects                 Project index
/projects/[slug]          Project detail
/research                 Research themes (narrative)
/publications             Publication records (index)
/publications/[slug]      Publication detail
/posts                    Post index
/posts/[slug]             Post detail
/timeline                 Experience timeline
/skills                   Current / previous capabilities
/github                   GitHub signal (cached)
/gallery                  Visual record                    (v1.5)
/ai                       Dex — full conversation surface  (v1.5)
/news                     Radar                            (v2)
/contact                  Contact + CV
/search                   Site-wide search (palette's visible twin)

UTILITY
/rss.xml                  Posts feed (+ per-type feeds future)
/cv                       Canonical CV download (redirect/asset)
/404 /500 /offline        Error surfaces

PRIVATE
/admin                    Dashboard (freshness-first)
/admin/[content-type]     Managers: projects·posts·publications·
                          timeline·skills·gallery·news(v2)
/admin/media              Media library
/admin/analytics          Analytics
/admin/knowledge          Dex knowledge base            (v1.5)
/admin/settings           Site settings, profile, theme
/login                    Admin authentication
```

**URL rules:** lowercase kebab-case slugs, human-readable, permanent (slug changes create redirects — stable URLs are a PRD trust surface). Detail routes are shallow (`/posts/[slug]`, no date folders — dates change nothing and lengthen URLs). No `/blog` alias; the canonical vocabulary is *posts*.

**Page hierarchy (3 levels, never deeper):**
Level 0: Landing · Level 1: lanes (indexes + single-surface pages) · Level 2: details. The admin mirrors this: dashboard → manager → editor.

## 2. Content Model & Relation Taxonomy

The graph the XA promised ("the graph, not the pages, is the OS"), made concrete. Entities map to the architecture's `content_items` spine; relations map to its `relations(from, to, kind)` table.

**Entities:** `project` · `publication` · `post` · `timeline_entry` · `skill` · `gallery_item` · `news_item` (v2) · `document` (CV, uploads → Dex corpus) · `page` (about, etc.).

**Relation kinds — the closed set (additions need a decision entry):**

| Kind | From → To | Surfaced as |
| --- | --- | --- |
| `implements` | project → publication | "Built from this research" / "Implemented in" |
| `writes-about` | post → project·publication | "Read the story" / "Posts about this" |
| `produced` | timeline_entry → any artifact | "From this period" / era chips on artifacts |
| `evidences` | skill → project·publication·post | "Proof" links (DSVL Law 17) |
| `depicts` | gallery_item → any | "The context behind this photo" |
| `references` | any → any | Generic "Related" (used sparingly — prefer typed kinds) |

**Traversal is always bidirectional** (one stored edge renders on both ends). **Related-trail rule:** every detail page renders its typed relations grouped by kind, capped at ~5 with "all related," and never empty — if an item has zero edges, the trail falls back to siblings (same type, adjacent). Relations are edited in the admin as a first-class field on every content type.

## 3. Navigation Architecture

**Global nav (the slim bar — XA §4, DSVL §5):** wordmark → `Work` (Projects) · `Research` · `Posts` · `About` → [⌘K trigger] · [theme] · [● Dex, v1.5]. **Four lanes, not fourteen** — the bar carries entry points, not the sitemap. Timeline, Skills, Publications, Gallery, GitHub, Contact are reached through their parents, the footer, and the palette: Publications lives inside Research's header as a sibling tab; Timeline+Skills are About's siblings; GitHub is Projects' sibling. Sibling tabs render as a quiet secondary row on those lanes ("lane tabs").

**Context navigation (primary layer):** lane tabs · related trails (§2) · prev/next within a collection (posts, projects — chronological) · era chips · "Ask Dex about this" (v1.5).

**Breadcrumbs:** detail pages only, single level (`Projects / Metric Learning at Scale`) — depth is 3 levels max, so full trails are noise. Index and single-surface pages have none.

**Search:** `/search` page + palette (§8). Search icon in the condensed mobile bar.

**Command palette (⌘/Ctrl+K, visible trigger):** sources — (1) routes/pages, (2) all published content titles + FTS snippets, (3) actions: copy citation, download CV, toggle theme, copy email, subscribe RSS, (4) "Ask Dex →" hand-off (v1.5). Grouped exactly in that order; recent-first within groups on reopen.

**Keyboard grammar:** `⌘K` palette · `/` focuses search on `/search` · `Esc` closes overlays (return-to-trigger) · `←/→` prev/next on details · `Tab` order = §5 reading order · `g` then `p/r/a…` go-to chords (power layer, documented in palette hint row).

**Footer (the sitemap of record):** all public routes in four columns (Work · Research · Writing · Meta), RSS, theme toggle, email, GitHub/Scholar/LinkedIn outbound, "last updated" freshness stamp, colophon link (future). The footer is identical on every public page — it is the safety net that makes the 4-lane bar viable.

**AI access:** §9. **Quick actions:** the palette's action group is the canonical home; page-contextual quick actions (copy citation on publications, copy email on contact) render inline where the artifact lives.

## 4. Shared Page Grammar & Hierarchies

Defined once; every blueprint below inherits it (deviations are called out per page).

**Section hierarchy:** `Nav → [Breadcrumb] → Page header (H1 + one-line dek + meta) → Primary content sections → Related trail → Forward path → Footer`. One H1 per page (DSVL). Sections separated by §4-DSVL rhythm (96–160px desktop), confirmed by hairlines only in dense contexts.

**Component hierarchy (per section):** `Section label (H2) → optional dek → content components (cards/prose/table/timeline) → section-level action (ghost "All →")`. Cards within a section are homogeneous — never mixed types in one grid.

**Priority hierarchy:** each page declares its information priority (below) as a numbered list; wireframes must order the DOM — and therefore reading order, tab order, and mobile stacking — by that list. **Priority = DOM order = mobile order.** No exceptions; this single rule is most of the accessibility and responsive work.

**Spacing hierarchy:** DSVL scale; within-component 4–16 · between components 24–32 · between sections 96–160 · page header to content 48–64. Reading columns 720px; index grids in the 1200 container; admin in the 1440 wide container, compact density.

**Interaction hierarchy:** (1) read — zero interaction required for any content; (2) navigate — cards, trails, tabs; (3) act — one primary CTA per page (DSVL Law 7); (4) accelerate — palette, chords, Dex. Lower layers never depend on higher ones.

**Scroll defaults:** scrolling starts immediately (no full-viewport lock-ups except the landing hero's single screen); sticky = condensed nav only (plus admin table headers); reveals per `08` (once, ≤16px); every page concludes with forward path + footer — no dead ends.

## 5. Page Blueprints

Format: **Goal** (primary · secondary) / **Audience** / **Questions** the page must answer / **Priority** (= DOM = mobile order) / **CTA** / **Entry → Exit** / **Sections** / **Scroll** / notes (a11y · responsive · perf) only where they exceed the grammar. Emotional objectives live in XA §3 and are not repeated.

### `/` — Landing
- **Goal:** 90-second comprehension · route each persona to their lane.
- **Audience:** all personas, zero context; the most skeptical page-view in the product.
- **Questions:** Who is this? Researcher or engineer? Any good? Current? Where do I go?
- **Priority:** 1 identity 2 proof-of-work 3 proof-of-research 4 currency 5 depth-paths 6 contact.
- **CTA:** primary "View work" · secondary CV download (evaluator shortcut, XA §2).
- **Entry:** external (résumé, search, social) → **Exit:** any lane; contact; palette.
- **Sections:**
  1. **Hero** — name, one-sentence identity (researcher × engineer), current-focus line (from Skills data), two actions (View work / Download CV). Identity legible frame-one; the one permitted cinematic layers behind (XA §6). *Mission lives in the hero sentence — no separate section (§0.2).*
  2. **Featured Work** — 2–3 curated project cards (admin-flagged), each showing its `implements` chip.
  3. **Research Highlight** — 1 theme + top publications count/venues strip; door to `/research`.
  4. **Current Focus** — "Now" strip from Skills(current) + latest timeline entry + GitHub activity sparkline; the freshness signal (PRD G2).
  5. **Latest Posts** — 2–3 title-rows (not cards — writing sells by title).
  6. **Dex Preview** *(v1.5)* — one-line introduction + 3 example questions as chips → opens panel with that question. Absent in v1.0, per graceful absence.
  7. **Contact strip** — one sentence + email + contact link.
  8. **Footer.**
- **Scroll:** story begins immediately below hero (problems→proof arc via section order); reveals per `08` once; hero is the only near-viewport-height section; pauses expected at Featured Work and Current Focus; concludes at contact strip.
- **Perf:** the product's fastest page — SSG, hero image/none, cached GitHub sparkline; LCP is the H1, not media.

### `/about` — About
- **Goal:** the human narrative · canonical bio + CV.
- **Audience:** evaluators post-landing; anyone asking "who, really?"
- **Questions:** Trajectory? Motivation? How does he think? Where's the CV?
- **Priority:** 1 narrative 2 CV access 3 what-shaped-him 4 links onward.
- **CTA:** Download CV.
- **Entry:** landing, footer, palette → **Exit:** Timeline (lane tab), Contact, Projects.
- **Sections:** 1 Header (portrait — the one canonical photo, DSVL §10 — + dek) · 2 Narrative (reading column, first-person, 600–900 words; may embed one drawn figure of research themes) · 3 "How I work" (short principles list) · 4 CV block (download + last-updated stamp) · 5 Related trail (era chips → timeline; themes → research) · 6 Footer.
- **Lane tabs:** About · Timeline · Skills.
- **Scroll:** pure reading page — still after load (XA §5); pause at narrative; concludes at CV block.

### `/projects` — Project Index
- **Goal:** prove engineering range fast · route to the right detail.
- **Audience:** engineers, founders, recruiters (second page).
- **Questions:** What has he built? In my domain? How recent? Real or toy?
- **Priority:** 1 featured 2 all-projects grid 3 filters 4 GitHub door.
- **CTA:** open a project.
- **Entry:** landing, nav `Work`, skills evidence → **Exit:** detail; `/github` (lane tab); research (via chips).
- **Sections:** 1 Header + count ("14 projects, 2019–2026" — precise numbers, DSVL) · 2 Featured (larger cards, ≤2) · 3 Grid (uniform cards: title, one-line problem, year, status chip active/archived, relation chips) · 4 Filter row (tags + status; URL-reflected, e.g. `?tag=ml`) · 5 Footer.
- **Lane tabs:** Projects · GitHub.
- **Scroll:** grid page — no storytelling; interaction changes at filter row (sticky *not* used; filters live at top).
- **Responsive:** grid 3→2→1 by card measure; filters become a sheet on mobile.

### `/projects/[slug]` — Project Detail
- **Goal:** show decisions and trade-offs — engineering judgment · route into the graph.
- **Audience:** the depth path (XA); most-scrutinized surface by peers.
- **Questions:** What problem? What was hard? What would he do differently? Where's the code?
- **Priority:** 1 problem+outcome 2 decisions/trade-offs 3 evidence (repo, demo, figures) 4 relations.
- **CTA:** visit repo (when public) — else read the related post.
- **Entry:** index, landing featured, skills, Dex citations → **Exit:** related pub/post, next/prev project, `/github`.
- **Sections:** 1 Breadcrumb + Header (title, dek, year, status, tag row) · 2 Facts strip (role · stack · timeframe · links — tabular, mono for machine-truth values) · 3 Narrative: Problem → Approach → Decisions & trade-offs → Outcome (reading column; honest-writeup house style: one "what I'd change" paragraph mandatory) · 4 Media (framed screenshots/figures, DSVL §10) · 5 Related trail (typed: implements / writes-about / produced-by / evidenced-skills) · 6 Prev/next · 7 Footer.
- **Scroll:** reading page; shared-element arrival from card (XA §6); media pause mid-narrative; still otherwise.
- **Perf:** images lazy + sized (zero CLS, Law 16).

### `/research` — Research Themes
- **Goal:** the research narrative — questions, arc, direction · frame the records.
- **Audience:** researchers, technical founders, curious engineers.
- **Questions:** What is his research *about*? Is it going somewhere? What connects the papers?
- **Priority:** 1 themes 2 theme→artifact wiring 3 door to publications.
- **CTA:** explore a theme's publications.
- **Entry:** landing highlight, nav `Research` → **Exit:** `/publications` (lane tab), projects (via `implements`).
- **Sections:** 1 Header + research one-liner · 2 Theme blocks (per theme: name, 2–3 sentence question, drawn SVG motif, linked pubs + projects chips, status current/past) — ordered current-first · 3 Trajectory note (one paragraph: where this is heading) · 4 Footer.
- **Lane tabs:** Research · Publications.
- **Scroll:** the one non-landing surface permitted a light scrollytelling treatment (XA §6 — theme motifs draw in once); pauses at each theme; concludes at trajectory.

### `/publications` — Publication Index
- **Goal:** the verifiable record — complete, accurate, scannable.
- **Audience:** researchers, committees; precision mode.
- **Questions:** What has he published, where, when? Citable how?
- **Priority:** 1 the list 2 year/venue scan ability 3 citation actions.
- **CTA:** open a publication (secondary: copy citation inline).
- **Entry:** research, landing count, external Scholar → **Exit:** detail; research themes.
- **Sections:** 1 Header + counts by year strip · 2 List grouped by year (rows, not cards: title, authors — Deepak highlighted, venue badge-free small-caps, year tabular, inline actions: copy-citation · PDF · detail) · 3 Footer. *No filters until the list exceeds ~25 entries — a filter on 12 rows is decoration.*
- **Scroll:** table-like scan page; zero animation (evidence is still, XA §5).
- **A11y:** rows are real list semantics; copy-citation announces success.

### `/publications/[slug]` — Publication Detail
- **Goal:** everything needed to verify and cite · bridge paper → practice.
- **Audience:** external citation arrivals (often the first page seen — must stand alone).
- **Questions:** Is this real? Where published? TL;DR? Code?
- **Priority:** 1 full metadata 2 abstract 3 citation block 4 implements-relation.
- **CTA:** copy citation / open PDF.
- **Sections:** 1 Breadcrumb + Header (full title, complete author list, venue+year) · 2 Abstract (reading column) · 3 Citation block (formatted + BibTeX in mono, copy actions) · 4 Links strip (PDF · venue · code · dataset) · 5 Plain-language summary (2–3 sentences — the researcher-to-engineer bridge; also Dex's preferred chunk) · 6 Related trail (`implements` project, `writes-about` posts, theme) · 7 Footer.
- **Scroll:** still page; concludes at related trail.

### `/posts` — Post Index
- **Goal:** surface the writing worth a stranger's time · enable return habit.
- **Questions:** Does he write? Well? About what? Recently?
- **Priority:** 1 recent posts 2 tag paths 3 RSS.
- **CTA:** read a post (secondary: RSS).
- **Sections:** 1 Header + RSS · 2 Post list (title-forward rows: title, dek, date, read-time, tags — no thumbnails; writing sells by title, DSVL) · 3 Tag row (URL-reflected filter) · 4 Footer.
- **Scroll:** list scan; no animation.

### `/posts/[slug]` — Post Detail
- **Goal:** superb reading (XA: absorption) · route onward through the graph.
- **Audience:** the most-shared surface — often a first touch; must sell the whole site quietly.
- **Priority:** 1 the text 2 code/figures 3 related trail 4 next post.
- **CTA:** none inside the reading flow (Law: never interrupt reading); trail at end.
- **Sections:** 1 Breadcrumb + Header (title, dek, date, read-time, tags) · 2 Body (720px column; DSVL code presentation; framed figures; footnotes as popover-on-focus + endnote list) · 3 End-of-post: related trail + prev/next + RSS line · 4 Footer.
- **Scroll:** nav hides on scroll-down / returns on up (XA §4 — the only pages that do this: posts + project details); page is still during reading; concludes at trail.
- **Perf:** the SEO workhorse — SSG, structured data (Article), zero third-party scripts in the reading path.

### `/gallery` — Gallery *(v1.5)*
- **Goal:** the human texture, honestly · breathing room.
- **Priority:** 1 images 2 stories/captions 3 contexts (`depicts`).
- **CTA:** open an image.
- **Sections:** 1 Header (one humble line) · 2 Masonry-or-grid (uniform treatment, DSVL grade; captions on detail, not hover-gated) · 3 Lightbox surface (caption + story + `depicts` link; keyboard ←/→ · Esc; focus-trapped) · 4 Footer.
- **Scroll:** browse page; optional contained filmstrip is the *only* horizontal scroll in the product (XA §6); lightbox suspends page scroll.
- **A11y:** every image has story-alt-text (XA §11); lightbox is a proper dialog.
- **Perf:** the heaviest page — aggressive lazy loading, CDN variants, capped luminance in dark mode.

### `/skills` — Skills
- **Goal:** current capabilities with proof · the "Now" freshness signal.
- **Questions:** Does his toolkit match my need? Current or rusty?
- **Priority:** 1 currently-working-on 2 previously 3 evidence links.
- **CTA:** follow a skill to its evidence.
- **Sections:** 1 Header + last-updated stamp (the point of the page) · 2 **Currently working on** (rich rows: skill, one-line context, evidence chips via `evidences`) · 3 **Previously** (compact rows, same anatomy, muted) · 4 Footer. *Never a tag cloud, never proficiency bars (unverifiable decoration — the evidence chips are the proficiency claim).*
- **Lane tabs:** About · Timeline · Skills.
- **Scroll:** scan page; still.

### `/timeline` — Experience Timeline
- **Goal:** the chronological spine · wire every era to its artifacts.
- **Priority:** 1 the line (recent-first) 2 era→artifact links 3 detail expansion.
- **CTA:** expand an era / jump to an artifact.
- **Sections:** 1 Header · 2 The Timeline (DSVL §5 signature component: drawn line, era groups in small-caps, entries: role/degree/milestone + one-line what-it-produced + `produced` chips; entries expand in place for detail — accordion, one open at a time) · 3 CV line ("prefer a document? CV ↓") · 4 Footer.
- **Scroll:** the drawn line draws in once (`narrative`, XA-approved); reveals per entry; pauses at era boundaries; recent-first order means the page *opens* on relevance and concludes in history.
- **A11y:** the line is decoration (`aria-hidden`); the list is real `<ol>` semantics; expansion is disclosure-pattern.

### `/github` — GitHub
- **Goal:** live engineering signal, from cache (D-010) · bridge to the external presence.
- **Questions:** Real commits? Recent? What languages/repos?
- **Priority:** 1 activity recency 2 pinned/linked repos 3 languages 4 outbound.
- **CTA:** open a repo / follow.
- **Sections:** 1 Header + last-synced stamp (mono — machine truth; honesty about cache) · 2 Activity strip (contribution sparkline/heatmap, drawn in system dataviz style — not GitHub's embed) · 3 Repos (cards: name mono, description, language dot from closed dataviz set, stars tabular; repos linked to projects show the chip) · 4 Languages (hairline bar, direct-labeled) · 5 Footer.
- **Lane tabs:** Projects · GitHub.
- **Scroll:** dashboard-like scan; data renders still (no odometer, DSVL §15).

### `/ai` — Dex *(v1.5)*
- **Goal:** the full conversation surface · demonstrate the craft it claims.
- **Audience:** AI-first visitors, testers, the curious.
- **Priority:** 1 conversation 2 what-Dex-knows (honest scope) 3 suggested questions 4 citations.
- **CTA:** ask.
- **Sections:** 1 Minimal header (● Dex + one-line self-introduction — D-015 honesty) · 2 Conversation surface (input-first; empty state = 4–6 suggested questions spanning the narrative arc; streaming per `08`; every answer with citation links + follow-up chips) · 3 Scope note ("I know Deepak's projects, research, writing, and experience — nothing else." + knowledge-freshness stamp) · 4 Footer (minimal variant).
- **Scroll:** conversation owns the page (message-list scroll, not page scroll); input pinned bottom; no other animation competes with streaming (Law 15).
- **A11y:** full dialog/live-region grammar (XA §11); every citation a real link.

### `/news` — Radar *(v2)*
- **Goal:** what Deepak is tracking, honestly dated · a reason to return.
- **Priority:** 1 this-week's items 2 categories 3 bookmarks 4 digest subscribe.
- **CTA:** open an item (secondary: bookmark).
- **Sections:** 1 Header + freshness stamp (auto-hide rule if stale, D-006 — the page *withdraws itself* rather than rot) · 2 Item list grouped by week (rows: title, source small, category tag — neutral per DSVL, date) · 3 Category filter row · 4 Bookmarks entry (anonymous token) · 5 Digest line (future) · 6 Footer.
- **Scroll:** feed scan; still.

### `/contact` — Contact
- **Goal:** frictionless collaboration start. The easiest page on the site.
- **Priority:** 1 direct email (copyable) 2 form 3 expectations 4 CV.
- **CTA:** send / copy email.
- **Sections:** 1 Header ("what's welcome" one-liner: collaboration, research, roles) · 2 Direct block (email + copy action — *above* the form; never force a form on someone who wants an address) · 3 Form (name, email, message — three fields, no dropdowns/subject taxonomies; validation per DSVL) · 4 Elsewhere (GitHub · Scholar · LinkedIn) + CV · 5 Footer.
- **Scroll:** near-viewport single surface; the sent-state is one of two celebration moments (XA §5) and includes "what happens next" (XA §3).
- **A11y:** the form is the page's a11y center — labels, error grammar, success announcement.

### `/search` — Search
- **Goal:** find anything, visibly (the palette's linkable twin).
- **Priority:** 1 query 2 grouped results 3 refine 4 Dex hand-off.
- **Sections:** 1 Search field (H1-adjacent, autofocus, `/` shortcut) · 2 Results grouped by type (Projects · Publications · Posts · Pages…) with FTS snippets, count per group · 3 Type filter chips · 4 "Ask Dex instead →" (v1.5, persistent quiet row) · 5 Footer.
- **Scroll:** results page; instant-feel updates (§8); no animation beyond skeletons.
- **Perf:** debounced queries against the FTS index; URL-reflected (`?q=`) for shareability.

### `/admin` — Admin Dashboard (and managers)
- **Goal:** the ≤10-minute update loop (PRD G3). A tool, not an experience (XA §3).
- **Audience:** Deepak, daily; keyboard-first, compact density.
- **Priority:** 1 freshness warnings 2 drafts/scheduled 3 quick-create 4 analytics glance.
- **Sections — dashboard:** 1 Freshness board (stale-content warnings, amber semantic — greets with what needs attention, not vanity metrics) · 2 Quick create (new post/project/… one keystroke each) · 3 Drafts & scheduled queue · 4 Analytics glance (sparklines, tables-first) · 5 Sync status row (GitHub · Dex-embeddings · news, with last-run stamps).
- **Sections — each manager (`/admin/[type]`):** list (compact table: title, status badge, updated, actions) → editor (single-column form: fields per type, markdown body with preview, **relations editor** (§2), media picker, version history rail, draft/schedule/publish bar). One editor grammar for all nine types — learn once (XA §10.5).
- **Navigation:** persistent left rail (the one place a second pane is earned, DSVL §13); `⌘K` works here too (admin actions group).
- **A11y/perf:** full keyboard grammar; autosave with honest state ("Saved 12:01", mono); no data lost to navigation, ever.

### `/login` — Authentication *(admin-only; visitor auth is a non-goal)*
Single surface: wordmark, email+password (MFA-ready slot), error grammar without account-existence leaks, rate-limit courtesy message. No public links point here. Future: passkey upgrade path noted in spec.

### Error pages — `/404` · `/500` · offline
One grammar (XA §10.8 — calm, in-character, forward paths): drawn-line illustration, one honest sentence, then *useful* paths: search field (404), the four lanes, "email me — this shouldn't happen" (500). 404 copy: "This page doesn't exist — or doesn't exist *yet*." 500 never blames the visitor; offline (if SW ships) offers cached reading list. Errors carry no nav-hiding, full footer — maximum wayfinding at the moment of loss.

### Settings *(future, admin)*
`/admin/settings`: profile/canonical-bio fields, theme defaults, integrations (GitHub token, LLM keys), Dex persona guardrails view (read-only copy of D-015 rules), danger zone. Public settings remain nav-level toggles only (§0.4).

## 6. User Flows

Notation: `→` navigation · `⇢` optional branch · `✓` goal state.

**Recruiter (90-second clock):**
`Résumé link → / (hero: identity ✓10s) → scroll: Featured Work + Current Focus (currency ✓) ⇢ /projects (one detail skim) → CV download ✓ ⇢ /contact ✓` — every step ≤2 clicks; CV reachable from hero and footer at all times.

**Professor (verification):**
`Citation/Scholar → /publications/[slug] (standalone verify ✓) → citation copy ✓ → related trail ⇢ /research (trajectory) ⇢ /publications (full record) → /contact ✓` — detail pages must not assume prior context.

**Founder (judgment scan):**
`/ → /projects → detail (trade-offs section = the sale) → writes-about post (thinking quality) ⇢ ● Dex: "has he built anything like X?" → cited answer → /contact ✓`

**Student (learning path):**
`Post link → /posts/[slug] (reads) → related trail → /research (themes) ⇢ Dex: "explain simply" → follow-ups → RSS subscribe ✓` — generous depth, no gating, never a newsletter popup.

**Returning visitor:**
`/ (Current Focus diff since last visit) ⇢ /posts (new title rows) ⇢ /news (v2, weekly groups) → item ✓` — freshness stamps everywhere make "what's new" self-answering; RSS is the zero-visit alternative ✓.

**Admin (the heartbeat):**
`/login → /admin (freshness board: "Skills 34 days old" amber) → quick-create or manager → edit (autosave) → relations + media → publish → fan-out (site/RSS/FTS/Dex re-embed per architecture §3) → dashboard confirms ✓ ≤10 min`

**GitHub visitor:**
`Repo README link → /projects/[slug] (the story behind the repo ✓) → facts strip back to code ⇢ more projects → /github (the wider signal) → follow/star ✓` — repo READMEs link to project pages, closing the loop inward.

**AI-first visitor:**
`/ → Dex preview chips (v1.5) → panel opens with chosen question → cited answer → citation → /projects/[slug] ✓ → contextual "ask about this" → conversation continues alongside content` — Dex routes *into* pages (XA: its metric is pages-after-conversing).

**Mobile visitor:**
`/ (thumb scroll, priority order = §4) → sheet nav or ⌘-trigger palette (full-screen) → lane → detail (reading column owns viewport) → Dex as bottom sheet (v1.5) → contact (form fits one screen + keyboard) ✓` — every desktop capability present, re-housed (§12).

## 7. Search Architecture

One index (Postgres FTS, D-011), four skins:
1. **Palette** (⌘K) — keyboard skin; grouped results, actions, Dex hand-off (§3).
2. **`/search` page** — visible/linkable skin; same groups + filters + URL state.
3. **Scoped inputs** — Projects/Publications/News indexes filter *in place* (client-side over the loaded set; URL-reflected). No separate scoped engines — scoping is a filter on one index.
4. **Dex** (v1.5) — the semantic skin: palette and `/search` show "Ask Dex instead" when lexical results are thin; Dex answers over the *same* content via embeddings (D-009). **Semantic search is Dex** — a second semantic-search UI would duplicate it (feature-overload guard).
Future: dedicated engine swap behind the `SearchIndex` interface changes none of this IA (§11-arch).

## 8. Dex Placement Strategy (v1.5)

- **Global:** the presence dot in the nav — every public page, identical position; opens the side panel (desktop) / bottom sheet (mobile) over current context. Absent in v1.0 entirely (graceful absence, XA §0.3).
- **Page-aware:** panel greets contextually per XA §7 (project page → "explain the decisions"; publication → "plain-language summary"; timeline → "walk me through this period").
- **Context suggestions:** one dismissible inline affordance per content page, post-engagement, dismissal remembered (XA §7 rules — never a popup).
- **Recommendations:** intent-driven ("I'm a recruiter" → highlights + CV path); answer chips end with "take me there →" navigation actions.
- **Research guidance:** compare themes, summarize papers, trace idea→paper→project along §2 relations — Dex traverses the same graph the trails render; it is *a voice skin over this IA*, not a parallel structure.
- **Persistence (future-ready):** session context client-side; the panel reserves a header slot for the v2 opt-in "remember this conversation" without redesign.
- **Interruption handling:** panel state survives page navigation within a session (it rides alongside); closing mid-stream stops generation gracefully ("stopped — want me to finish?"); route changes never kill an in-flight answer silently; `Esc` always yields the page back instantly.

## 9. Empty States

Grammar (DSVL §5): drawn illustration · one honest sentence · one action. Never apologetic, never fake data.

| Surface | Copy direction | Action |
| --- | --- | --- |
| Gallery | "No photos yet — the lab notebook starts with words." | → Posts |
| Projects | "Projects are being written up." | → GitHub (the code exists) |
| Posts | "The first post is being written." | → RSS ("be first") |
| News (v2) | Stale ⇒ section auto-hides (D-006); true-empty pre-launch never ships publicly | — |
| Research | "Themes are being distilled from the publications." | → Publications |
| Search (no query) | Suggested searches + recent content | — |
| Search (no results) | §10 No-Results | — |
| Dex (new conversation) | Not empty — suggested-question chips *are* the state | ask |
| Admin (new type) | "Nothing here yet." + primary create button | + New |

## 10. Error States

Grammar (XA §10.8): calm · honest · in-character · always a forward path. Copy never blames; system states use semantic color + plain sentence.

| State | Behavior |
| --- | --- |
| **404** | Error page per §5: search + lanes; logs for admin link-rot review. |
| **No results** | "Nothing for '⟨q⟩'." + spelling-adjacent suggestions + type-filter reset + "Ask Dex instead" (v1.5) — a no-result is a Dex hand-off opportunity, not a wall. |
| **Dex offline** | XA §7 verbatim: entry points reduce to one quiet note ("The twin is resting — everything it knows is still on the site."); repeated failure hides affordances for the session; site fully functional (Dex depends on site, never inverse). |
| **GitHub sync failure** | Serve last-known-good with honest stamp: "Last synced 3 days ago — GitHub's having a moment." Amber only in admin; public stays calm. Never an empty GitHub page while cache exists (D-010's payoff). |
| **News fetch failure** (v2) | Same pattern: last-good + stamp; staleness threshold triggers auto-hide. |
| **Permission denied** | Admin-only surface: neutral "You need to sign in for this" → /login, return-URL preserved. Public never sees 403s (nothing public is gated). |
| **Slow network** | Skeletons per DSVL (shell always first); >4s: skeleton gains one honest line ("Still loading — slow connection?"); Dex >8s: timeout + retry per XA §7; forms never double-submit (in-flight state on the button). |

## 11. Mobile Experience — designed, not shrunk

Extends DSVL §13 with IA-specific behavior:
- **Navigation:** bar = wordmark + search icon + menu; menu is a *sheet* (bottom-anchored, thumb-reach) listing the four lanes + full sitemap groups (footer equivalent) + theme toggle. Palette opens full-screen from the search icon (keyboard-less palette = search page skin).
- **Gestures:** system gestures only — no custom swipe grammar to learn (consistency > cleverness; XA §10.5). Lightbox supports native swipe; nothing else overrides scroll/swipe (no-hijack law). Pull-to-refresh native where the platform provides it; never simulated.
- **Dex:** bottom sheet (XA), half-height default with drag-to-expand; input above keyboard; suggestion chips horizontally scrollable *within* the sheet (contained, permitted); dot lives in the bar.
- **Scrolling:** priority order = stacking order (§4 law) so every page reads correctly top-to-bottom; section rhythm halves (48–96); reveals reduced (fewer, smaller); nav condenses immediately.
- **Performance:** mobile mid-range is the test target (XA §12): SSG pages, zero third-party scripts public-side, images sized-per-viewport from the CDN, palette/Dex code-split so the reading path never pays for them.
- **Touch:** 44px targets (DSVL §12); hover-revealed anything is forbidden (Law 20) — all affordances visible; copy actions get press feedback at `motion-instant`; forms use correct input types/autocomplete (email keyboard on email field).

## 12. Future Scalability

How this IA absorbs the PRD/XA future list without restructuring: **Talks & media** → new content type + `references` edges + a lane-tab under Research; **Newsletter** → digest output + footer/Radar entry; **Reading list** → content type + optional Dex corpus; **Knowledge map** (XA §13) → a visualization skin over §2's relation graph at `/map` — the taxonomy is already its data model; **Visitor lenses** → palette action re-weighting landing emphasis (no new pages); **Programmatic access** → the read layer exposed (arch §20), same content model; **Multilingual** → locale dimension on content + route prefix, IA unchanged. The rule: new needs become *content types + typed relations + at most one lane-tab* — the sitemap's four-lane bar and 3-level depth are permanent.

---

## Appendix — Downstream Obligations

| Deliverable | Owes this document |
| --- | --- |
| **Wireframes (Phase 3)** | One wireframe per §5 blueprint, honoring priority-order-as-DOM, section inventories, and the shared grammar. Start: Landing, Project detail, Post detail, Admin editor (the four grammars everything else reuses). |
| `specs/*` | Each feature spec imports its page blueprint(s) as the UX-requirements section; relations editor requirements → `admin-dashboard.md`; Dex placement rules → `ai-assistant.md`. |
| `09-DATABASE_PLAN.md` | Entity + relation taxonomy (§2) as schema input. |
| Token spec | Breakpoint values; container widths confirmation. |
