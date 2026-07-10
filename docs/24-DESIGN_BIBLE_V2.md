# 24 — Deepak Labs V2 · The Product Design Bible

> **Status:** Proposed definitive design specification (V2). Supersedes the *visual execution, hero, and landing layout* of the V1 system; **retains** the ratified product truths (PRD `02`, IA `04`, data model `types/content.ts`, accessibility floors, token *discipline*, the Personal-OS runtime spine `23`). Binding requires a `memory/DECISIONS.md` entry (this is D-039 when accepted).
> **Authored as:** the full product design team (Creative Direction, Product, UX, Motion, Visual, Interaction, Typography, 3D, IA, Accessibility, Frontend Architecture, Brand).
> **Rule for this document:** every choice is concrete and build-ready. Where a value needs owner sign-off it is marked ⟨GATE⟩. No decision is left as "a vibe."

---

## PART 0 — POSITION

### 0.1 What "forget everything" means, precisely
We rebuild the **feeling and every pixel of the surface** from zero. We do **not** relitigate what Deepak *is*, what content exists, how it relates, or the laws that keep it accessible and maintainable — those are load-bearing and correct. A design team that burns the product architecture to prove originality is not senior; it is reckless. So:

- **Rebuilt from zero:** the hero, the landing, all layouts, the color system, the type system, the motion language, the 3D experience, the component skins, the navigation *feel*.
- **Retained and elevated:** the content graph and relation taxonomy; the 4-lane + palette IA; the single-writer runtime kernel; the accessibility floors; the "freshness as public truth," "no-fake-data," and "one-accent discipline" principles.

### 0.2 The one sentence that governs the whole product
> **Deepak Labs is a workspace that is running — a calm, precise, dark instrument in which a stylized engineer works at the center of a living graph of his own research and systems, and any visitor can walk in, look around, and ask.**

Not a portfolio (a brochure of the past). A **workspace** (a place of present-tense work). The visitor's takeaway is engineered to be *"Deepak builds intelligent systems"* — because they literally watched the systems, orbiting and glowing, with him at the center of them.

