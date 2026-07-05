# 15 — Design Token System & Component Architecture

> **Status:** Approved draft — v1.0 of the token specification.
> **Owner:** Deepak (Design Systems) · Authored in the role of Staff Design Systems Lead.
> **Upstream (immutable):** PRD (`02`) · System (`11`) · XA (`12`) · DSVL (`03`) · `08` · IA (`04`) · Wireframes (`13`) · Brand (`14`). This document *tokenizes* their rules; it redefines nothing.
> **Scope:** framework-agnostic. Tokens here are named values and contracts; engineering converts them to CSS variables / JSON / platform formats at implementation. **Non-color values are ratified here. Color values (hex) remain open** — the architecture that will hold them is ratified.
> Changes require a [`../memory/DECISIONS.md`](../memory/DECISIONS.md) entry.

---

## 0. Position & Reconciliation

1. **This closes the DSVL's deferred item** ("exact token values ratified later") for everything except hex: spacing, sizing, type, radius, motion, layering are now numbers with names.
2. **Per-domain color groups are rejected.** The brief lists Research/News/Analytics/Admin among color token groups. D-018 rules one accent and forbids category color-coding; giving sections their own hues would repeal it. These domains get **aliases** (pointing at existing tokens) and **density modes**, never new hues. `ai.*` and `chart.*` exist as legitimate closed groups (below).
3. **No Avatar family.** D-019: Dex has no face; visitors have no accounts. The one likeness component is `Portrait` (Deepak's photograph, DSVL §10 rules).
4. **Three-tier token architecture** (primitive → semantic → component) is the load-bearing decision: components never touch primitives; screens never touch anything but semantic/component tokens. This is what lets values change for a decade without a single component edit.

## 1. Naming Convention

**Pattern:** `{category}.{concept}(.{property})(.{variant})(.{state})` — lowercase, dot-delimited, framework-agnostic (maps mechanically to `--css-vars`, JSON paths, or platform constants).

- Categories (closed set): `space` · `size` · `container` · `grid` · `break` · `radius` · `border` · `blur` · `opacity` · `shadow` · `z` · `type` · `icon` · `motion` · `delay` · `focus` · `a11y` · `color` · `ai` · `chart`.
- Semantic names describe **role, never value**: `color.text.muted`, not `color.gray.500` (primitives hold values; semantics hold meaning).
- States are suffixes: `color.interactive.hover`, `color.interactive.disabled`.
- Modes (light/dark, comfortable/compact) are **contexts, not names** — the same token resolves differently per mode; no `color.bg.dark-canvas` tokens, ever.
- New tokens require: role not covered by an existing token + a decision entry (DSVL color-expansion ladder applies).

## 2. Foundation Tokens

### 2.1 Spacing (`space.*`) — unit = 4px; name = multiplier
`space.1`=4 · `space.2`=8 · `space.3`=12 · `space.4`=16 · `space.6`=24 · `space.8`=32 · `space.12`=48 · `space.16`=64 · `space.24`=96 · `space.32`=128 · `space.40`=160.
Off-scale values are defects (DSVL Law 6). Aliases: `space.component-gap`=space.6/8 · `space.section`=space.24…40 (per rhythm) · `space.card-gap`=space.6 (mobile space.4).

### 2.2 Sizing (`size.*`)
`size.control-sm`=32 · `size.control`=40 · `size.control-lg`=48 · `size.touch-min`=44 (a11y floor) · `size.nav`=64 → condensed 48 · `size.dex-panel`=400–480 · `size.admin-rail`=240 → icon 64 · `size.palette`=640 max-w, ~480 max-h.

### 2.3 Containers (`container.*`)
`container.reading`=720 · `container.content`=1200 · `container.wide`=1440 · `container.narrow`=400 (login/centered). Ultra-wide: hard caps hold; space becomes margin (DSVL §13).

### 2.4 Grid (`grid.*`)
Desktop 12 col / gutter `space.6` / margin 64 · Tablet 8 col / gutter 20 / margin 48 · Mobile 4 col / gutter `space.4` / margin 24.

### 2.5 Breakpoints (`break.*`) — ranges made numbers
`break.sm`=640 · `break.md`=1024 · `break.lg`=1440 · `break.xl`=1920. Semantics: <sm mobile · sm–md tablet · md–lg desktop · lg–xl large · >xl ultra-wide (behaviors per `13` §6).

### 2.6 Radius (`radius.*`)
`radius.sm`=4 (inputs, tags-rect, code-inline) · `radius.md`=8 (cards, buttons) · `radius.lg`=12 (overlays: dialog, palette, Dex panel, sheets) · `radius.full`=9999 (pills, dots). Closed set (DSVL §3).

### 2.7 Elevation (`surface tiers` + `shadow.*`) — deliberately flat
Tiers (color tokens, §3): `recessed` → `canvas` → `surface` → `raised`. Shadows: `shadow.none` (everything at rest) · `shadow.overlay` (the *only* real shadow — floating surfaces: dialogs, palette, Dex panel, menus, lightbox chrome). There is no shadow ramp; "elevation scale" is answered by tier + one shadow (DSVL Law 9).

### 2.8 Borders (`border.*`)
`border.hairline`=1px (the structural device) · `border.emphasis`=1px at emphasis color (two strengths via color, not width) · `border.focus`=2px (focus ring only). No other widths exist.

### 2.9 Blur (`blur.*`)
`blur.none`=0 · `blur.glass`=20px (palette + Dex panel only, D-020) · `blur.scrim`=0 (scrims darken, never blur — content behind stays honest). Closed set; a third blur use = D-020 violation.

### 2.10 Opacity (`opacity.*`)
`opacity.disabled`=0.4 · `opacity.scrim`=0.5 · `opacity.hairline-dark`≈0.6× of light-mode hairline (dark-mode hairlines drop opacity, DSVL §3) · `opacity.glass-tint`≥0.85 (readability-first frosting) · `opacity.full`=1. No ad-hoc opacities on text — muted text is a color token, not an alpha.

### 2.11 Z-Index (`z.*`) — bands of 100; nothing between bands
| Token | Value | Layer |
| --- | --- | --- |
| `z.base` | 0 | Page content |
| `z.content-raised` | 100 | In-page sticky (admin table headers, publish bar) |
| `z.nav` | 200 | NavBar, admin rail |
| `z.floating` | 300 | Dropdowns, tooltips, popovers (footnotes) |
| `z.scrim` | 400 | Overlay backdrop |
| `z.overlay` | 500 | Dialogs · sheets · drawers · **palette** · **Dex panel** · lightbox |
| `z.notification` | 600 | Toasts/status (admin autosave conflicts, rare) |
| `z.loading` | 700 | Route-level progress indication |
| `z.emergency` | 800 | Session-expiry, destructive-confirm interrupts |
| `z.reserved` | 900 | Future (the brief's AR layer — reserved with recorded skepticism: no AR surface is planned; the band exists so a future need doesn't renumber the system) |
Rule: palette and Dex share `z.overlay` — they never stack on each other (opening one closes the other).

### 2.12 Typography (`type.*`) — 16 base, ~1.25 ratio (DSVL §2 made numeric)
| Token | Size | Line height | Notes |
| --- | --- | --- | --- |
| `type.legal` | 12 | 1.4 | absolute floor |
| `type.micro` | 13 | 1.4 | table footnotes |
| `type.small` | 14 | 1.5 | metadata, captions |
| `type.body` | 16 | 1.6 | UI default |
| `type.body-reading` | 18 | 1.6 | long-form prose |
| `type.h4` | 20 | 1.4 | |
| `type.h3` | 20–25 | 1.35 | weight-led at low end |
| `type.h2` | 25 | 1.3 | |
| `type.h1` | 31–39 | 1.2 | page titles |
| `type.display` | fluid 39→76 (clamp by viewport) | 1.1 | landing hero only; tracking −1…−2% |
Weights: `type.weight.regular`=400 · `medium`=500 · `semibold`=600 · `bold`=700. Families: `type.family.sans` / `type.family.mono` (DSVL-named; token indirection allows a family swap without component edits). Figures: `type.figures.tabular` mandatory in data contexts. `type.measure.max`=66ch.

### 2.13 Icon sizing (`icon.*`)
`icon.sm`=16 (inline) · `icon.md`=20 (UI default) · `icon.lg`=24 (nav/feature) · stroke 1.5 at 24-grid (scales optically, not linearly — the 16px cut thickens per `14` §6 favicon logic).

### 2.14 Motion (`motion.*`) — from `08`, canonical home now here
Durations: `motion.duration.instant`=80 · `fast`=120 · `base`=200 · `slow`=300 · `narrative`=450–600.
Easings: `motion.ease.out` (standard, 90% of motion) · `motion.ease.in-out` (cross-fades) · `motion.ease.spring` (shared-element only, ≤2% overshoot) · `motion.ease.linear` (progress only).
`motion.loop.dex-breath`=2.4s period — **the only loop token in the system** (Brand §5: one living thing).

### 2.15 Interaction delays (`delay.*`)
`delay.tooltip`=300ms (hover; 0 on focus) · `delay.skeleton`=150ms (no loader under this) · `delay.search-debounce`=180ms · `delay.dex-slow`=8000ms (timeout → retry) · `delay.autosave`=1500ms idle.

### 2.16 Focus ring (`focus.*`)
`focus.width`=2 · `focus.offset`=2 · `focus.color`=`color.interactive.default` · `focus.visible`=always (never suppressed — DSVL Law 10). One recipe, every component, both modes.

### 2.17 Accessibility (`a11y.*`)
`a11y.contrast.body`=7:1 target · `a11y.contrast.min`=4.5:1 floor · `a11y.contrast.large`=3:1 · `a11y.contrast.ui`=3:1 (boundaries, focus) · `a11y.touch.min`=44 · `a11y.touch.gap`=8 · `a11y.motion.reduced`=parity mode (every motion token resolves to its `08` mapping-table equivalent — reduction is a *mode of the tokens*, not per-component logic).

## 3. Color Token Architecture

**No hex here — the vessel, ratified; the liquid, pending** (poured at stack ratification per DSVL).

**Three tiers, strict flow:** `primitive → semantic → component`
- **Tier 1 — primitives:** the physical palette. One neutral ramp (`neutral.0…1000`, ~10 graphite/paper steps), one accent ramp (`accent.100…900`), four semantic hue ramps (`green/amber/red/blue-info`), plus two closed derived sets (syntax, chart). Primitives are *private*: no component or screen may reference them.
- **Tier 2 — semantics:** meaning-named roles (below), each mapped to primitives **per mode** (light/dark resolve differently; names never change).
- **Tier 3 — component tokens:** only where a component needs a role narrower than a semantic (e.g., `button.primary.bg` → `color.interactive.default`). Default posture: components consume semantics directly; tier 3 exists for the exceptions, not as a parallel vocabulary.

**Semantic groups (the contract):**

| Group | Tokens | Notes |
| --- | --- | --- |
| Background | `color.bg.canvas` · `color.bg.recessed` | the paper / inputs & code wells |
| Surface | `color.surface.default` · `color.surface.raised` | tiers (DSVL §3) |
| Overlay | `color.overlay.scrim` · `color.overlay.glass-tint` | scrim at `opacity.scrim` |
| Text | `color.text.primary` · `.muted` · `.faint` · `.inverse` · `.on-accent` | contrast pairs verified per §2.17 |
| Border | `color.border.default` · `.emphasis` · `.interactive` | hairlines |
| Interactive | `color.interactive.default` · `.hover` · `.pressed` · `.disabled` · `.selection` · `.highlight` | hover/pressed = tone steps of one hue (D-018) |
| Accent | *alias of* `interactive.default` | one hue; "accent" and "primary" and "interactive" are the same signal — aliased, not multiplied. There is **no `secondary`**: the DSVL has no second accent; "secondary" UI = neutral treatments |
| Status | `color.status.success` · `.warning` · `.danger` · `.info` (+ `.on-*` pairs, `.surface-*` tints) | reserved for state (DSVL §3); `info` may alias accent |
| Glass | `color.glass.tint` · `color.glass.border` | palette + Dex panel only |
| Focus | `color.focus.ring` → alias `interactive.default` | |

**Requested-domain reconciliation (§0.2):**
- `ai.*` — a *behavioral* group, not a hue: `ai.presence` → alias `interactive.default` (the dot **is** the accent — brand equity by reuse) · `ai.thinking` = same + `motion.loop.dex-breath` amplitude state. No violet, no gradient, no "AI color."
- `chart.*` — the closed data-viz set (DSVL §11): `chart.primary` (alias accent) · `chart.comparison.1…3` (graphite steps) · `chart.categorical.1…6` (derived once, colorblind-verified — the *only* place new hues will ever be minted) · `chart.grid` (hairline).
- `research.* / news.* / analytics.* / admin.*` — **do not exist as color groups.** Differentiation = density mode (admin: compact), iconography, and layout. Any PR introducing `color.news.accent` is a D-018 violation by definition.
- Syntax highlighting: `syntax.1…5` closed set, derived with the chart set, code blocks only.

**Inheritance & modes:** semantic→primitive mapping swaps per mode (light default, dark first-class — DSVL §3); density mode swaps *spacing aliases only* (comfortable/compact), never colors; reduced-motion mode swaps *motion tokens only*. Modes are orthogonal axes — no token belongs to two axes.

## 4. Motion Primitives (`motion.recipe.*`)

Reusable recipes composed from §2.14 tokens — components reference recipes, never raw duration+easing pairs:

| Recipe | Composition | Reduced-motion equivalent (`08` map) |
| --- | --- | --- |
| `hover` | tone-step, in `fast`/out `instant`, ease.out | retained (state ≠ motion) |
| `entrance` | opacity + ≤16px translate, `base`, ease.out, once | present immediately |
| `exit` | opacity, `instant`–`fast`, ease.out | instant |
| `page` | content-first crossfade, `slow`, ease.out | instant swap |
| `shared-element` | card→detail continuity, `slow`, ease.spring | instant nav + heading confirms |
| `scroll-reveal` | = entrance, scroll-triggered, never re-fires | content present |
| `hero` | layered cinematic behind legible text, ≤2s total, once/session | composed static frame |
| `ai-breath` | dex dot, `motion.loop.dex-breath`, amplitude-shift when thinking | static dot + text state |
| `ai-stream` | plain text append, no per-char effects | chunked live-region announce |
| `loading` | skeleton shimmer ≥1.2s period, after `delay.skeleton` | static skeleton |
| `modal` | scrim fade + surface `base`/ease.out; focus-trap on settle | instant + focus-trap |
| `nav-condense` | height 64→48, `fast` | instant |
| `error` | state swap `base`; **no shake** | instant |
| `success` | the two celebrations, `base`, dignified | static confirmation |
| `gesture` | system-native only (IA §11) — no custom gesture animation | n/a |
| `draw-in` | SVG stroke, `narrative`, once/session | fully drawn |

## 5. Layering Rules

The `z.*` bands (§2.11) with behavioral contracts:
- **Base/content** scroll; **nav** persists (hide-on-scroll is a transform within `z.nav`, not a z change).
- **Floating** (tooltips, dropdowns, footnote popovers) attach to triggers, dismiss on scroll/blur, never trap focus.
- **Scrim + overlay** always paired; overlays trap focus, `Esc`+return-to-trigger (`13` archetype E); **one overlay at a time** — opening palette closes Dex panel and vice versa; a dialog above the Dex panel is the single sanctioned stack (destructive confirms), scrim doubles.
- **Notifications** never obscure interactive zones; auto-dismiss with pause-on-hover; admin-only in practice.
- **Loading** (route progress) sits above all content, below emergency; thin, quiet, linear easing.
- **Emergency** interrupts are rare by design (session expiry, unsaved-changes) — anything using this band appears in review.
- **Reserved** band untouched until a real need earns a decision entry.

## 6. Component Architecture

**Universal contracts (inherited by every family — the anti-duplication core):**
- **State set:** `default · hover · focus-visible · active · disabled · loading · error` (DSVL §5) — implemented once as a shared behavior, consumed by all.
- **Focus:** the one ring (§2.16). **Density:** comfortable/compact via spacing aliases. **Modes:** light/dark automatic via semantic tokens.
- **A11y baseline:** accessible name required; keyboard operable; state changes announced; contrast per `a11y.*`. Component-specific expectations below are *additive*.
- **Composition rule:** variants are props/slots on one component, never sibling components; a "new component" that is an old one with different padding is a defect.

| Family | Purpose | Variants | Composition & rules | A11y (additive) | Future |
| --- | --- | --- | --- | --- | --- |
| **Button** | Trigger action | primary (≤1/view) · secondary · ghost · destructive · icon+label | verb+object label (`14` §11); loading state in-button | never icon-only w/o name | split-button *only* via decision |
| **Input** | Capture value | text · textarea · select · date · masked (keys) | label-above always; validation slot below; recessed surface | error text linked (`describedby`) | combobox for relations editor |
| **Card** | Link into the graph | **base** + content variants: `ProjectCard` · `GalleryTile` · mini (Dex context rail) | whole-card link; inner chips stop propagation; shared-element source | one link, one name | new content types = new variant, not new family |
| **Row** | Record in a list | `PostRow` · `PubRow` · `NewsRow` (v2) · `AdminRow` · `SkillRow` | list semantics; inline actions right; rows are the *dense* siblings of cards | actions reachable in row tab-order | — |
| **Navigation** | Wayfinding chrome | NavBar · LaneTabs · Breadcrumb · Footer · AdminRail · bottom-tabs (admin mobile) | closed set; active = weight+underline; sheet on mobile | landmarks; skip-link first | — |
| **Panel** | Side-anchored workspace layer | DexPanel · VersionRail · media detail drawer | independent scroll; page remains visible/legible | dialog or complementary role by use | v2 history rail slot |
| **Dialog** | Decision point | confirm · destructive (type-to-confirm) · form | never for page-able content; 1 primary action | trap+restore; `alertdialog` for destructive | — |
| **Sheet** | Mobile overlay idiom | nav-sheet · filter-sheet · Dex bottom-sheet (drag-expand) | bottom-anchored, thumb-reach; = Dialog contract otherwise | drag handle also a button | — |
| **Drawer** | Desktop edge utility | admin-only (media detail) | public site uses panels/sheets instead — three overlay idioms max | as Panel | — |
| **Tabs** | Peer-view switch | LaneTabs (page-level) · segment (admin editors) | URL-reflected at page level | `tablist` grammar; arrow-key nav | — |
| **Timeline** | Chronological spine | full (`/timeline`) · mini (landing S4) | drawn line `aria-hidden`; real `<ol>`; one-open accordion | disclosure pattern per entry | era filtering |
| **Gallery** | Visual record | tile grid · Lightbox · contained filmstrip | lightbox = Dialog contract + `←/→`; the only horizontal scroll | story-alt mandatory (media library enforced) | album grouping |
| **Chat (Dex)** | Conversation surface | full (`/ai`) · panel · bottom-sheet | message list = own scroll region; citations block + follow-up chips + [take me there] are *slots*; input pinned | live-region chunks; citations = links; stop = button | voice slot · memory header slot (reserved, `13` §4.14) |
| **Chart** | Evidence visualization | sparkline · bar · line · heatmap (github) · network (future map) | `chart.*` tokens only; draw-in once; direct labels | data table fallback (toggle or `desc`) | knowledge-map node/edge kit |
| **Badge/Tag** | State / taxonomy | Badge (semantic, state only) · Tag (neutral pill; interactive=filter) | badge ration (DSVL §5); tags never color-coded | filter tags = pressed-state buttons | — |
| **Portrait** | The one likeness | about-page portrait · (no other avatars — §0.3) | DSVL §10 rules; yearly renewal (`14` §8) | meaningful alt | — |
| **Command Palette** | Universal accelerator | one | groups: Pages·Content·Actions·Ask-Dex; glass; recent-first reopen | combobox+listbox grammar; hint row | new action registration API (governance §8) |
| **Search** | Find visibly | `/search` page · scoped filter inputs | one FTS index, four skins (IA §7); URL-reflected | results announced (count) | semantic = Dex (never a 2nd UI) |
| **Table** | Compare records | public (pubs-adjacent) · AdminTable (sticky header, row-nav) | tabular figures; no zebra; mobile→cards | `<table>` semantics; sort state announced | bulk-select (admin, future) |
| **Form** | Composed capture | contact · admin editors · login | Input family + validation grammar; in-flight submit state; autosave (admin) | error summary focus-jump on submit | — |
| **Markdown/Prose** | Rendered long-form | post body · project narrative · abstract | `container.reading`; element styles = the type scale (one prose spec, all long-form) | heading hierarchy preserved from source | footnote popovers (Floating) |
| **CodeBlock** | Quoted machine-truth | block (label+copy) · inline | recessed; `syntax.*`; no fake terminal chrome | copy announces; horizontal scroll contained w/ focusable region | line-highlight ranges |
| **Media/Figure** | Framed evidence | screenshot-frame · figure+caption · embed slot (reserved) | DSVL §10 framing; lazy; sized (zero CLS) | caption = part of figure (`figcaption`) | project demo embeds |
| **EmptyState / ErrorState / Skeleton** | Honest absence | per IA §9–10 / per-primitive skeletons | drawn-line illustration; 1 sentence; 1 action; skeleton = geometry promise | status announced | — |

## 7. Component Relationships — inheritance & composition

```
universal contracts (state set · focus · density · modes · a11y baseline)
        │  inherited by everything
        ▼
   primitives:  Button  Input  Tag/Badge  Icon  Text
        │  composed into
        ▼
   containers:  Card ── content variants (Project/Gallery/mini)
                Row ─── content variants (Post/Pub/News/Admin/Skill)
                Table · Form · Prose · CodeBlock · Figure
        │  composed into
        ▼
   surfaces:    Panel · Dialog · Sheet · Drawer · Palette   (all inherit
                the Overlay contract: scrim, trap, Esc, return-to-trigger)
        │  orchestrated by
        ▼
   patterns:    archetype screens (13 §3) · Chat · Timeline · Gallery
```

**The three anti-duplication rules:**
1. **One overlay contract.** Dialog/Sheet/Drawer/Palette/Lightbox/DexPanel share one focus-trap/scrim/dismiss implementation — five skins, one behavior. A second modal behavior appearing anywhere is a defect.
2. **Cards and Rows are two families, total.** Every content type renders as a variant of one of them (comfortable vs dense). A "PublicationCard" that isn't the Card base with pub fields may not exist.
3. **Behavior lives at the highest shared level.** Hover recipes, copy-confirm, autosave stamps, URL-reflected filtering — implemented once, consumed everywhere. If two components hand-roll the same interaction, the interaction is promoted to a contract.

## 8. Future-Proofing & Governance

- **Change surface is tiered like the tokens:** re-skinning = edit primitives (hex refresh at a major version, `14` §14) — zero component changes; re-theming a role = edit one semantic mapping; new capability = new component *variant* first, new family only when no family's purpose fits (decision entry required).
- **Closed sets stay closed:** radius, blur, shadow, z-bands, relation kinds, chart hues, overlay idioms (3), accent count (1). Growth happens *inside* open sets (spacing multiples, content variants, palette actions) — the closed/open distinction is the consistency mechanism.
- **Additions ledger:** every new token/variant/family lands with: role justification · which existing token was insufficient · decision entry. The DSVL color ladder (neutral → semantic → accent → decision) generalizes to all categories.
- **Deprecation over deletion:** superseded tokens alias their replacement for one major version, then die in the CHANGELOG — implementations never break silently.
- **The palette-action registry and Dex follow-up chips** are the designed extension points for new capabilities (add actions, not chrome).
- **Review heuristics (fast checks for any future PR):** an off-scale pixel value · a second shadow · a third glass surface · a new hue outside `chart.*` · a component referencing a primitive · two components animating simultaneously · a loop that isn't `dex-breath` — each is a one-line rejection with a doc citation.

---

## Appendix — Handoff Map

| Consumer | Takes from this doc |
| --- | --- |
| `06-TECH_STACK.md` (Phase 4) | Token format decision (CSS vars/JSON), family names (`type.family.*`) confirmation, **hex ratification into §3's architecture** |
| `07-COMPONENT_GUIDELINES.md` | §6–7 as the component contract; adds engineering conventions (files, props, tests) |
| Hi-fi design | §2 values + §3 roles + `13` structures = complete design environment |
| Implementation | Mechanical conversion: `color.surface.raised` → `--color-surface-raised`, etc.; universal contracts as shared code |
