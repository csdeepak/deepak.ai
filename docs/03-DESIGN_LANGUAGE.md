# 03 — Design System & Visual Language (DSVL)

> **Status:** Approved draft — v1.0 of the design language.
> **Owner:** Deepak (Design) · Authored in the role of Design Director.
> **Upstream:** [`02-PRODUCT.md`](02-PRODUCT.md) (PRD) · [`12-EXPERIENCE_ARCHITECTURE.md`](12-EXPERIENCE_ARCHITECTURE.md) (XA — this document discharges its §Appendix obligations: quiet confidence, the Twin's identity, the glass call, contrast targets).
> **Downstream:** binds [`07-COMPONENT_GUIDELINES.md`](07-COMPONENT_GUIDELINES.md), [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md), all wireframes, and all implementation. Exact token values (hex, px) are ratified alongside the tech stack; the *rules* here are binding now.
> Changes require a [`../memory/DECISIONS.md`](../memory/DECISIONS.md) entry.

---

## 0. Design Position

One sentence governs everything below: **Deepak Labs should look the way a well-kept lab notebook reads — precise, calm, dense with meaning, and unmistakably the work of one careful mind.**

The failure modes we are designing *against*, named plainly:

- **The developer-portfolio look** — dark hero, gradient text, cursor trails, three accent colors, a terminal cosplay section. Rejected wholesale.
- **The cyberpunk tax** — neon-on-black "AI aesthetics" that will date the site to this exact decade and undercut the research credibility.
- **The template smell** — visual choices that could belong to anyone. Every recognition device below exists to make this site identifiable from a screenshot with the logo cropped out.

The strategy is **restraint as signature**: almost everything is quiet, so the few loud things (the accent, the presence mark, the signature motion) become identity.

---

## 1. Brand Identity

### Visual personality
**A precision instrument, warmly held.** The interface behaves like laboratory equipment — exact, legible, honest about state — but the content (writing, photography, the Twin's voice) supplies the warmth. Coldness is a hardware property; this product's software is human.

### Tone
Confident declaratives, no superlatives. The interface never says "amazing," "blazingly," or "beautiful" about itself. Numbers are precise ("14 publications," never "many papers"). Microcopy is first-person and plain: "Saved." "Couldn't reach GitHub — showing last sync." The Twin (Dex, §1.4) carries the personality; the chrome stays neutral.

### Emotional goals
In order: **trust → clarity → quiet delight.** A visitor should feel they are somewhere *considered*. Delight comes from precision encountered repeatedly (a perfect focus ring, a citation that copies flawlessly), never from spectacle. Per XA §8, every visual choice either deposits trust or is cut.

### Recognition strategy
Five ownable devices, used relentlessly and never diluted:

1. **The wordmark** — "Deepak Labs" set in the system's own type (§2), lowercase "labs," no logo glyph competing with it. A wordmark ages better than a mascot.
2. **The presence dot** — Dex's mark (§1.4): a small filled circle in the accent color with sub-perceptual breathing. It appears *only* where Dex is (nav presence, panel, AI page). Over years, the dot alone should mean "the Twin."
3. **The single accent** — one hue in the entire product (§3). Screenshot-level recognition comes from chromatic discipline, not a palette.
4. **The hairline** — 1px borders as the primary structural device (§3, §5). A borders-first, nearly shadowless interface is rare enough to be identifying.
5. **The drawn line** — SVG line-drawing (XA-approved) as the illustration language: diagrams, timeline strokes, empty states. Hand-drawn-by-a-plotter character; never stock illustration.

### 1.4 The Twin's identity — **Dex**
The XA required this document to name the Twin. The name is **Dex** — from *Deepak* + *index*: short, speakable, typeable, non-anthropomorphic-cute, and honest about its job (an index to Deepak's work that talks). It renders in text as "Dex" with the presence dot preceding it. Dex has **no face, no avatar, no character illustration** — the dot is the whole body. A face invites uncanny judgment; a dot invites conversation. *(Logged as D-019; the name is the owner's to veto before implementation.)*

---

## 2. Typography System

Typography carries this product. It is 90% of the interface and 100% of the trust.

### Families — exactly two
| Role | Family | Why |
| --- | --- | --- |
| **Sans (UI, headings, body)** | **Inter (variable)** | Neo-grotesque clarity, exceptional screen hinting, tabular figures, weight axis for a one-family hierarchy. Boring in the way load-bearing walls are boring — it will not date. |
| **Mono (code, data, technical labels)** | **JetBrains Mono** | Designed for code legibility, distinct zero/O and 1/l/I, pairs with Inter's x-height. |

No serif. A third family was considered for long-form posts and rejected: coherence beats a marginal reading-warmth gain, and a well-set sans at the right measure reads superbly. One less font to load, license, and maintain for a decade. *(Challenge recorded; revisit only with reader evidence.)*

### Hierarchy
Weight and size establish hierarchy; color never does (§3). Scale is modular (~1.25 ratio, 16px base), fluid at display sizes:

| Level | Role | Character |
| --- | --- | --- |
| Display | Landing identity statement only | Largest, tightest leading (~1.1), weight 600–700, letter-spacing −1–2% |
| H1 | Page title (one per page, always) | ~2× body |
| H2 | Section | ~1.5× body |
| H3 | Subsection | ~1.25× body, may use weight alone |
| H4–H6 | Rare; prefer restructuring over deep nesting | Weight/spacing variants of body size |
| Body | Default reading | 16px UI / 17–18px long-form, weight 400, leading 1.6 |
| Small | Metadata, captions, timestamps | 14px, may pair with the muted foreground |
| Micro | Legal, table footnotes | 12–13px, never below |

### Reading rhythm
- **Measure:** 45–75 characters, 66 optimal. Long-form (posts, project narratives) is locked to a ~720px reading column regardless of viewport (§13).
- **Leading:** 1.6 body, 1.4 dense-UI (admin), 1.1–1.2 display.
- **Paragraph spacing** over indentation; spacing = one blank line rhythm (~0.75em–1em), never both.
- **Vertical rhythm:** all text spacing sits on the 4px grid (§4); heading top-space is ~2× its bottom-space so headings bind to what follows.

### Monospace usage — strict charter
Mono means **machine-truth**: code, commands, file paths, API names, version numbers, dataset figures, citation keys, timestamps in technical contexts. Mono is *never* used for headings, decoration, or "techy vibes" — mono-as-aesthetic is the fastest route to the developer-portfolio smell.

### Code presentation
Code blocks sit on a recessed surface (§3.5) with a hairline border, 14–15px JetBrains Mono, leading 1.5, syntax theme derived from the system palette (accent + 3–4 muted hues reserved for syntax only), a copy affordance, and language label in Small mono. Line highlighting over line pointing-at in prose. Inline code gets a subtle surface pill, same size as surrounding text.

### Number styling
**Tabular lining figures everywhere data lives** — tables, timelines, stats, publication years, the admin. Proportional figures only inside prose. Numbers are a trust surface (PRD: precise counts); they must align and never jiggle on update. Large stat displays use the sans at display weights, not the mono — mono numerals at display sizes look like a terminal, not an instrument.

---

## 3. Color Philosophy

### Position
**A monochrome instrument with one signal color.** The interface is built almost entirely from neutrals — ink on paper (light), paper on ink (dark) — so that the single accent, semantic states, and content imagery are the only chromatic events. Color is spent like ink in a ledger: deliberately, and where it means something.

### Primary palette — "Graphite & Paper"
A cool-neutral ramp (graphite, not brown-warm, not blue-cold) of ~10 steps from paper-white to near-black ink. Not pure `#FFF`/`#000` at the extremes: paper is a breath off-white (glare reduction), ink is deep graphite (harsh-contrast halation reduction) — while §12 contrast floors always hold. Every neutral in the product comes from this one ramp; ad-hoc grays are forbidden.

### Accent strategy — exactly one
One accent: **a precise, slightly-electric blue** — the color of an indicator LED on lab equipment. Blue because it is the most durable signal hue (trust-coded, colorblind-safest against the semantic set, immune to AI-fad violet and crypto-fad green). Its jobs, exhaustively: interactive affordance (links, primary buttons), focus rings, selection, the presence dot, single-series data emphasis. **It never decorates** — no accent-tinted heroes, borders-for-flair, or gradient washes. Rule of thumb: **any given view is ≥95% neutral.** If the accent stops being rare, it stops being a signal. Future expansion: new accents are *not* added; sub-brands or content categories differentiate by neutral weight and iconography, never by new hues.

### Semantic colors — four, reserved
Success (green), warning (amber), danger (red), info (may reuse the accent). Reserved strictly for state communication — form validation, sync status, destructive actions, freshness warnings. Never decorative, never for category color-coding (categories use tags with neutral treatment, §5). Each has an accessible pair on every background tier.

### Background philosophy & surface hierarchy
Depth is communicated by **surface tone + hairline, not shadow**. Three tiers per mode:

| Tier | Role |
| --- | --- |
| **Canvas** | The page itself — the paper |
| **Surface** | Cards, panels, code blocks — one step off canvas |
| **Surface-raised** | Overlays: palette, Dex panel, dialogs, menus — one further step + the system's only real shadow |

Recessed variant (one step *into* canvas) for inputs and code. Tiers are tokens; components never invent in-between tones.

### Borders
Hairlines (1px, low-contrast neutral) are the primary structural device — tables, cards, section dividers, input edges. Two strengths only: default and emphasis. Border radius scale: 4px (inputs, tags) / 8px (cards, buttons) / 12px (overlays) / full (pills, the dot). Nothing else.

### Interactive colors & focus
Interactive = accent, with state shifts expressed as *tone steps, not new hues* (hover: one step; active: two steps + press feedback per §8). Visited links are not differentiated (curated site, small link-space; consistency wins). **Focus: a 2px accent ring, 2px offset, on every focusable element, in both modes, always visible under keyboard focus — never suppressed, never replaced by color-only change.** The focus ring is a first-class brand element (XA §11: fluency, not fallback).

### Light mode
**The default.** Paper-first: reading, evaluation, and academic credibility live in light. Character: airy, high-clarity, generous whitespace; graphite ink at AAA-target contrast for body text.

### Dark mode
**A first-class equal, not an inversion.** Honors OS preference; manual toggle persists. Character: a dim lab in the evening — canvas is deep graphite (never pure black), surfaces step *lighter* (nearer material), body text is off-white at reduced weight-contrast (pure white on dark halates), the accent brightens one step to hold its signal, hairlines drop opacity, imagery gets a subtle luminance cap so photos don't glare. Semantic hues re-tuned per mode, not shared.

### Expansion guidelines
New color needs are answered in this order: (1) a neutral step, (2) an existing semantic, (3) the accent, (4) — only with a logged decision — a new token. Syntax-highlighting hues (§2) and data-viz hues (§11) are closed sets derived once from this philosophy.

---

## 4. Layout System

- **Unit:** 4px. Every spacing, sizing, and radius value is a multiple. **Scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160. Off-scale values are bugs.
- **Grid:** 12-column fluid grid with fixed gutters (24px desktop / 16px mobile) inside containers. The grid is a alignment instrument, not a cage — long-form ignores it in favor of the reading column.
- **Containers:** Content max ~1200px · Reading column ~720px · Wide (gallery, data, admin tables) ~1440px. Centered, with viewport margins 24px mobile / 48px tablet / 64px+ desktop.
- **Section rhythm:** Public pages breathe in large strokes — 96–160px between major sections desktop (48–96 mobile), consistent per page type. Rhythm is *felt* structure; sections must never require dividers to be perceived (hairlines are confirmation, not rescue).
- **Breathing room doctrine:** whitespace is the product's silence — it is how "quiet confidence" is physically rendered. Density is a *mode*, not an accident: public = generous; admin = compact (§5 density). When a layout feels empty, the answer is better content hierarchy, never added ornament.
- **Responsive philosophy:** see §13 — behavior adapts, not just size.

---

## 5. Component Language

### Shared DNA — every component, no exceptions
Built from the same six materials: **surface tier + hairline + radius scale + type scale + spacing scale + state set.** The state set is universal: `default · hover · focus-visible · active · disabled · loading · error`. Hover = one tone step (≤150ms, §8); focus = the ring; disabled = reduced opacity, never color-shift alone; loading = skeleton or inline progress, never a frozen control. Two density modes: **comfortable** (public) and **compact** (admin) — same components, one spacing token swapped.

| Component | Language |
| --- | --- |
| **Buttons** | Three variants only: primary (accent fill — ≤1 per view), secondary (hairline outline), ghost (text + hover surface). 8px radius. Icon-leading optional; never icon-only without a tooltip + label for AT. Destructive = danger tone on the same shapes. |
| **Cards** | Surface + hairline, 8px radius, no shadow at rest. A card is a *link into the graph* — whole-card clickable, one clear title, metadata in Small, hover lifts one tone step (no translate-jump). Shared-element source for detail transitions (XA §6). |
| **Inputs** | Recessed surface + hairline, 4px radius, label always visible above (no placeholder-as-label — it vanishes on entry), 16px+ text (mobile zoom), validation below in semantic color + icon + plain sentence. |
| **Dialogs** | Surface-raised, 12px radius, the system shadow, scrim at ~50% canvas-ink. Reserved for decisions and focused tasks; never for content that could be a page. One primary action. Focus-trapped, `Esc` always works, return-to-trigger on close (XA §11). |
| **Tooltips** | Small type on inverted surface, 4px radius, 300ms hover delay, instant on focus, never containing interactive content, never the only home of information. |
| **Navigation** | The slim bar (XA §4): canvas-colored with hairline bottom edge, condenses on scroll, wordmark left / lanes center / palette trigger + Dex dot right. Active lane = weight + accent underline (2px), not filled pills. Mobile: lanes collapse into sheet + palette (§13). |
| **Tables** | Hairline rows (no zebra — stripes are noise at this scale), header in Small semibold, tabular numerals right-aligned, row hover = surface step, sortable headers show direction glyph. Admin tables: compact density + sticky header. Mobile: reflow to cards (§13). |
| **Timelines** | The signature list: a drawn vertical line (SVG stroke, §1) with dot nodes, era groupings in Small caps-tracking labels, entries as quiet cards linking to artifacts. Draw-in animates once on first view (XA-approved SVG technique). |
| **Tags** | Full-radius pills, neutral surface + hairline, Small type. **Never color-coded by category** — chromatic discipline (§3). Interactive tags (filters) show state by fill step + check glyph. |
| **Badges** | Semantic-colored, reserved for *state* only: `draft · scheduled · new · updated · stale`. If everything is badged, nothing is. |
| **Lists** | Prose lists follow reading rhythm; UI lists are hairline-separated rows with consistent leading glyph slot. No decorative bullets. |
| **Search (palette)** | The command palette (XA §4): surface-raised, 12px radius, the one permitted glass treatment (§7), input on top, grouped results (Pages · Content · Actions · "Ask Dex"), full keyboard grammar, Small hint row at bottom. |
| **Empty states** | A drawn-line illustration (§1), one honest sentence, one action. Never apologetic, never cute-overload: "No posts yet. The first one is being written." |
| **Loading states** | Skeletons for content (shaped like the real layout, subtle shimmer ≤1 loop/s), inline spinners only inside controls, Dex's thinking state per §8. Never a full-page spinner — the shell renders first, always. |
| **Skeletons** | Surface-tone blocks on the 4px grid matching final geometry — a promise of layout, so nothing jumps on arrival (no layout shift, ever). |

---

## 6. Iconography

- **Style: outline, always** — filled variants exist *only* as the active/toggled state of the same glyph (e.g., bookmark, saved). Outline matches the hairline-built interface; a mixed icon economy is the #1 cheap-looking mistake (§15).
- **Grid & stroke:** 24px design grid, **1.5px stroke**, rounded caps and joins — tuned to Inter's weight so icons read as typography's siblings, not stickers. Sizes: 16 (inline) / 20 (UI default) / 24 (nav, feature).
- **One library** (Lucide-class open set, ratified with tokens), extended by custom glyphs drawn on the same grid when needed. Never mix sets in one product — stroke-weight mismatch is instantly visible.
- **Animation:** state morphs only (menu↔close, copy→check, theme toggle), ≤200ms, per §8. No looping attention-seekers; the only permitted loop in the product is Dex's breathing dot.
- **Relationship to illustration:** icons are utility; the drawn SVG line (§1) is expression. Same stroke DNA (rounded, precise), different scale of ambition. Icons never try to be illustrations; illustrations never shrink into icon slots.

## 7. Glass Usage — the final call (XA §6 discharge)

- **Glass appears in exactly two places:** the **command palette** and the **Dex panel**. Rationale: these are the two surfaces that float *above* the workspace while needing the workspace to remain present — translucency here is *informational* (you haven't left the page). Treatment: strong blur, high surface-tint opacity (readability first — closer to frosted acrylic than clear glass), hairline edge, the system shadow. Text on glass always meets §12 contrast against the *worst-case* backdrop.
- **Glass never appears on:** content surfaces, cards, navigation, heroes, tables, admin, or anything at rest on the canvas. Ambient glass is visual noise that taxes GPU, contrast, and credibility simultaneously.
- **Liquid glass: permanently rejected** (re-affirming XA §6 / D-016) — the refraction-and-specular-highlight style is trend-marked to this hardware generation, actively hostile to text, and expensive to maintain. The distinction, for the record: *glassmorphism* = static frosted translucency (we use a disciplined version); *liquid glass* = simulated optical physics (we never do). If a future trend makes our frosted surfaces feel dated, the migration path is *less* glass (solid surface-raised), not more.

## 8. Motion Tokens

Implements the XA timing doctrine (feedback ≤200ms · transitions 200–350ms · narrative ≤600ms · nothing blocking). Full guidelines in [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md); the token set:

| Token | Value | Use |
| --- | --- | --- |
| `motion-instant` | 80ms | Press feedback, toggles |
| `motion-fast` | 120ms | Hover states, icon morphs, tooltip in |
| `motion-base` | 200ms | Palette open, menus, tag filters, most UI |
| `motion-slow` | 300ms | Page transitions, Dex panel, dialogs, shared-element |
| `motion-narrative` | 450–600ms | Landing reveals, timeline draw-in — once per session |

| Easing | Curve character | Use |
| --- | --- | --- |
| `ease-out` (standard) | fast start, soft landing | 90% of motion: things responding to the user |
| `ease-in-out` | symmetric | Cross-fades, theme toggle |
| `ease-spring` (gentle, no overshoot >2%) | physical settle | Shared-element transitions only |
| `linear` | constant | Progress indication only |

**Context rules:** Hover in at `fast`, out at `instant` (leaving must feel weightless). Scroll-triggered reveals: opacity + ≤16px translate at `base`, once, never re-triggering, disabled under reduced motion. Page transitions at `slow`, content-first (never block data on choreography). **Dex interactions:** thinking = the dot's breathing deepens (period ~2.4s — calm, sub-perceptual at rest, legible when active); streaming text renders without per-character animation gimmicks; panel opens at `slow` with `ease-spring`. **Loading:** skeleton shimmer ≥1.2s period (slower = calmer); anything resolving in <150ms shows no loader at all (flash-of-loader is worse than a beat of silence). **Reduced motion:** every token above collapses per the parity mapping in `08` — full experience, zero meaning lost (XA §11).

## 9. 3D Design Language — the dormant charter

The XA rejected 3D as decoration (D-016); this section exists so a future exception has rules instead of vibes.

- **When 3D may appear:** only when the *subject itself* is three-dimensional — a spatial dataset, a physical prototype, a model from research. 3D as content, never as chrome.
- **Never:** hero ornaments, floating abstract shapes, 3D text, parallax dioramas, or — explicitly — a **3D portrait of Deepak**. The portrait question gets a hard answer: photography (§10). A rendered likeness lands uncanny, ages weekly, and contradicts "honest evidence" as an identity. The Twin already covers "digital Deepak" — as a dot, deliberately (§1.4).
- **If the exception fires:** rendering is *technical-illustrative*, not photoreal — think exploded engineering drawing: neutral matte materials from the graphite ramp, single soft key light + ambient fill (no dramatic rim lighting), fixed orthographic-leaning camera with user-controlled orbit (nothing auto-spins), motion only as user-driven inspection + one settle animation at `slow`. It should look like the SVG line language gained a dimension, not like a game engine visited.

## 10. Photography

- **Portrait style:** natural light, honest color, environmental context (a workspace, not a backdrop), direct or working gaze. One canonical portrait reused consistently beats five inconsistent ones. No heavy grading, no LinkedIn-blue backdrops, no AI-generated or AI-retouched portraiture — on this product, a synthetic photo of the human is a trust contradiction.
- **Gallery style:** documentary, not curated-influencer — real moments, honest light. Consistency comes from a single gentle grade (neutral, slightly lifted blacks) applied uniformly, and from *captions that tell the story* (XA: alt text and captions carry meaning).
- **Project screenshots:** always framed — a neutral browser/device frame on a Surface tier with hairline, consistent corner radius, consistent padding. Full-bleed raw screenshots are forbidden (they shear the layout and expose inconsistent chrome). Dark-mode screenshots on dark surfaces get the luminance cap (§3).
- **Research imagery:** figures are *redrawn in the system's SVG line language* wherever rights and effort allow — this is the single highest-leverage craft investment in the product; original paper figures appear framed like screenshots when not.
- **Consistency rules:** one grade; no filters-of-the-month; no stock photography anywhere, ever (an empty section beats a stock image); every image ships with real alt text; decorative imagery that survives the "does this deposit trust?" test is rare — expect few images outside Gallery, and that's correct.

## 11. Data Visualization

The house style is **ink-first**: charts look like figures from an excellent paper, not a marketing dashboard.

- **Palette:** neutrals carry structure (axes, gridlines at hairline weight, labels in Small); the accent marks *the one series that matters*; comparison series use graphite steps; semantic colors appear only for semantic facts (error rates in danger, success metrics in success). A closed 6-hue categorical set (derived once, colorblind-checked) exists for the rare true-multi-category chart.
- **Charts:** direct labeling over legends whenever geometry allows; tabular numerals; axes start at zero for bar/area (truncated axes are a lie in ink); no 3D charts, no gradient fills, no drop shadows, no donut-with-percentage-in-middle clichés. Animation: one draw-in at `narrative` on first view, then still.
- **Research graphs:** same language as redrawn figures (§10) — SVG line DNA, annotated sparingly, every figure self-sufficient with its caption.
- **Timelines:** the Timeline component (§5) *is* the house time-series idiom — reuse its drawn-line grammar for any temporal viz.
- **Statistics (landing/about):** large sans numerals (§2), Small label, no odometer count-up animations (numbers are truth, not slot machines) — a single fade-in at `base` suffices.
- **Analytics (admin):** compact density, sparklines with hairline strokes, tables-first (numbers over pictures for one expert user), freshness warnings in semantic amber.
- **Network graphs (future knowledge map):** nodes as presence-dot family circles, edges as hairlines, accent for the active node's neighborhood only; force layouts settle and *stop*.

## 12. Accessibility

Non-negotiable floors, extending XA §11 with visual specifics:

- **Contrast:** body text ≥ 7:1 target (AAA) in both modes; all text ≥ 4.5:1 (AA hard floor); large display text ≥ 3:1; UI boundaries and focus indicators ≥ 3:1 against adjacent colors. Text on glass measured against worst-case backdrop (§7). Every palette token ships with its verified pairs.
- **Typography:** minimum sizes per §2 (12–13px absolute floor); user font-size scaling to 200% must not break layouts (rem-based, tested); no justified text (rivers); no light weights below 16px.
- **Keyboard:** everything §5 defines is focusable in logical order; the focus ring (§3) is never suppressed; palette, dialogs, and the Dex panel implement full trap/restore grammar; skip-link renders on first Tab.
- **Screen readers:** semantic landmarks mirror XA §9's information flow; icons are labeled or hidden (`aria-hidden`) — never announced as "image"; state changes (saved, sent, declined, syncing) announced via live regions; Dex's streaming answers announced in sensible chunks, citations as real links (XA §11).
- **Reduced motion:** full parity per §8 and `08`'s mapping table — the reduced experience is *designed*, not degraded.
- **Touch targets:** ≥44×44px interactive minimum, ≥8px between adjacent targets; compact (admin) density may not violate this on touch devices.
- **Focus visibility** is a brand feature: the ring is designed with the same care as hover states, and it appears in design reviews as a first-class state, not an afterthought.

## 13. Responsive Design — adaptive behavior, not resized components

Breakpoint *philosophy* (ranges, not pixel dogma): **mobile** (~<640) · **tablet** (~640–1024) · **desktop** (~1024–1440) · **large** (~1440–1920) · **ultra-wide** (>1920).

| Context | Adaptive behavior (what *changes*, not what shrinks) |
| --- | --- |
| **Desktop** | The reference experience: full nav lanes, palette-forward, hover states active, Dex as side panel over content. |
| **Tablet** | Nav lanes persist if they fit, else collapse to sheet; hover states become first-tap-reveals only where meaning requires (prefer always-visible affordances); two-column indexes drop to comfortable single/double based on card measure, not viewport vanity. |
| **Mobile** | Navigation = wordmark + sheet + palette trigger (palette becomes full-screen); **Dex becomes a bottom sheet** (thumb-reachable, keyboard-safe); tables reflow to labeled cards; timeline keeps its vertical line but tightens rhythm; touch replaces hover everywhere — no interaction may *require* hover (§12); reading column owns the viewport with 24px margins; sticky elements are rationed (one max: the condensed nav). |
| **Large** | Content containers hold their max-widths; the *gained space becomes margin*, then — where designed — marginalia: figure captions beside figures, timeline artifact previews in the gutter. Never stretch the measure. |
| **Ultra-wide** | Hard cap on all containers; canvas breathes symmetrically. A reading column floating in generous space is composed, not wasteful. No multi-pane dashboard-ification of public pages; only the admin may earn a second pane. |

Universal rules: layouts are defined by *content measure* first, viewport second; nothing horizontal-scrolls except the contained gallery filmstrip (XA §6); breakpoint transitions reflow without content loss — nothing exists at desktop that mobile visitors cannot reach.

## 14. Design Rules — the 25 laws

The immutable constitution. Every future designer, developer, and AI assistant is bound by these; exceptions require a logged decision.

1. **Never animate purely for decoration.** Motion is information (XA §5) or it is cut.
2. **Never reduce readability for aesthetics.** If a style choice costs legibility, the style loses — every time.
3. **Hierarchy before effects.** If structure isn't clear in grayscale wireframe, no visual treatment may ship to rescue it.
4. **One accent hue in the entire product.** New hues require a logged decision; "it needed more color" is not a context.
5. **Any given view is ≥95% neutral.** The accent is a signal; rarity is what makes it one.
6. **All spacing on the 4px scale.** Off-scale values are defects, not tweaks.
7. **One primary button per view.** Two primaries is a decision the design refused to make.
8. **Semantic colors mean state, only.** Category coding, decoration, and emphasis have other tools.
9. **Depth is surface + hairline; shadow is reserved for true overlays.** One shadow token, earned by floating.
10. **Never suppress the focus ring.** Under any circumstance, on any component, in any mode.
11. **Labels never vanish** — no placeholder-as-label, no icon-only controls without accessible names.
12. **Mono means machine-truth.** Code, data, paths — never headings, never vibes.
13. **Numbers align.** Tabular figures wherever two numbers might ever be compared.
14. **Nothing blocks on choreography.** Content renders first; motion accompanies, never gates (XA §10.2).
15. **One focal motion per moment.** Two things animating for attention = one bug.
16. **Skeletons match final geometry.** Zero layout shift is a law, not a metric.
17. **Every claim is a link** (XA §10.6). Skills→evidence, stats→sources, Dex→citations.
18. **No dead ends.** Every page, state, and error offers a next step.
19. **Empty states are designed, honest, and singular** — one sentence, one action, no apology.
20. **Hover may enhance; it may never gate.** Touch users get everything.
21. **Consistency outranks novelty.** A worse-but-consistent pattern beats a better-but-second pattern; improve by *replacing everywhere*, or not at all.
22. **No stock anything.** Photography, illustration, and icon exceptions are drawn in-system or don't exist.
23. **Both modes or neither.** No feature ships light-only or dark-only; parity includes imagery treatment.
24. **Reduced-motion parity is a release criterion** — the still experience is complete, not apologetic.
25. **When in doubt, remove** (PRD principle 6 — the tiebreaker for every dispute this document doesn't settle).

## 15. Anti-Patterns — never in Deepak Labs

| Anti-pattern | Why it harms |
| --- | --- |
| **Too much glass** | Blur everywhere destroys contrast, taxes GPUs, and reads as 2024-trend residue. Glass is two surfaces (§7); a third is a regression. |
| **Inconsistent shadows** | Mixed shadow recipes shatter the depth model — visitors stop trusting what's above what. One shadow token exists; use it or a hairline. |
| **Competing animations** | Two simultaneous attention-motions cancel each other and read as chaos (Law 15). The premium feel dies in the crossfire. |
| **Overloaded hero** | A hero doing five jobs (tagline, animation, stats, CTA, particles) does none. The landing's first frame answers *who/what* — everything else waits its turn (XA §2). |
| **Inconsistent icon styles** | Mixed stroke weights/sets are the cheapest-looking defect in interfaces — instantly visible, instantly amateur (§6). |
| **Too many accent colors** | Each added hue devalues every existing one; at three accents, nothing is a signal and the palette is noise (§3). |
| **Gradient text** | The developer-portfolio tell. Ages badly, breaks subpixel rendering, fails contrast math. Never. |
| **Terminal cosplay** | Fake CLIs, typing-effect taglines, `> whoami` sections. Mono means machine-truth (Law 12); pretend-terminals spend credibility to buy cliché. |
| **Odometer numbers** | Count-up stats animate *truth* like a slot machine — precision is the brand; jiggling numbers undermine it (§11). |
| **Placeholder-as-label** | The label vanishes the moment typing starts; users lose context, AT users lose everything (Law 11). |
| **Full-page spinners** | A blank page with a spinner is the system refusing to show its shell. Skeletons or nothing (§5). |
| **Badge inflation** | When everything is "new," nothing is; badges are rationed to real state (§5). |
| **Scroll hijacking** | Overriding scroll physics for choreography breaks the visitor's most practiced gesture. Scrollytelling *responds to* scroll; it never *owns* it (XA §6). |
| **Uncanny digital Deepak** | 3D portraits, AI-retouched photos, or Dex-with-a-face (§9, §10, §1.4). The product's core promise is honest evidence; synthetic likenesses contradict it at the identity level. |

---

## Appendix — Obligations Discharged & Passed Downstream

**Discharged from XA:** quiet-confidence visual system (§1–5) · Twin named and visually defined — Dex + presence dot, no face (§1.4) · glass final call — two surfaces, liquid glass permanently rejected (§7) · contrast targets set — AA floor, AAA body target (§12).

**Passed downstream:**

| Document | Owes |
| --- | --- |
| [`08-ANIMATION_GUIDELINES.md`](08-ANIMATION_GUIDELINES.md) | Motion token implementation detail + reduced-motion parity mapping (ratified alongside this document). |
| [`07-COMPONENT_GUIDELINES.md`](07-COMPONENT_GUIDELINES.md) | Component *engineering* conventions (structure, props, testing) honoring §5's visual DNA — written at tech-stack ratification. |
| Token specification (with `06-TECH_STACK.md`) | Exact values: hex ramp, type sizes px, breakpoints, shadow recipe, icon library ratification, syntax + data-viz closed hue sets. |
| [`04-INFORMATION_ARCHITECTURE.md`](04-INFORMATION_ARCHITECTURE.md) | Applies §4 containers/rhythm to concrete page structures. |
