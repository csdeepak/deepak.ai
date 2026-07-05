# Spec — Landing Page (Sprint 1 Master Specification)

> **Status:** Specified — v1.0. Ready for high-fidelity design + implementation (pending tech-stack ratification).
> **Owner:** Deepak · Authored as Lead Product Designer / Creative Director.
> **Upstream (immutable):** PRD `02` · System `11` · XA `12` · DSVL `03` · IA `04` (§5.landing) · Wireframes `13` (§4.1) · Brand `14` · Tokens `15`. This spec *deepens* `13` §4.1; it may not contradict it.
> **Sprint scope:** the Landing Page only. It establishes the interaction, motion, layout, and hierarchy language every future page inherits — which is why it is specified to this depth.

---

## 0. Brief Reconciliation (binding)

**Sections:** the sprint brief lists 13; **D-022 caps the landing at 8.** The 13 map losslessly (per D-023):

| Brief item | Disposition |
| --- | --- |
| 1 Hero · 2 Personal Identity · 3 Current Mission | **S1 Hero** — identity *is* the hero; the mission is the identity sentence |
| 4 Featured Engineering Projects | **S2 Featured Work** |
| 5 Research Highlights · 6 Publications Preview | **S3 Research Highlight** (theme + publications stat strip — a separate pubs preview would say the same thing twice) |
| 7 Experience Snapshot · 8 GitHub Activity | **S4 Current Focus** (now-strip + latest era + activity sparkline) |
| 10 Latest Technical Posts | **S5 Latest Posts** |
| 9 Digital Twin AI Preview | **S6 Dex Preview** *(v1.5; absent in v1.0 — graceful absence)* |
| 12 Call to Collaboration | **S7 Contact Strip** |
| 13 Footer | **S8 Footer** |
| 11 Personalized News Preview | **v2 slot** between S5 and S6 (D-006) |

**3D portrait: rejected — permanently (D-020).** No 3D likeness, no AI-enhanced portraiture, no Dex-with-a-face. The alternative below (§2.1) is stronger, not a fallback: the hero is **typographic + the drawn graph motif**. A face in the hero radiates "personal brand™" (Brand §13 anti-pattern); a *lab* opens on its work. The photograph lives in About, where the human narrative wants it.

**Cursor interactions: rejected (D-016).** No custom cursors, trails, magnetic pulls, or pointer-reactive backgrounds. Mouse = hover states on interactive elements, period.

**Success criteria accepted verbatim:** 10-second comprehension of who/what/why-different/why-continue; memorable by narrative and clarity, not effects.

## 1. Landing IA & Storyboard

**Narrative arc (the page as told story):**

```
S1 HERO        "This is Deepak — researcher × engineer, and this is a lab."
   ↓ (curiosity: what does the lab produce?)
S2 FEATURED    "It produces real systems. Here are two, with their research."
   ↓ (so he builds — does he also think?)
S3 RESEARCH    "The systems come from questions. Here's the current one."
   ↓ (is any of this current?)
S4 CURRENT     "Live: working on X, at Y, committing this week."
   ↓ (does he explain himself?)
S5 POSTS       "Yes — in writing. Three recent titles."
   ↓ (who's been guiding me? — the reveal)
S6 DEX (v1.5)  "● I'm Dex. I know all of this. Ask me anything about it."
   ↓ (I'm convinced — now what?)
S7 CONTACT     "Then say hello. Here's the door."
S8 FOOTER      the sitemap, the record, the stamp.
```

**Scroll length:** ~6–7 viewports desktop, ~8–9 mobile. Deliberately short — every additional viewport taxes the 90-second visitor (an 11-section page would run ~10+, which is why D-022 exists).

**Persona shortcuts through the story:** evaluator: S1 → CV (in-hero) or S1→S2→S7 · researcher: S1→S3→(publications) · engineer: S1→S2→(project detail)/S4 · AI-curious: S1→S6. Every shortcut ≤2 interactions; the story is the *default*, never the *toll* (XA §2).

## 2. Section Specifications

Shared: 12-col/`container.content` grid; section rhythm `space.24–40`; reveals = `motion.recipe.entrance` once; all per `15` tokens. Each section states the required attributes; unstated = inherited from `13`/`15`.

### 2.1 — S1 Hero *(the section that teaches the product's language)*