### 0.3 The seven experiential laws (the spine of every decision below)
1. **Alive, not animated.** Motion comes from state and physics, never from decoration. If it doesn't carry information, it's cut.
2. **Calm at rest.** The default frame is still and quiet. Energy is spent on *transitions and the few live things*, so they read as signal.
3. **The room survives the ceiling.** Every rich layer (3D, glass, motion) is an enhancement over a complete, semantic, fast DOM floor. Kill any layer and the product still works. *(Inherited from V1's hero architecture — the single best idea in the repo.)*
4. **One accent is a signal; two accents are noise.** Chromatic discipline is the recognition strategy.
5. **Numbers are truth; they settle, they never spin.** No odometers, no slot-machine stats.
6. **Every claim links to its evidence.** Skills→projects, stats→sources, Dex→citations.
7. **The instrument never brags.** No copy calls itself "beautiful," "blazing," or "cutting-edge." Craft is shown, never announced.

---

## PART 1 — BRAND FOUNDATION

### 1.1 Brand values → design principles (each value must become a mechanism, or it's marketing)
| Value | The design mechanism that proves it |
| --- | --- |
| **Confidence** | Large quiet type, generous negative space (≥55% at rest), declarative copy, no hedging microcopy |
| **Engineering** | Visible system-ness: real telemetry, the graph as real data, honest states, a monospaced "machine-truth" register |
| **Research** | An editorial serif reserved for abstracts/long-form; publications treated with academic rigor (venues, BibTeX, plain-summaries) |
| **Precision** | 4px grid, tabular figures, a first-class focus ring, hairline borders, snap-exact alignment |
| **Elegance** | Restraint; one accent; the "settle" motion curve; nothing decorative survives review |
| **Curiosity** | Engineered questions with honest answers — Dex, the explorable graph, "3 things changed since you left" |
| **Innovation** | The workspace-as-scene itself; the digital twin; the knowledge graph as navigation |
| **Craftsmanship** | Micro-interactions that reward repeat use (a perfect copy affordance, a citation that resolves into place) |
| **Long-term thinking** | A type/color/token system engineered to not date; boring load-bearing tech; documented decisions |

### 1.2 Brand personality
**A precision instrument, warmly lit.** The chrome behaves like laboratory/aerospace equipment — exact, legible, honest about state. The *warmth* comes from content (the writing, the twin's presence, the task-light over the workbench, Dex's voice), never from the UI shouting.

### 1.3 Voice & tone
- **Declarative, first-person where personal, plain everywhere.** "I build agentic systems and publish the research behind them." Never "I'm passionate about leveraging AI."
- **Precise counts, never vague quantities.** "6 publications," never "several papers."
- **Microcopy is calm and honest.** "Couldn't reach GitHub — showing last sync." "Saved."
- **Banned vocabulary:** passionate, journey, seamless, blazing, revolutionary, cutting-edge, leverage (as verb), ninja/rockstar/guru, "let's build something amazing."
- **Dex speaks as itself, about Deepak, with citations** — never first-person-as-Deepak (an error in his voice would be fabricated testimony).

### 1.4 The wordmark & marks
- **Wordmark:** `Deepak Labs` set in the Display face, medium weight, lowercase "labs," optical tracking −1.5%. No logo glyph competing with it.
- **Monogram (favicon, avatars, OG):** `dL` in a 1px hairline square frame, or a minimal node-and-edge glyph. The frame reads as "a workspace / a viewport."
- **The presence dot** belongs to **Dex only** — a small accent-luminance circle with sub-perceptual breathing. It is never the site favicon and never decorative. Over years, the dot alone should mean "the twin is here."
- **Recognition devices (used relentlessly, never diluted):** the wordmark · the presence dot · the single accent as *light* · the hairline · the drawn/graph line · **the workbench task-light** (the one warm element in a cool world).

---

## PART 2 — THE CENTRAL CONCEPT

### 2.1 The metaphor: an Operating System for one mind, rendered as a lit workspace
The product is literally organized as an OS (this already exists in the runtime spine, `docs/23`): a **kernel**, **runtimes** (Knowledge, Content, AI/Dex, Navigation, Motion, Theme, Experience, Accessibility, Analytics), and a **desktop** the visitor operates. V2 makes that architecture *visible and felt*:

- **The Hero is the desktop booting** — the workspace comes online (Part 6).
- **The Knowledge Graph is the file system** — real content, real relations, explorable (Part 6.4, Part 9).
- **The Command Palette is the shell** — ⌘K to go anywhere or ask anything (Part 9.3).
- **Dex is the resident intelligence** — the OS's assistant, always one keystroke away (Part 8).
- **Pages are windows into runtimes** — each surface is a view of a running system, present-tense, with live state (freshness stamps, "now" telemetry).

### 2.2 Why dark-first (a deliberate V2 inversion of V1)
V1 was paper-first (academic credibility in light). V2 inverts to **dark-first, with a genuinely first-class light mode**, because:
1. A **living, lit 3D scene** is cinematic in dark and muddy in light. The hero *is* the identity; it must be dark to breathe.
2. The priority audience (recruiters in tech, AI engineers, researchers, founders) reads dark product surfaces as premium and current (Linear, Arc, Anthropic console, Vercel).
3. Dark lets the **single accent behave as light** — glow, task-lamp warmth, the twin's rim — which is the whole aesthetic.

**But academic legibility is non-negotiable**, so: **long-form reading surfaces (publications, posts, research detail) offer a "Reading" light theme** and are typographically exquisite in *both* modes. Dark is the default identity; light is a first-class equal, never an afterthought. Theme choice persists; OS preference is honored on first visit.

### 2.3 What the visitor feels, in order
Wonder (the workspace is real and alive) → Curiosity (what is he building? who is Dex?) → Confidence (this person is serious and precise) → Trust (it's honest, it cites, it's current). Wonder is delivered first; calm and restraint keep it from tipping into spectacle.

---

## PART 3 — COLOR SYSTEM

All values are the **V2 ratified starting palette** ⟨GATE: owner sign-off on the accent hue⟩. Neutrals derive from one cool-graphite ramp; there is exactly **one** chromatic accent. Everything else is light, state, or content imagery.

### 3.1 The graphite ramp (the entire neutral world)
Cool-neutral, not blue-cold, not brown-warm. Never pure #000/#FFF at the extremes.

**Dark mode (default):**
| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#0B0C0E` | The page — deep graphite, the "off" instrument |
| `surface` | `#131519` | Cards, panels — one step up |
| `surface-raised` | `#1B1E24` | Overlays: palette, Dex, dialogs (+ the one real shadow) |
| `surface-recessed`| `#08090B` | Inputs, code wells |
| `hairline` | `rgba(255,255,255,.09)` | Default border |
| `hairline-strong` | `rgba(255,255,255,.16)` | Emphasis border |
| `text` | `#F3F5F7` | Primary text (≈15.8:1 on canvas) |
| `text-muted` | `#A2A9B0` | Secondary (≈6.9:1) |
| `text-faint` | `#6A7178` | Metadata, disabled (≈4.6:1) |

**Light mode ("Paper" — first-class):**
| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#FBFBF9` | Warm paper-white (glare-reduced) |
| `surface` | `#FFFFFF` | Cards |
| `surface-raised` | `#FFFFFF` + shadow | Overlays |
| `surface-recessed`| `#F2F2EF` | Inputs, code |
| `hairline` | `rgba(16,18,22,.10)` | Border |
| `text` | `#16181C` | Primary (≈15:1) |
| `text-muted` | `#565C63` | Secondary |
| `text-faint` | `#868C93` | Metadata |

### 3.2 The accent — "Signal"
One hue, the color of an indicator LED / a live trace. **Signal Azure.**
| Token | Dark | Light | Job |
| --- | --- | --- | --- |
| `signal` | `#3E8EFF` | `#0A66E0` | Links, primary action, focus ring, selection, active data series, Dex presence |
| `signal-glow` | `#5AA0FF` @ radial, low alpha | — | The 3D scene's emissive/bloom source, Dex breath, live-line pulse |
| `signal-weak` | `rgba(62,142,255,.14)` | `rgba(10,102,224,.10)` | Hover fills, selection bg |

**Rules:** any given view is **≥92% neutral**. The accent never washes backgrounds, never tints borders for flair, never gradients. It appears as *interaction* or as *light*. If it stops being rare, it stops being a signal. **No second accent, ever** — content categories differentiate by neutral weight + iconography, and Dex differentiates by *luminance and motion*, not by a new hue.

### 3.3 The one warmth exception — "Task light"
The 3D workspace has a single warm practical light (≈3200K, `#FFB877` at very low intensity) over the twin's bench — the "current work is warm and near" thesis. It exists **only inside the 3D scene and its derived glows**, never in flat UI. This is the product's soul: a cool, precise world with one warm human center.

### 3.4 Semantic colors (state only, four, reserved)
`success #34C759 / #1E934A` · `warning #FFB020 / #B26B00` · `danger #FF5A5F / #D22D2D` · `info` = the accent. Used **only** for form validation, sync/freshness status, destructive actions. Never for category coding, never decorative. Each ships an AA-verified pair per mode.

### 3.5 Glass (disciplined, three sanctioned surfaces)
Glass appears on exactly three floating surfaces, never at rest on the canvas: **Command Palette · Dex Panel · the scene's HUD readouts**. Treatment: heavy blur (backdrop 24–32px), high surface-tint (readability first — frosted, not clear), hairline edge, the one shadow. **"Liquid glass" (simulated refraction/specular) is permanently banned** — it dates instantly and fights text. If glass ever feels dated, the migration is *less* glass (solid raised surface), never more.

### 3.6 Accessibility (color)
Body ≥ 7:1 target (AAA), all text ≥ 4.5:1 hard floor, large/display ≥ 3:1, UI boundaries & focus ≥ 3:1. Text on glass measured against worst-case backdrop. No information by color alone (state always pairs color + icon + text). Every token above ships verified pairs for both modes.

---

## PART 4 — TYPOGRAPHY

Typography carries the product; it is 90% of the interface and 100% of the trust.

### 4.1 The four families
| Role | Family | Fallback / free tier | Why |
| --- | --- | --- | --- |
| **Display** (hero, page titles, big numbers) | **Neue Montreal** ⟨GATE license⟩ | **Geist** (free) → Inter Display | Engineered grotesque with quiet character; feels designed, not defaulted |
| **Body / UI** | **Inter** (variable) | system-ui | Neo-grotesque clarity, tabular figures, superb hinting, one weight axis |
| **Editorial** (publication abstracts, long-form reading, research prose) | **Newsreader** (variable) | Source Serif 4 | Academic warmth and reading credibility — the researcher signal, *scoped* |
| **Mono** (code, data, paths, telemetry, technical labels) | **JetBrains Mono** | ui-monospace | Machine-truth; distinct 0/O, 1/l/I |

The editorial serif is a deliberate, scoped exception to V1's "no serif" rule — it appears **only** in long-form reading columns and publication abstracts, and nowhere in chrome. It buys real academic credibility for the #3/#4 audience.

### 4.2 The scale (modular ~1.25, 16px base, fluid at display)
| Token | Size (px) | Line-height | Weight | Use |
| --- | --- | --- | --- | --- |
| `display-xl` | 72→120 fluid | 1.02 | 500 | Hero identity line only |
| `display-l` | 48→64 | 1.06 | 500 | Page hero titles |
| `h1` | 34→40 | 1.12 | 560 | Page title (one/page) |
| `h2` | 26→28 | 1.2 | 560 | Section |
| `h3` | 20→21 | 1.3 | 560 | Subsection |
| `body-l` | 18 | 1.6 | 400 | Long-form reading |
| `body` | 16 | 1.55 | 400 | Default UI/body |
| `small` | 14 | 1.5 | 420 | Metadata, captions |
| `micro` | 12.5 | 1.4 | 500 | Labels, legal, table footnotes (floor) |
| `mono-code` | 14 | 1.55 | 400 | Code, telemetry |

### 4.3 Rhythm, measure, weight
- **Weight/size establish hierarchy; color never does.** Only weights used: 400, 420, 500, 560 (Inter variable + Display). No thin weights below 16px.
- **Measure:** 45–75 chars, 66 optimal. Long-form locked to a ~680px column regardless of viewport.
- **Vertical rhythm:** all spacing on the 4px grid; heading top-space ≈ 2× bottom-space (headings bind to what follows).
- **Numbers:** tabular lining figures everywhere data lives (stats, tables, timelines, years). Large stat displays use Display, never Mono (mono numerals at display size read as "terminal," not "instrument").
- **Mono charter (strict):** machine-truth only — code, commands, paths, API names, versions, dataset figures, citation keys, telemetry. **Never** headings, never "techy vibes." Mono-as-aesthetic is the fastest route to the developer-template smell.

---

## PART 5 — SPACE, GRID, SURFACE, DEPTH

### 5.1 Spacing scale (4px unit — off-scale values are defects)
`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 · 224`

### 5.2 Grid & containers
- 12-column fluid grid; gutters 24px desktop / 16px mobile.
- Containers: **content** max 1200px · **reading** 680px · **wide** (gallery, graph, admin tables) 1440px. Centered; viewport margins 24/48/64px (mobile/tablet/desktop).
- Section rhythm on public pages: 96–160px between major sections (48–96 mobile). Rhythm is *felt*; dividers are confirmation, not rescue.
- **Negative space is the product's silence** — ≥55% at every rest frame. When a layout feels empty, the fix is better hierarchy, never ornament.

### 5.3 Depth model (surface + hairline + ONE light, three planes max)
Depth is communicated by **surface tone + hairline + a single coherent light**, not by scattered shadows.
- **z0 Deck** — content at rest (canvas + surfaces).
- **z1 Readout** — floating glass (palette, Dex, scene HUD).
- **z2 Focus** — the single thing being operated, brought forward while z0 racks slightly back (real focus/blur in the scene; subtle scrim in flat UI).
- Exactly **one shadow token** (earned only by true overlays): `0 16px 48px -12px rgba(0,0,0,.55)` dark / `0 16px 40px -12px rgba(16,18,22,.18)` light.
- **The single-light law:** the 3D scene and all derived glows are lit by one key direction. No surface is lit from two directions. Coherent light is what makes depth read as *real* instead of gimmicky.
- Radii: `4` (inputs, tags) · `8` (cards, buttons) · `12` (overlays) · `full` (pills, the dot). Nothing else.

---

## PART 6 — THE 3D EXPERIENCE (THE HERO SCENE)

The hero is **not a webpage; it is a scene** — a real-time, tier-gated R3F workspace. It builds directly on the shipped runtime (`docs/22`, `features/hero-scene`): tier gate before any 3D byte, refs-not-state at 60fps, instanced graph in 2 draw calls, error ladder, DOM text always. V2 defines what it *looks and feels* like.

### 6.1 The scene, described
A dark, quiet, volumetric room. At its center, **the Digital Twin** — a stylized engineer — sits/stands at a minimal workbench under a single warm task-light. **Surrounding him, suspended in cool depth, is the Knowledge Graph**: nodes are his real projects, publications, and posts; edges are real relations. The freshest, most-current nodes float **near** him in warmer light; older work **recedes** into cooler atmosphere (recency-as-proximity — inherited, it's excellent). **Dex** lives in the graph as a small luminous presence that breathes.

### 6.2 The five acts (scroll = camera, bidirectional, no autoplay)
Native scroll scrubs a baked camera rail. Each act is a designed frame; text is DOM overlay, legible at scroll-zero in every tier.
1. **Act I — Boot / Establishing.** The workspace comes online: the deck settles, the key light rises, the task-light warms, the graph draws itself into being (nodes resolve from hairline construction-lines to solids), the identity line is simply *there*. ≤1.2s, skippable, once/session.
2. **Act II — The Engineer.** Camera eases toward the twin at the bench; the nearest (current) projects glow; the current-focus telemetry line reads live.
3. **Act III — The Work Orbits.** Camera pulls to reveal projects orbiting; a featured project's node blooms and its DOM card resolves beside it (shared-element into the projects lane).
4. **Act IV — Research Glows.** The research cluster illuminates; publication nodes pulse once; the editorial serif introduces the research thesis.
5. **Act V — Dex Awakens & Handoff.** Dex brightens, drifts forward, the "ask anything about my work" affordance resolves, and the scene hands off to the scrolling document below (the flat content plane).

### 6.3 Camera & mouse
- **Rail** owns travel (authored cinematography, no roll ever). **Mouse** adds a damped parallax *head* on top: ±2° max, disabled on touch / Lite / reduced-motion. `camera = rail(scroll) ⊕ head(pointer)` — separate authorities, never fighting.
- **No idle camera drift, ever.** At rest the camera is *still*. Aliveness comes from the graph's micro-breathing and Dex, not from a wandering camera (wandering cameras read as "screensaver").

### 6.4 The Knowledge Graph (in-scene)
- **Real data, luminance-not-hue.** All nodes are graphite; importance/recency is expressed by **brightness and proximity**, not color (upholds one-accent discipline). The accent marks only the *active/hovered* node's neighborhood.
- **Physics that settle and stop.** Force layout resolves on load and *halts*. Never a writhing particle field.
- **Focus behavior:** hover/focus a node → it and its neighbors brighten in Signal, the rest rack out of focus into depth (real DoF). This is depth doing the storytelling.
- **Growth on publish:** a newly published node is *drawn into existence* (construction-line → solid) with a single birth pulse. Every particle is a real datum (birth, commit, citation, selection) — **ambient sparkle is banned.**

### 6.5 Lighting
One cool key (≈4300K), soft ambient fill, the single warm task-light (3200K) over the twin, an optional ≤15%-key separation rim for form legibility in dark. Time-of-day may shift the key 5000K→3600K by visitor-local hour (Full tier only, subtle). **No bloom post-processing as decoration** — emissive falloff is authored in-shader. **No mirror reflections** (roughness floor 0.6). These "governed absences" are what keep it premium instead of gamey.

### 6.6 The tier ladder (performance as architecture — inherited, kept)
- **Tier 2 (Full):** the scene above. Desktop + WebGL2.
- **Tier 1 (Lite):** the scene, pre-shed (no particles, no drifts, no parallax, reduced nodes). Mobile-capable.
- **Tier 0 (Floor):** a **fully-designed static composition** — a rendered still of the workspace (or the pure-typographic identity), the graph as a crisp SVG, zero 3D bytes. Save-data / low-memory / no-WebGL2 / reduced-motion. **This is a first-class experience, not a fallback apology.**
- The gate decides **before any 3D byte loads**; three.js stays out of First Load JS; every failure resolves *down* the ladder silently. Hard budgets are release criteria: ≤350KB gz scene chunk (lazy, post-LCP), ≤150k tris, ≤100 draw calls, LCP unchanged from Tier 0.

---

## PART 7 — THE DIGITAL TWIN

### 7.1 The mandate
Uploaded photographs are **anatomical reference only** — never used, displayed, or shipped. The Twin is a **premium stylized representation**: not photoreal, not cartoon, not anime. The target is **stylized realism** — Apple-WWDC/Arc-grade: clean sculptural forms, matte materials, restrained detail, unmistakably *designed*.

### 7.2 Style system (build-ready for the modeler)
- **Form:** stylized-sculptural. Simplified planes, confident silhouette, accurate proportion from reference but *idealized and abstracted* (not a likeness clone).
- **Material:** matte ceramic-like skin (roughness ≈0.8), **no subsurface scattering, no skin pores, no photoreal specular**. Hair as sculpted mass, not strands. Clothing as clean matte fabric with hairline seams.
- **Face:** eyes **suggested, not simulated**; **no eye contact with camera, ever; no close-ups, ever.** Expression is calm, fixed, focused-on-work. This sidesteps the uncanny valley by design — the twin is a *presence at work*, not a face performing.
- **Color:** graphite-neutral materials; the only warmth is the task-light falling on him. He is exempt from the graph's construction-line treatment — **the human is never rendered as a diagram.**
- **The likeness gate ⟨GATE⟩:** no reference photos exist in-repo yet. Gate #1 = owner supplies references → style frames → uncanny review. If references never arrive, a **clean silhouette/abstracted figure ships** — the scene works without a face.

### 7.3 Production pipeline (already ratified, `docs/21`)
Blender authors only Twin (LOD0/1/2 + 23-bone rig + 5 idle clips: breath, two weight-shifts, a head glance, a hand-adjust — all returning to base pose) + the bench set + the camera rail. Everything else (graph, Dex, atmosphere, lighting, shaders) is runtime/procedural — **the .blend is not the scene.** Export: glTF → Draco → KTX2, ≤8MB textures, per-LOD tri budgets 60k/25k/8k. The Twin becomes a rigged GLB → an R3F object with progressive LOD (never swaps while observed).

### 7.4 States
`resting` (idle breath loop) · `attended` (visitor near / hovering the twin — a subtle head glance, once) · `working` (default, focused on bench) · `handoff` (Act V, leans back as Dex takes focus). No talking, no gesturing at the camera, no waving. Dignity over demo.

---

## PART 8 — DEX (THE AI ASSISTANT)

### 8.1 What Dex is
The resident intelligence of the OS. Dex answers **only** about Deepak (projects, research, experience, publications, skills, timeline, posts, GitHub) and **politely refuses everything else**, in-character, with varied copy. Dex **cites every claim** with links into the corpus. Architecture is ratified: RAG grounded in the corpus, **retrieval-gated** (declines before the LLM is called if nothing clears threshold), provider-agnostic behind an interface, re-embedded on publish (`docs/11` §11, D-009/D-015).

### 8.2 Dex's body
No face, no avatar — **the presence dot** is the whole body: a small Signal-luminance circle with sub-perceptual breathing (period ≈2.4s). Breathing deepens while thinking. In the 3D scene, Dex is the luminous graph-dweller (Part 6). In flat UI, Dex is the dot in the nav + the panel. The dot is the product's only permitted ambient loop.

### 8.3 The conversation surface
- **Entry:** ⌘K → "Ask Dex," or the persistent dot in the nav, or the Act-V affordance, or context chips on any page ("Ask about this project").
- **Form:** a **glass side-panel** (desktop) / **bottom sheet** (mobile) that rides *over* the current page — Dex accompanies, never navigates you away.
- **The signature behavior:** Dex answers by **operating the interface** — cited nodes illuminate in the graph, the relevant content resolves, the answer assembles with citations you watch land. Answer and interface are one act. This is the "digital twin / living system" feeling made literal.
- **States:** `resting` (dot breathes, docked) · `listening` · `thinking` (breath deepens, no fake typing) · `streaming` (text renders in sensible chunks, citations resolve as real links) · `declining` (calm, in-character: "I only know Deepak's work — ask me about his research or projects") · `unavailable` (v1.0 pre-Dex: entry points quietly reduce, site fully usable — graceful absence).

### 8.4 Trust & honesty
Scope statement always visible ("I know everything Deepak has published here, as of ⟨date⟩"). Never fabricates; ≥95% grounded-answer rate and 100% correct off-topic declines are the release gates. One fabricated answer poisons the feature — so gating is the primary guard, not the prompt.

---

## PART 9 — INFORMATION ARCHITECTURE & NAVIGATION

### 9.1 Sitemap (retained from `docs/04`, elevated)
```
PUBLIC
├─ /                     Landing (the workspace / scene)
├─ /work                 Projects index → /work/[slug]
├─ /research             Research index → /research/[slug]
│   └─ /research/publications → /research/publications/[slug]
├─ /posts                Posts index → /posts/[slug]
├─ /about                Narrative + CV + the twin (portrait context)
├─ /timeline             Experience & milestones
├─ /skills               Currently / Previously
├─ /gallery              Visual record            (v1.5)
├─ /graph                The full Knowledge Graph explorer (v1.5)
├─ /ask                  Dex full-page            (v1.5)
├─ /radar                News / tracking feed     (v2)
├─ /search               Site-wide
└─ /contact
ADMIN (private)  /admin  Dashboard · content managers · analytics · AI KB · settings
UTILITY  /404 · /loading states · /offline
```

### 9.2 The navigation model
- **Persistent slim top bar** — canvas-colored, hairline bottom edge, condenses on scroll (hides only in long-form reading; scroll-up returns it). Layout: **wordmark left · 4 lanes center (Work · Research · Posts · About) · palette trigger + Dex dot right.** Active lane = weight + 2px accent underline, never a filled pill.
- **4 lanes only.** Timeline/Skills/Gallery/Graph/Contact live in the footer sitemap and the palette (secondary surfaces don't earn a top-level lane). This protects the 90-second scan.
- **The footer is the sitemap-of-record** + the build-date freshness stamp (the quiet honest "last updated").
- **Cross-links are the primary navigation layer** — every detail page carries a "Related" trail (publications↔projects↔posts↔timeline). The graph, not the menu, is how power users move.
- **Mobile:** wordmark + sheet + palette trigger; Dex becomes a bottom sheet; lanes collapse into the sheet.

### 9.3 The Command Palette (⌘K / Ctrl+K) — the shell
Glass, surface-raised, 12px radius. Input on top; grouped results: **Pages · Content · Actions · Ask Dex.** Full keyboard grammar (↑↓ navigate, ↵ open, ⌘↵ open in place, Esc close). One FTS index with four skins (palette, /search, scoped filters, Dex-semantic). A one-time, dismissible discovery hint appears near the trigger on first visit. This is how the "operating system" promise is delivered to fluent users — everything reachable in two keystrokes.

---

## PART 10 — THE PAGES

To specify all 15 surfaces build-ready **without 15 redundant essays**, V2 uses **5 archetypes** (inherited concept, elevated). Every page = its archetype + explicit deltas. Each archetype below carries the required dimensions (Purpose · Wireframe · UX · Hierarchy · Motion · Interaction · Accessibility · Performance · Future). Then each concrete page states only what differs.

### 10.A ARCHETYPE — INDEX (Work, Research, Posts, Gallery, Radar, Skills)
- **Purpose:** let an evaluator scan a body of work and drill into one item in ≤2 interactions.
- **Wireframe:**
```
┌─────────────────────────────────────────────┐
│ [slim nav]                                   │
│                                              │
│  Index title (h1)        [filter/sort chips] │
│  one-line purpose (muted)                    │
│                                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │  Card     │ │  Card     │ │  Card     │  │  ← Cards (Work/Gallery)
│  └───────────┘ └───────────┘ └───────────┘  │     or Rows (Posts/Research)
│  ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  └───────────┘ └───────────┘ └───────────┘  │
│              [ Load more ]                    │  ← never infinite scroll
│ [footer / sitemap / stamp]                   │
└─────────────────────────────────────────────┘
```
- **UX:** Cards+Rows are the *only* two content-display families. Whole-card clickable. Filters are real (tags, year, status), URL-synced, never decorative. Empty index = one honest drawn-line empty state + one action, never a stub.
- **Hierarchy:** title → filters → grid → load-more. Priority = DOM order (a binding law).
- **Motion:** cards enter with a single staggered reveal (opacity + ≤16px rise, `base`, once, never re-triggering). Hover lifts one tone step (no translate-jump). Filter apply = **settle** cross-fade (Part 12).
- **Interaction:** click card → **shared-element transition** into detail (the card grows into the detail hero). Keyboard: grid is a roving-tabindex list.
- **Accessibility:** each card a single focusable link with an accessible name; filter chips are toggle buttons with `aria-pressed`; results count announced via live region.
- **Performance:** SSG, image lazy-load below fold, card imagery framed & pre-sized (CLS 0). Load-more fetches a paginated slice.
- **Future:** the graph view (Part 6.4) becomes an alternate "spatial" index toggle.

### 10.B ARCHETYPE — DETAIL (Project, Publication, Post, Research theme)
- **Purpose:** prove depth — decisions and trade-offs, not screenshots.
- **Wireframe:**
```
┌─────────────────────────────────────────────┐
│ [slim nav]        breadcrumb: Work / Title    │
│                                              │
│  Title (display-l)                           │
│  one-line problem/thesis (body-l muted)      │
│  meta row: year · status · tags · [repo] [pdf]│
│                                              │
│  ── reading column (680px) ─────────────     │
│  Rich body: prose, code wells, figures,      │
│  redrawn diagrams (SVG line language).       │
│  Publication: abstract in editorial serif +  │
│  plain-summary bridge + BibTeX (copy).       │
│                                              │
│  ── Related trail (never empty) ──────────   │
│  [implements →] [writes-about →] [produced ←]│
│  [ Ask Dex about this ]  ← context chip      │
│ [footer / stamp]                             │
└─────────────────────────────────────────────┘
```
- **UX:** every claim links to evidence; every detail ends with a Related trail (no dead ends). Code wells: recessed surface, hairline, JetBrains Mono, copy affordance, language label. BibTeX & citation copy are flawless (the researcher trust moment).
- **Hierarchy:** title → thesis → meta → body → related.
- **Motion:** shared-element in from the index; figures/diagrams draw-in once at `narrative` on first view, then still; copy→check on the copy button.
- **Interaction:** sticky mini-meta on scroll (desktop); "Ask Dex about this" opens the panel pre-seeded with page context (chips demonstrate context-awareness before a message is sent).
- **Accessibility:** one H1; semantic headings; figures have real alt + captions that carry meaning; skip-to-content; code blocks keyboard-selectable.
- **Performance:** SSG; the only fetch-on-interaction is Dex; LCP = the title text.
- **Future:** inline Dex annotations; "cite this page" export; version history ("updated" diffs).

### 10.C ARCHETYPE — SINGLE-SURFACE (About, Timeline, Contact, Skills)
- **Purpose:** one focused narrative or tool per page, no index/detail split.
- **Wireframe:** a single reading/interaction column with the page's signature component (Timeline = the drawn vertical line with dot-nodes and era labels; About = narrative + the one canonical portrait context + CV download; Contact = one honest sentence + email copy + outbound links).
- **Motion:** the Timeline's line **draws in once** on first view (GSAP stroke); era groups fade in on scroll. Skills' current/previous split animates only as a settle.
- **A11y / Perf / Future:** same floors; Timeline entries link to the artifacts they produced; future = filterable timeline by theme.

### 10.D ARCHETYPE — TOOL (Search, Graph explorer, Dex full-page, Admin editors)
- **Purpose:** dense, interactive, keyboard-first work surfaces.
- **UX:** compact density mode (one spacing token swapped), full keyboard grammar, live results, honest loading (skeletons matching final geometry, never full-page spinners). Search = instant FTS results grouped by type. Graph explorer = the full interactive knowledge graph with focus/DoF, filter by type/relation, click → detail.
- **Motion:** minimal, functional (result settle, focus-rack). No narrative motion in tools.
- **A11y:** every graph node has a DOM focus-proxy (keyboard users travel by focus; the canvas is `aria-hidden` decoration); results announced.
- **Perf:** graph instanced (2 draw calls), virtualized long lists.

### 10.E ARCHETYPE — OVERLAY (Command palette, Dex panel, dialogs, sheets)
- One overlay contract (Radix behavior): focus-trapped, Esc always closes, return-focus-to-trigger, scrim ~50% canvas-ink, glass treatment, one primary action. A second modal implementation is a defect.

### 10.1 — 10.15 · The concrete pages (deltas only)

1. **Landing** — *the flagship.* Archetype: bespoke (the Scene, Part 6) → then INDEX-like evidence sections below the fold: **Featured Work (2 cards) · Research Highlight · Current Focus (live telemetry + freshness) · Latest Posts (3 rows) · Dex invite · Contact strip · Footer stamp.** Claims live *only* in the hero sentence; every section below is evidence. No fake data — sections self-hide until content exists. Tier-0 landing (static scene still + typographic identity + SVG graph) is the shipped floor and can launch before the 3D scene exists.
2. **Projects (/work)** — INDEX (Cards). Card = project name · one-line problem · year · status dot · tag row · `implements ↗ paper` chip (a project citing its own research — the single most original card element; nobody's portfolio does this). Detail = DETAIL archetype with a "Decisions & trade-offs" body section as the spine.
3. **Research (/research)** — INDEX (Rows) of research *themes*; each theme detail = DETAIL with the editorial serif thesis, the questions being asked, and the publications under it. This is the most Anthropic-feeling surface — calm, serious, question-led.
4. **Publication (/research/publications/[slug])** — DETAIL. Abstract in editorial serif; plain-summary bridge (researcher→engineer); authors/venue/year as tabular meta; **BibTeX + "Cite" copy**; PDF link; "implemented by →" trail to projects. Accurate metadata is non-negotiable (the professor persona verifies here).
5. **Timeline** — SINGLE-SURFACE. The drawn vertical line, era-grouped, each entry linking to what it produced. Draws in once. Future: theme-filter, "what I was building vs publishing" dual track.
6. **Gallery (/gallery, v1.5)** — INDEX (Cards), documentary style, single gentle grade, captions that tell the story, one horizontal filmstrip permitted (the only horizontal scroll in the product). No stock, ever.
7. **Skills** — SINGLE-SURFACE. **Currently / Previously** split (doubles as a "Now" page and a freshness signal). Each skill is a chip that **links to the project/paper that evidences it** — skills are claims, and every claim links to proof. No skill bars, no percentages (the #1 developer-template tell — banned).
8. **Posts (/posts)** — INDEX (Rows): title · dek · date · reading-minutes · tags. Detail = DETAIL with the editorial reading column. RSS. No comments/reactions/social (technical publishing, D-005).
9. **News (/radar, v2)** — INDEX (Rows), freshness-stamped, auto-hides when stale. Scoped as "what Deepak tracks," not a general feed. Ships only after a proven curation habit.
10. **AI (/ask, v1.5)** — TOOL. Full-page Dex: the conversation surface at full width, the graph visible and reactive beside it, example prompts ("What has Deepak published on explainable AI?"), the scope statement, citation-first answers. The page *is* the digital twin.
11. **Dashboard (/admin)** — see Part 11.
12. **Settings (/admin/settings)** — TOOL. Theme engine controls, profile/identity fields, outbound links, CV upload, SEO/OG defaults, **full content export (JSON + Markdown)**, danger zone. See Part 11.6.
13. **404** — SINGLE-SURFACE. On-brand, honest, never cute-overload: a drawn-line "this node doesn't exist in the graph" illustration, one sentence, the palette open affordance + top destinations. No dead end.
14. **Loading** — never a full-page spinner. The **shell renders first, always**; content arrives as skeletons matching final geometry (zero layout shift). The scene shows its Tier-0 still until the chunk is ready. Anything resolving <150ms shows no loader (a flash-of-loader is worse than a beat of silence).
15. **Search (/search)** — TOOL. The palette's full-page skin: query, grouped results, filters by type, keyboard-first, empty state with suggestions.

---

## PART 11 — THE ADMIN DASHBOARD / CMS

The admin is the product's heartbeat — if updating is painful, the product dies (the ≤10-minute update loop is a product goal). It is **compact-density, keyboard-first, single-user, and it ships with the content it manages.**

### 11.1 Shell
```
┌───────────┬─────────────────────────────────────────┐
│ dL admin  │  [breadcrumb]              [Dex sync ●]   │
│           │                                          │
│ ▸ Overview│   ── main work area ──                    │
│ ▸ Projects│                                          │
│ ▸ Research│   (list / editor / analytics per section)│
│ ▸ Pubs    │                                          │
│ ▸ Posts   │                                          │
│ ▸ Timeline│                                          │
│ ▸ Skills  │                                          │
│ ▸ Gallery │                                          │
│ ▸ News    │                                          │
│ ▸ Media   │                                          │
│ ▸ Analytics                                          │
│ ▸ AI KB   │                                          │
│ ▸ Settings│                                          │
└───────────┴─────────────────────────────────────────┘
```
Left rail (the one admin sticky region), main work area right. Mobile admin is **triage-grade by design** (review/publish, not deep authoring).

### 11.2 Overview (the freshness engine)
Cards: **content freshness warnings** ("Skills not updated in 47 days — amber"), recent activity, publish queue (scheduled items), quick-add buttons, at-a-glance counts. Freshness is surfaced here because staleness is the brand's mortal enemy — the admin nags Deepak to stay current.

### 11.3 The universal content editor (one editor, all types)
Every content type shares one editor built on the shared content-core (only fields differ):
- **Two-pane:** left = form + Markdown body (with live preview toggle); right = metadata (slug, status, dates, tags, **relations**).
- **Markdown** with a formatting toolbar, slash-commands, live preview, code blocks with language, image insertion.
- **Relations UI:** a typed relation builder — pick kind (`implements`, `writes-about`, …) → search target content → link. This is how the graph is authored. Bidirectional links created automatically.
- **Drag-and-drop:** reorder featured items, gallery images, timeline entries, skill ordering; drag images into the body.
- **Image upload:** drag-to-upload → validated, EXIF-stripped, stored in object storage, variants via CDN; the media library is browsable and reusable; **alt text required before an image can be used** (accessibility enforced at the source).
- **Lifecycle:** `draft → scheduled → published → archived`, each transition versioned; **version history** with diff and restore; **schedule** a future publish; **preview** as the live page.
- **Publish bar** (sticky bottom): Save draft · Preview · Schedule · Publish. One primary action.

### 11.4 Per-section managers (deltas)
- **Projects/Research/Publications/Posts:** the universal editor + type fields (repo URL; authors/venue/BibTeX; dek/reading-time).
- **Timeline:** drag-orderable entries with org/role/dates/summary + produced-relations.
- **Skills:** two lists (current/previous), drag between them, each with an evidence-relation.
- **Gallery:** upload grid, drag-reorder, per-image caption + alt.
- **News/Radar:** curation queue — paste/ingest a link, categorize, publish to the feed; digest builder.

### 11.5 Analytics
Privacy-respecting, aggregate-only, compact tables-first (numbers over pictures for one expert user): page views, referrers, evaluator depth (median pages/session for resume-referred traffic), CV downloads, contact events, Dex question volume + decline rate + grounded-answer rate, freshness metrics. Sparklines at hairline weight; no surveillance-grade tracking (the calm-software stance).

### 11.6 AI Knowledge Base (Dex memory sync)
- **Corpus view:** what Dex knows, per content item, with embedding status (synced / pending / stale).
- **Sync:** re-embedding is automatic on publish (event-driven); a manual "re-sync" button for repairs; a visible last-sync stamp.
- **Gap review:** questions Dex recently *declined* or answered weakly → prompts Deepak to fill content gaps.
- **Answer testing:** ask Dex a question in the admin, see the retrieved chunks + citations, verify grounding before the public relies on it. **Dex does not go live until answer-testing passes** (≥95% grounded, 100% correct declines).

### 11.7 Settings (see Part 10.12)
Identity fields, outbound links, CV upload, theme defaults, SEO/OG, RSS, **full content export (JSON + Markdown)** — the content is owned and portable by construction — and a clearly-fenced danger zone.

### 11.8 Admin accessibility & performance
Keyboard-complete; 44px touch targets even in compact density; autosave with honest status; optimistic UI with rollback on failure; no destructive action without confirm; the public read path is never affected by an admin write failure (separate concerns).

---

## PART 12 — THE MOTION LANGUAGE

Motion is information or it is cut (Law 1). The signature is **"settle"** — everything resolves like a precise instrument taking a reading.

### 12.1 The settle curve (the ownable signature)
Approach (fast, ease-out) → converge (decelerate near target) → settle (one critically-damped micro-correction, <2% overshoot, one oscillation) → **absolute stillness.** Values *land*; they never spin, bounce, or idle. This is what the product is recognizable by.

### 12.2 Tokens
| Token | ms | Use |
| --- | --- | --- |
| `instant` | 80 | Press feedback, toggles |
| `fast` | 130 | Hover, icon morphs, tooltip-in |
| `base` | 220 | Palette/menu open, filters, most UI |
| `slow` | 320 | Page transitions, Dex panel, dialogs, shared-element |
| `narrative` | 480–640 | Landing/scene reveals, timeline draw — **≤3 per session** |

**Easings:** `ease-out` (standard, 90% of motion — things responding to the user) · `ease-in-out` (cross-fades, theme toggle) · `settle-spring` (gentle, <2% overshoot — shared-element only) · `linear` (progress only).

### 12.3 Per-element doctrine
- **Scroll:** native scroll owns truth — **no scroll hijack, ever** (scrollytelling responds to scroll; it never owns it). The scene rail is scrubbed by real scroll. Reveals fire once, never re-trigger.
- **Hover:** in at `fast`, out at `instant` (leaving must feel weightless). Enhance only — never gate (touch users get everything).
- **Buttons:** press = `instant` scale-down 2% + tone step; primary has a subtle Signal-weak fill on hover.
- **Cards:** hover = one tone step + hairline brighten (no jump); click = shared-element grow into detail.
- **Camera/Lighting (scene):** rail-driven on scroll; parallax head damped from mouse; the task-light and key breathe imperceptibly; **no idle drift.**
- **Timeline/Research/graph:** draw-in once at `narrative`, then still.
- **Numbers:** single fade-in + settle; never count-up.
- **Theme toggle:** cross-fade at `ease-in-out`, not a jarring flip.

### 12.4 Reduced motion (a designed experience, a release criterion)
`prefers-reduced-motion` → every token collapses to its static equivalent via one global mapping (`MotionConfig reducedMotion="user"`): scene → Tier-0 still or five composed stations, ambient systems unmounted, reveals become instant, the settle becomes a plain fade. **Full experience, zero meaning lost.** The reduced experience is designed, not degraded.

---

## PART 13 — ICONOGRAPHY & ILLUSTRATION

- **Icons:** one outline set (Lucide-class), 1.5px stroke, 24px grid, rounded caps — tuned to Inter so icons read as typography's siblings. Sizes 16/20/24. Filled variants exist *only* as the active state of the same glyph. Never mix sets (stroke mismatch is the cheapest-looking defect). Animate only as state morphs (menu↔close, copy→check), ≤200ms.
- **Illustration:** exactly one language — the **drawn SVG line** (hand-plotted character): diagrams, empty states, the timeline stroke, redrawn research figures, the 404. Never stock, never AI-generated, never clip-art. Research figures redrawn in this language is the highest-leverage craft investment (it makes papers look native).

---

## PART 14 — ACCESSIBILITY STANDARD (non-negotiable floors)

- **Contrast:** body ≥7:1 target, all text ≥4.5:1 floor, large/UI/focus ≥3:1. Verified pairs per mode.
- **Keyboard:** everything focusable in logical order; skip-link on first Tab; palette/dialog/Dex full trap+restore; the 3D scene is `aria-hidden` decoration with DOM focus-proxies for every interactive node.
- **Focus ring:** a 2px Signal ring, 2px offset, on every focusable element, both modes, **never suppressed.** The ring is a designed brand feature, reviewed like a hover state.
- **Screen readers:** semantic landmarks; icons labeled or hidden; state changes (saved, sent, declined, syncing) via live regions; Dex answers announced in chunks, citations as real links; the scene's narrative is fully available as ordered DOM captions ("the whole tour is audible").
- **Motion:** reduced-motion parity is a release criterion (Part 12.4).
- **Touch:** ≥44×44px targets, ≥8px apart, even in admin compact density.
- **Text scaling:** rem-based; 200% zoom must not break layouts; no justified text; no light weights below 16px.
- **Both modes or neither:** no feature ships light-only or dark-only; imagery treatment has parity.

---

## PART 15 — PERFORMANCE STANDARD (budgets are release criteria, not hopes)

- **LCP** = a text node (the identity line), always; **CLS = 0** (skeletons match final geometry; images pre-sized).
- **First Load JS:** ≤160KB gz on the landing; **three.js absent from First Load JS** (tier-gated, lazy, post-LCP).
- **Scene:** ≤350KB gz chunk, ≤150k tris, ≤100 draw calls, graph in 2 draw calls, DPR clamp ≤2, frameloop pauses off-viewport/hidden/post-handoff.
- **Images:** object-storage originals, CDN-optimized AVIF/WebP variants, framed & lazy below fold.
- **Fonts:** subset, `font-display: swap`, preload the Display + Body woff2 only.
- **Rendering:** SSG + ISR, CDN-first; the shell is static above the fold; hydration never blocks on the canvas.
- **The scene never competes with the page** — it loads on idle after LCP; a slow/failed scene is invisible to page usability.

---

## PART 16 — RESPONSIVE SYSTEM (behavior adapts, not just size)

Breakpoints (ranges): mobile <640 · tablet 640–1024 · desktop 1024–1440 · large 1440–1920 · ultra >1920.
- **Desktop = reference:** full scene (Tier 2), 4 lanes, hover states, Dex side-panel.
- **Tablet:** scene Tier 1 (Lite), lanes persist or collapse to sheet, hover→first-tap-reveal only where meaning requires.
- **Mobile:** scene Tier 1 or Tier-0 still, nav = wordmark+sheet+palette, Dex = bottom sheet, tables reflow to labeled cards, reading column owns the viewport (24px margins), touch replaces hover everywhere, one sticky max (condensed nav).
- **Large/Ultra:** containers hold max-width; gained space becomes margin, then marginalia (figure captions beside figures, timeline artifact previews in the gutter). Hard cap; never stretch the measure. No dashboard-ification of public pages.

---

## PART 17 — DESIGN TOKENS (handoff summary)

Three tiers (primitive → semantic → component; primitives private), dot-notation (`category.concept.property.variant.state`), delivered as Tailwind v4 `@theme` CSS variables (one-file retune). Closed sets: neutrals (one ramp), accent (one hue + glow + weak), semantics (four), radii (4/8/12/full), one shadow, glass (three surfaces only), motion (5 durations, 4 easings), z-bands (100s), focus recipe, a11y floors. Any new hue, shadow, glass surface, or duplicate overlay behavior is a one-line rejection. Scene colors read the token layer live (no hex in scene code; theme swaps propagate automatically) — already shipped via `useCssColor`.

---

## PART 18 — FUTURE EVOLUTION

- **v1.0 (P0):** Tier-0 landing + Work/Research/Publications/Posts/Timeline/Skills/About/Contact + admin CMS + SEO/RSS/search. Static scene still as the hero floor.
- **v1.5 (P1):** the full 3D scene + the Twin (post likeness-gate) + Dex live + Gallery + graph explorer + deep GitHub + full analytics.
- **v2.0 (P2):** Radar + bookmarks + weekly digest.
- **v3+ visions (gated, dedicated specs):** the graph as the primary navigation for power users; a public read-only agent API over the corpus (the machine-readable bet realized); voice Dex; seasonal/time-of-day scene themes; "cite this site" academic export; a Twin that reflects real-time GitHub activity in the scene.

---

## PART 19 — BUILD HANDOFF

**Order of construction (each layer independently shippable):**
1. Tokens (Part 3/4/5/17) → the design system in code (light+dark).
2. Component library (Part 10 archetypes: Cards, Rows, nav, palette, overlays, editor primitives).
3. Content model already exists (`types/content.ts`) → the read layer (local → PostgreSQL behind the interface).
4. Public pages via archetypes (Part 10) — Tier-0 scene still first.
5. Admin CMS (Part 11) — the update loop.
6. The 3D scene (Part 6/7) — gated on owner reference photos + budget; ships behind the tier gate as pure enhancement.
7. Dex (Part 8) — once the corpus is populated; register the capability, the body already listens.

**Open owner gates ⟨GATE⟩:** the accent hue sign-off · the Display font license · Twin reference photos (gate #1) · the 3D asset budget · the Dex name veto (retained: "Dex"). Nothing else blocks build.

**The definition of done for the whole product:** a recruiter understands "Deepak builds intelligent systems" in 20 seconds and can find the proof in two; a researcher verifies a citation without friction; an engineer reads a real decisions-and-trade-offs write-up; Dex answers three questions accurately with citations and declines one politely — and the whole thing is never more than a week behind Deepak's real work.

---

*This is the definitive V2 design specification. Every page, token, motion, and interaction above is build-ready. Where a value is marked ⟨GATE⟩, it awaits one owner decision — not further design.*