**Purpose:** answer *who / what / why different* in ≤10s and hand the visitor a direction. Everything else on the page is proof for claims made here.

**Content hierarchy (= DOM order):**
1. Name (wordmark-scale, `type.display` low end)
2. **Identity sentence** — the headline (see philosophy below)
3. **Current-focus line** — live from Skills(current): "Currently: ⟨focus phrase⟩" + freshness stamp
4. Primary CTA **[View work]** · Secondary CTA **[Download CV]**
5. (visual layer, `aria-hidden`) the drawn **graph motif**
6. Quiet scroll cue (hairline + small chevron; fades permanently on first scroll)

**Headline philosophy:** one declarative identity sentence carrying the mission — subject, verb, object; no greeting ("Hi, I'm…" is student-portfolio grammar — banned), no adjectives about quality (Brand: confidence is assumed), no wordplay. *Messaging intent* (not copy): [name] + [dual identity: research × systems] + [the arena he works in]. Must read complete in one line at desktop, two at mobile. Supporting copy is exactly one line — the current-focus line — because the strongest supporting claim a "lab" can make is *what it is working on right now*.

**Layout:** text block cols 1–9, left-anchored (Brand §3: hard left edge; centering is ceremonial — considered for the hero and rejected: left-anchored reads as "document," centered reads as "poster," and this product is a document). Graph motif occupies cols 8–12 as a *layer behind/beside* text, never under it (contrast law). Height ~85vh — deliberately not 100: the next section's header peeking above the fold *is the scroll cue that matters*; a full-viewport hero pretends the page ends.

**Opening experience (first paint → settled, total ≤2s):**
1. 0ms: canvas + full text painted (SSG; identity legible frame one — XA law).
2. ~150ms: text block settles with a single `entrance` (whole block, one motion — no line-by-line stagger theater).
3. ~300ms–1.8s: the graph motif **draws itself** — nodes appear, hairline edges connect them (`motion.recipe.draw-in`, `narrative`) — once per session; on return visits it is simply present.
4. Settled state: everything still except (v1.5) the Dex dot breathing in the nav.

**Loading experience:** none visible. The hero is static-generated; no skeleton, no splash, no progress bar — a loader on a landing hero is an apology for architecture (`11` made it unnecessary). The current-focus line and (S4's) GitHub data are build-time/cached values, never client-fetched for first paint.

**The visual concept (in place of the rejected 3D portrait):** the **graph motif** — a drawn-line constellation of ~7–12 nodes and hairline edges, an abstracted rendering of the *actual* content graph (IA §2 relation kinds as edge styles, content types as node treatments). It is the product's thesis drawn: *documents connected by points*. It is also the logo direction's node-and-edge atom (Brand §6) at full scale — landing, brand, and IA all saying one thing. Static after draw-in; not pointer-reactive (§0); `aria-hidden` with the H1 carrying all meaning.

**Background behavior:** `color.bg.canvas`, flat. The XA's optional ambient field is **declined for v1** — the graph motif's draw-in is the hero's one moment; adding ambience would dilute it (one-focal-motion law). Revisit only via decision entry.

**Interaction / micro-interactions:** CTAs per Button family (`hover` recipe; press `instant`). CV download = direct asset + copy-confirm toast pattern is *not* used — the browser's own download affordance suffices (no invented feedback for native behavior). Scroll cue is non-interactive (signifier only).

**Mouse:** hover states only (§0). **Keyboard:** skip-link is first Tab; then CTA order; scroll cue not focusable; `⌘K` live from frame one. **A11y:** H1 = identity sentence (name may be a styled `p`/logo landmark — one H1 rule); motif `aria-hidden`; reduced-motion: motif fully drawn at paint, text present immediately (`08` map). **Performance:** LCP = the H1 text node (no hero imagery to wait on); motif is inline SVG a few KB; **zero** blocking media. This section is why the landing can hold a <1s first-paint budget (§6).

**Scroll transition → S2:** as the hero scrolls off, S2's header + first card top are already visible (the 85vh trick); first `entrance` reveal fires at S2 — the visitor *learns the page's reveal grammar* on the first scroll.

**Future personalization (reserved, unbuilt):** returning-visitor variant of the current-focus line ("since your last visit: 2 posts"); visitor-lens re-weighting (XA §13) — both palette-triggered, neither alters S1's structure; Dex-aware greeting if arriving from a shared Dex conversation link (v2 idea).

### 2.2 — S2 Featured Work

- **Purpose:** first proof — real systems, honestly told. **Transition intent:** hero claimed *builder*; S2 shows receipts.
- **Hierarchy:** H2 → one-line dek (messaging intent: "systems with their reasoning") → 2× `ProjectCard` (admin-flagged featured; each: title, one-line *problem*, year, status chip, `implements` relation chip) → ghost "All projects →".
- **Layout:** cards 6+6 cols; equal height; generous `space.8` internal.
- **Interaction:** whole-card link → project detail via `shared-element` (the transition that *teaches the IA*: card becomes page — XA §6). Relation chip → publication (stops propagation).
- **Micro-interactions:** card hover = surface tone-step (`hover` recipe); chip hover underline.
- **Animation:** section `entrance` once; **no card stagger** (two cards staggering reads as one card late).
- **Scroll:** normal; a natural *pause point* — density low, decision high.
- **Responsive:** tablet 4+4; mobile stacked full-width, problem-line clamped to 2 lines.
- **A11y:** cards = single links with full accessible names (title + problem); chips separately focusable.
- **Perf:** no imagery in v1 cards (typographic cards — screenshots would demand art-direction the DSVL frames can't guarantee at this size; revisit post-launch).
- **→ S3:** dek of S3 references the chip the visitor just saw ("the research behind the systems") — the graph as narrative device.

### 2.3 — S3 Research Highlight

- **Purpose:** the *thinker* proof; door to the research lane. Absorbs the brief's "Publications Preview" as a stat strip — counts, venues, years — because at landing altitude, publications *are* a statistic with a door.
- **Hierarchy:** H2 → current theme name + 2–3 sentence research question (reading measure) → theme's drawn motif (echo of hero's language, smaller) → `StatStrip`: publications · venues · span-years (tabular, no odometers) → ghost "Explore research →".
- **Layout:** text cols 1–7, motif cols 8–12 mirrored from hero (compositional rhyme); StatStrip full-width below.
- **Interaction:** theme block → `/research`; stat strip numbers → `/publications`.
- **Animation:** motif `draw-in` on first view (the page's second and last draw-in — hero and here, bookending the "thinking" claim); stats fade `@base`, never count up.
- **Scroll:** slight *slow-down by density* — the question is the one paragraph on the landing a visitor actually reads.
- **Responsive:** mobile: motif above text at ~25vh max, then stats 3-up compressing to stacked pairs.
- **A11y:** stats as definition-list semantics (number + label bound).
- **→ S4:** from *what he thinks about* to *whether it's alive right now* — the currency question answered next, on purpose, at the page's midpoint (trust forms here or not at all).

### 2.4 — S4 Current Focus *(the freshness engine)*

- **Purpose:** currency — PRD G2's "is this current?" answered with data, not claims. Absorbs Experience Snapshot + GitHub Activity.
- **Hierarchy:** H2 ("Currently" register) → now-strip: 2–3 `SkillRow`-minis from Skills(current) → latest `TimelineEntry`-mini (role/org/date) → GitHub sparkline + "last synced ⟨stamp⟩" (mono, cached per D-010).
- **Layout:** the page's one *dense* section (Brand §3 bimodal density — the visitor feels the register switch from narrative to instrument): three columns 1–6 / 7–9 / 10–12; hairline-separated.
- **Interaction:** each block is a door (skills → /skills, entry → /timeline, sparkline → /github).
- **Micro-interactions:** row hovers; stamp is non-interactive truth.
- **Animation:** **none** (data is still — XA §5; the stillness *is* the credibility).
- **Scroll:** fast section — scannable in one fixation; density does the communicating.
- **Responsive:** mobile: three blocks stack in priority order (skills → era → sparkline); sparkline renders at reduced point-count, never horizontally scrolls.
- **A11y:** sparkline `aria-hidden` + text summary ("⟨n⟩ contributions in the last 90 days"); stamps read by AT.
- **Perf:** all values are build-time/ISR-cached; zero client fetches.
- **→ S5:** currency proven → "does he explain his work?" — writing is the last proof class.

### 2.5 — S5 Latest Posts

- **Purpose:** thinking-in-public proof + the return-visit hook.
- **Hierarchy:** H2 → 3× `PostRow` (title, date, read-time — no deks at landing altitude; titles must carry) → ghost "All posts →" + quiet RSS glyph.
- **Layout:** single column rows at `container.reading` width — the page narrows here, *rehearsing the reading experience* posts deliver.
- **Interaction/micro:** row hover tone-step; whole-row link.
- **Animation:** `entrance` once.
- **Scroll:** brief; whitespace *increases* around this section (the page exhales before the reveal).
- **Responsive:** unchanged structurally — rows are already mobile-shaped.
- **A11y:** list semantics; dates in machine-readable form.
- **→ S6:** the story's turn. Everything so far was *evidence you read*; next is *evidence you can talk to*. The increased whitespace + narrowed measure make S6's arrival feel like a scene change.

### 2.6 — S6 Dex Preview *(v1.5 — the discovery moment; in v1.0 this section does not render, and S5's exhale flows to S7)*

- **Purpose:** name the presence, demonstrate scope, convert curiosity → conversation. **The gradual-reveal design:** the dot has been breathing in the nav since frame one, unexplained; contextual affordances exist on content pages; S6 is where the product finally *introduces* it. Visitors who noticed get a payoff ("so *that's* what that is"); those who didn't get a clean introduction. Curiosity was structural, not manufactured.
- **Hierarchy:** ● (dot, larger, breathing) → one-line self-introduction (D-015 grammar: what it is + what it knows) → 3 **suggested-prompt chips** (messaging intent: one per proof class the visitor just scrolled — a project question, a research question, a trajectory question) → knowledge-freshness stamp ("knows everything published here, as of ⟨date⟩") → quiet "or ask anything about Deepak's work →" (/ai door).
- **Trust indicators (all visible in-section):** honest self-description · scope statement · freshness stamp · the implicit one: chips reference *real content the visitor just saw*.
- **Layout:** centered — the page's one ceremonial composition (Brand §3: symmetry for ceremony; this is the ceremony).
- **Interaction:** chip → opens `DexPanel` pre-filled with that question (not `/ai` navigation — the panel over-the-page *is* the lesson that Dex rides alongside everything); intro line → `/ai`.
- **Micro-interactions:** chip hover; dot breath deepens momentarily when the section scrolls into view — the only motion in the product that responds to scroll-position of a *living* element; justified as the discovery beat, once per session.
- **Animation:** `entrance`; dot per `ai-breath`.
- **Voice placeholder:** none rendered — the ▷ slot lives on `/ai` (`13` §4.14); previewing voice here would promise what v1.5 doesn't ship.
- **Responsive:** mobile: chips stack full-width (44px targets); panel opens as bottom sheet.
- **A11y:** dot `aria-hidden`; intro is real text; chips are buttons with the full question as name; panel = dialog grammar on open.
- **→ S7:** conversation offered; collaboration is the remaining door.

### 2.7 — S7 Contact Strip

- **Purpose:** the close — collaboration with zero friction.
- **Hierarchy:** one sentence (messaging intent: what's welcome — collaboration/research/roles) → email (visible text + copy button) → [Contact →] ghost.
- **Layout:** `container.reading`, generous `space.32` above — maximal whitespace = the page's final breath; near-ceremonial but left-anchored (the document signs off, it doesn't take a bow).
- **Micro-interactions:** copy → check morph `@fast` + announce ("email copied") — likely the most-used micro-interaction on the page; it must be flawless.
- **Animation:** `entrance` once. **Scroll:** the page *concludes* here — S8 is reference, not content.
- **Responsive:** unchanged; email wraps, never truncates.
- **A11y:** copy button announces; email also a `mailto` link (copy button ≠ the only path).
- **→ S8:** hairline; register drops to chrome.

### 2.8 — S8 Footer

Per `13` primitive (sitemap-of-record, RSS, theme, outbound, freshness stamp). Landing-specific: the freshness stamp here is the *site-wide* "last updated" — the page's last word is, fittingly, a timestamp. No animation. Full keyboard traversal.

## 3. Scroll Choreography (the whole-page story)

| Beat | Sections | Pace | Density | Whitespace | Device |
| --- | --- | --- | --- | --- | --- |
| Arrival | S1 | stopped (85vh) | minimal | vast | draw-in; next-section peek pulls the first scroll |
| First proof | S2 | **slow** (pause point) | low | generous | 2 cards demand a choice |
| Thought | S3 | slow-by-reading | medium | generous | the one read paragraph; second draw-in |
| Pulse | S4 | **fast** (scan) | **high** | tight | density switch = register switch |
| Exhale | S5 | easing | low | **increasing** | measure narrows; page breathes |
| Reveal | S6 | slow (scene) | low | peak | ceremony: centered, the dot named |
| Close | S7 | stopped | minimal | maximal | the door |
| Reference | S8 | — | high (chrome) | — | timestamp signs the page |

**Sticky:** nav only (condenses at first scroll — the chrome literally gets out of the way as the story starts). **Animation triggers:** every section fires `entrance` once at ~20% visibility; the two draw-ins (S1, S3) and the one breath-deepen (S6) are the only motions beyond that grammar. **Curiosity engineering (the honest kind):** the 85vh peek (what's below?) · the unexplained breathing dot (what is that?) · relation chips (these things connect?) · the S5→S6 exhale-then-ceremony rhythm (something's coming) — all structural, none manufactured (no "scroll to discover ✨" prompts).

## 4. Motion Strategy (assignments + justification)

| Technique | Verdict here | Justification |
| --- | --- | --- |
| 3D | **No** | D-016/D-020; the graph motif delivers "dimensional interest" in the brand's own language at ~1% of the cost |
| Parallax | **No** | Text-adjacent parallax taxes reading (XA §5); flat layers keep the paper honest; nothing here needs depth to mean |
| SVG path animation | **Yes ×2** (S1 hero motif, S3 theme motif) | The signature: it *explains* (the graph assembling = the product thesis) and it's the brand's illustration language moving (`14` §9) |
| Glass | **No on-page** | Landing has no floating surfaces; glass appears only if palette/DexPanel open (their own spec, D-020) |
| Shared-element | **Yes** (S2 cards → project detail) | Teaches IA through motion (XA's highest-value technique); the landing must model it since every page inherits it |
| Micro-interactions | **Yes, everywhere interactive** | The premium feel's actual home (DSVL); copy-email is the flagship |
| Cursor effects | **No** | D-016; §0 |
| Text reveals | **One block-level settle** (S1) | Per-line/word/letter staggers are animation-showcase grammar (Brand §13); one settle = confident |
| Image reveals | **n/a in v1** (no landing imagery) | Typographic cards (§2.2); if imagery arrives later: framed fade `@base`, no masks/wipes |
| Section transitions | **`entrance` grammar, uniform** | One reveal language page-wide = learnable, calm; variety here is noise |

**Motion budget as a number:** ≤3 `narrative`-class moments per session (2 draw-ins + 1 breath-deepen), everything else ≤`base`. If a future edit wants a fourth, one of the three must die (budget, not wishlist).

## 5. Content Strategy (information architecture of messaging)

| Section | Content source (system) | Messaging intent — what the visitor should *conclude* |
| --- | --- | --- |
| S1 | profile fields + Skills(current) | "A researcher-engineer with a specific arena, working *now*" |
| S2 | 2 admin-flagged projects + relations | "Real systems, honestly told, connected to research" |
| S3 | current theme + pub aggregates | "The systems come from sustained questions" — rigor without jargon |
| S4 | skills + timeline + GitHub cache | "Alive this week" — the anti-staleness proof |
| S5 | 3 latest posts | "He explains his reasoning in public" |
| S6 | Dex intro + 3 chips referencing S2–S4 content | "The whole record is conversational — and honest about its bounds" |
| S7 | contact fields | "Reaching him is trivial" |
| S8 | sitemap + site stamp | "This place is maintained" |

Anti-copy rules inherit Brand §11 (banned vocabulary; declaratives; numbers precise). No section may *claim* what another section *proves* — claims live in S1 only; S2–S6 are exclusively evidence.

## 6. Responsive Blueprint (mobile designed, not collapsed)

Mobile is a **single-column telling of the same story at thumb pace**: same 8 beats, same order (priority = DOM = stacking, IA law), re-paced:
- **S1:** ~90svh; identity sentence wraps to 2 lines max; motif renders *below* text at ~30vh, simplified (~7 nodes — fewer edges, same meaning; drawn once); CTAs full-width stacked, thumb-zone; scroll cue omitted (mobile users scroll by instinct — the cue is desktop furniture).
- **S2:** cards stacked; problem-line 2-line clamp; shared-element still fires (view-transition capable) or degrades to instant nav.
- **S3:** motif → text → stats stacked; stats as 3 compact pairs.
- **S4:** three minis stacked in priority order; sparkline fixed-width, summary text carries meaning.
- **S5/S7:** already mobile-shaped. **S6:** chips stacked full-width; DexPanel = bottom sheet, half-height, drag-expand.
- **Global:** section rhythm halves (`space.12–24`); reveals reduced (smaller translate); bar = wordmark + search + menu (sheet); 44px targets throughout; no hover-dependent anything (Law 20).
- **Perf mobile:** identical budget (§8) on mid-range hardware — the test target *is* mobile (XA §12).

## 7. Accessibility Checklist (release criteria)

- [ ] One H1 (identity sentence); landmark order: banner → main (S1–S7) → contentinfo
- [ ] Priority order = DOM = reading order = tab order, verified
- [ ] Skip-link first Tab; `⌘K` documented in palette hint; all CTAs/chips/rows focusable with visible ring (`focus.*`)
- [ ] Motifs + sparkline + dot `aria-hidden` with text equivalents (H1, stat text, contribution summary, Dex intro line)
- [ ] Reduced-motion pass: motifs pre-drawn, entrances instant, dot static + text state, breath-deepen absent — page complete and first-class (`08` map)
- [ ] Copy-email announces; download link is a real link; chip names = full question text
- [ ] Contrast per `a11y.contrast.*` in both modes incl. text-over-motif-adjacent zones (motif never sits under text)
- [ ] Screen-reader walkthrough: the 8-beat story is *audible* in order and makes sense without any visual
- [ ] Keyboard-only walkthrough: every exit path reachable ≤ expected tabs; no traps; 200% zoom reflows without loss

## 8. Performance & Implementation Notes

**Budget (release criteria, mid-range mobile):** first paint <1s · LCP = H1 text <1.5s · CLS = 0 (no late-loading layout — S4 data is build-time) · total JS on this route: minimal (palette + Dex code-split, loaded on intent) · motif SVGs inline, few KB · zero third-party scripts · fonts: two families, subset, `font-display` strategy per stack ratification.

**For hi-fi + implementation:**
1. Structure is frozen (this spec + `13` §4.1); visual treatment operates inside DSVL/Tokens law. The graph motif's *design* is the sprint's main craft task — it must read as the brand's drawn line, encode real relation semantics, and survive at both hero and S3 scales (and 7-node mobile cut).
2. Build order: static structure → reveal grammar → draw-ins → shared-element → (v1.5) Dex insertions. The page must ship complete at each stage (graceful absence is an architecture, not a TODO).
3. Data contracts: S1/S4 read Skills(current), latest timeline entry, GitHub cache (D-010), site stamp; S2 featured flags; S3 theme + aggregates; S5 latest-3 — all via the content read layer, all build-time/ISR. **No client-side data fetch above S6.**
4. The v2 News slot (between S5 and S6) exists in the section-numbering gap only — no placeholder markup ships.
5. Every deviation discovered during build → decision entry *before* the deviation, not after.

## 9. Future Evolution

Reserved, requiring spec amendment: returning-visitor current-focus variant · visitor lenses re-weighting S2/S3 emphasis (XA §13, transparent + user-controlled) · Radar preview section at v2 (slot per §0) · third Featured card slot · project-card imagery (post-launch, art-direction spec first) · Dex-conversation deep links landing with context · the graph motif upgraded to *live* data rendering (nodes = actual latest content) — the strongest candidate: it would make the hero literally true.

---

## Spec-template fields (per `specs/README.md`)

- **Purpose:** §1. **Functional requirements:** §§2–6. **Non-functional:** §§7–8.
- **UI notes:** §§2–4 (within DSVL/Tokens law). **API notes:** content read layer per §8.3; no landing-specific endpoints. **Database notes:** no landing-specific schema; consumes content types + relations (IA §2) + GitHub cache.
- **Future ideas:** §9. **Status:** **Specified** — awaiting tech-stack ratification for build.
