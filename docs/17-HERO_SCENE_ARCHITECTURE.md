# 17 — Hero Scene Architecture (Master Specification)

> **Status:** Approved draft — v1.0 of the hero scene.
> **Owner:** Deepak (Experience) · Authored as Executive Creative Director / Scene Architect, **on the owner's superseding directive (D-030)**.
> **Supersedes (in hero scope only):** D-020's likeness ban, D-026's typographic-hero ratification, D-027's concurrence, D-016's 3D-as-decoration default. **Everything else stands** — see §0.
> **This is a design document.** No engine, library, or code is chosen here; implementation is a later ratification.

---

## 0. Governance — what changes, what survives

| Standing law | Disposition |
| --- | --- |
| D-020 likeness ban | **Superseded for the hero scene**: a *stylized* 3D representation is sanctioned. The ban on **photoreal likenesses and AI-generated/retouched imagery remains** — stylization is the uncanny-valley firewall (§3.2). Photography rules (DSVL §10) unchanged. |
| D-026 typographic hero | **Superseded as the primary tier** — and **retained verbatim as Tier 0 fallback** (§10). Nothing built in Sprint 1 is discarded. |
| D-027 review verdicts | Superseded where they defend the old hero; its *discipline* (budgets, kill criteria, staleness rules) is carried into this spec. |
| D-016 motion doctrine | Amended: 3D is now the hero's core medium, not decoration. **Everywhere below the hero, D-016 stands in full.** |
| 10-second comprehension (PRD G2) | **Survives, non-negotiable**: identity text is DOM-rendered and legible at scroll-position zero in every tier (§7). |
| Claims-in-S1-only, S2+ evidence sections | Survive — the scene is Act I; the page below is unchanged. |
| Accessibility parity (XA §11) | Survives, elevated: the scene is *decorative to assistive tech*; the full narrative lives in DOM (§11). |
| Dex identity (D-015/D-019) | Survives: Dex speaks as itself, cites everything, has no face. In the scene Dex gains a *body in space* — still the dot, now luminous and positioned (§3.4). |

**Vocabulary (Brand §12 amendment):** **the Twin** = the stylized 3D representation of Deepak (an inhabitant who *works*). **Dex** = the AI entity (unchanged). They are never conflated: the Twin is a portrait; Dex is a presence.

## 1. Experience Concept

**You do not land on a page. You arrive at the Lab.**

A quiet, dimensional workspace suspended in soft graphite atmosphere: the knowledge graph floats as a constellation of work; the Twin is at the workbench, mid-task; a small luminous dot moves through the space with evident intent. Text — who this is, what he builds — is present from the first frame, printed on the glass between you and the room.

Five feelings, in order (the brief's arc): **Arrival** (a place, not a page) → **Discovery** (the constellation is his actual work) → **Curiosity** (what is that moving light?) → **Recognition** (this whole space is one connected record) → **Invitation** (enter — or ask).

**The three laws of the scene:**
1. **Readability is layered above the world.** All text is DOM overlay — the scene never renders body text. Identity is legible at frame one, over any scene state.
2. **The scene is honest.** Graph nodes are *real content* (data-driven from the same ContentService); node counts are true counts. An empty lab renders sparse — the scene inherits the no-fake-data law.
3. **Calm survives the third dimension.** Vision-Pro-grade spatial quality, monastery pacing: nothing lunges, spins, or performs. The DSVL translated to space — graphite materials, hairline edges, one accent as light.

## 2. Scene Hierarchy (scene graph)

```
SceneRoot
├── Environment
│   ├── AtmosphereVolume        · graphite fog, depth cueing (paper→ink by mode)
│   ├── GroundHint              · implied plane (soft contact shadow only)
│   └── LightingRig             · §5
├── KnowledgeGraph              · data-driven (real content, IA §2 relations)
│   ├── Cluster:Projects        · node group + intra-edges
│   ├── Cluster:Research        ├─ Publications orbit Research
│   ├── Cluster:Publications    │
│   ├── Cluster:GitHub          · activity ring, cache-fed (D-010)
│   ├── Cluster:Skills          · current skills sit nearest the Twin
│   ├── Cluster:Experience      · a strand, not a cloud (time reads linearly)
│   └── EdgeSet                 · typed relation edges (§3.3)
├── TheTwin                     · stylized figure + Workbench (§3.2)
│   ├── Figure (rigged, 3 pose states)
│   └── Workbench (desk, active artifact = latest real project node docked)
├── DexEntity                   · luminous dot, path + state machine (§3.4)
├── CameraRig
│   ├── DollyRail               · scroll-scrubbed path (§4)
│   └── ParallaxHead            · pointer-driven micro-offset (§4)
├── ScreenSpaceAnchors          · project 3D positions → DOM label/focus proxies
└── DOMOverlay (outside canvas) · identity text, CTAs, captions, focus ring
```

## 3. Object Hierarchy & Materials

### 3.1 Graph nodes & edges
- **Node anatomy:** core (matte graphite sphere, size = content-type token: publications small/precise, projects larger), **halo** (accent emissive, off by default; on = hover/focus/camera-proximity), **anchor** (screen-space label + focus proxy).
- **Edges:** hairline tubes; typed per IA §2 — `implements` solid, `writes-about` slow-pulse on hover only, `references` dashed. Edge brightness = graph depth cue, never data-free decoration.
- **Layout:** asymmetric, hand-tuned seed + gentle force settle **that stops** (R2's anti-particle-field guardrail survives in 3D: no perpetual swarm; the constellation is *still* until addressed).

### 3.2 The Twin (the portrait, re-scoped)
- **Purpose:** not identity (text carries that) — the Twin's job is *aliveness and honesty*: someone works here, presently. It is the "currently working on" data made bodily.
- **Style mandate (the uncanny firewall):** stylized-sculptural — think drawn-line language grown a dimension: simplified planar features, matte graphite skin, no skin shader, no photoreal hair/eyes, **no facial animation beyond micro head attitude**. If a viewer asks "is that supposed to look like him?", the style is too literal. Hallway-test kill criterion carries over (D-027 discipline): reads-as-uncanny ⇒ regress to silhouette-at-workbench.
- **Placement & weight:** mid-ground right, seated at the workbench, ~15% of frame at arrival — an inhabitant, not a monument. The graph gets the space; the Twin gets the credibility.
- **Pose states:** `working` (default: leaning to the bench, subtle task motion) · `acknowledging` (camera dwell >3s nearby: brief glance toward viewer, then back to work — once per session) · `resting` (reduced tiers: still silhouette).
- **Idle:** breath cycle ~4s, chest/shoulders only. **Hover:** none on the figure itself (people aren't buttons); the *workbench artifact* is hoverable → opens the latest real project. **Scroll:** the Twin never tracks the camera; the camera visits *it*.

### 3.3 Materials (DSVL rendered dimensional)
Matte graphite ramp for all solids · hairline emissive edges · **one emissive hue** (the accent) shared by Dex, halos, and key light warmth — the one-accent law survives as *one light color* · paper/ink atmosphere per theme mode · no PBR jewelry: no chrome, no glass materials in-scene (D-020's glass rules are DOM-only).

### 3.4 Dex in space
The dot embodied: a small accent-emissive sphere with soft light falloff. **States:** `resting` (drifting slow orbit near the graph, breath-pulse 2.4s — the one loop, preserved) · `curious` (camera enters graph: Dex relocates to hover near whatever cluster the camera studies — context awareness made spatial) · `introducing` (Act IV, §7) · `active` (panel open: Dex docks screen-edge; scene dims one step). Dex **never blocks the camera path** and never emits sound. Its light is the only thing in the scene that casts onto neighbors — presence as illumination.

## 4. Camera System

- **Rig:** dolly on a fixed rail (authored spline), scroll-scrubbed — **scroll position = rail position, bidirectional, no easing lag beyond 150ms damping.** The visitor drives; the scene never auto-plays. This is the no-scroll-hijack law expressed in 3D: reversing scroll reverses everything, exactly.
- **Lens:** ~35mm-equivalent, fixed FOV (no focal breathing), **zero roll ever** (vestibular safety), pitch limited ±12°.
- **Parallax head:** pointer offset ≤2° rotation, heavily damped, desktop-only; touch = off; gyro = off (opt-in never; it's battery + vestibular cost for garnish).
- **Reduced motion:** the rail becomes **5 fixed keyframe stations** — scroll steps between them with instant cuts + DOM crossfade captions. No glide exists in RM. (Parity, not degradation: the five stations are composed stills, art-directed as such.)

## 5. Lighting System

- **Key:** one soft area light, upper-left, slightly warm — the lab's window. (The old D-020 3D charter's "single soft key + ambient fill" was written for exactly this day; it survives intact.)
- **Fill:** ambient from the atmosphere volume; ratio keeps forms readable, never dramatic. **No rim lighting** (the honesty ethic's lighting clause carries over from photography).
- **Emissives:** Dex + node halos + workbench task light (small, warm pool where the Twin works — the scene's storytelling light: *work happens here*).
- **Variation:** a ≥60s imperceptible drift in key intensity/temperature (the room is alive) — disabled in RM and Lite tiers.
- **Theme modes:** light = paper atmosphere, ink solids, gentle key; dark = ink atmosphere, graphite solids brightened one step, Dex reads brighter. Both first-class (DSVL law).

## 6. Interaction System

| Input | Model |
| --- | --- |
| **Hover** (pointer) | Node: halo on + DOM label in ≤120ms; cluster siblings brighten 1 step (relation legibility). Edges: named on hover ("implements →"). Twin: workbench artifact only. Costs nothing to leave (out at `instant`). |
| **Click/tap commit** | Node → navigates to that content's real route (the graph **is** navigation — scene as IA skin). Dex → panel opens (same DexPanel contract). Workbench → latest project. |
| **Keyboard** | Every interactive object has a **DOM focus proxy** (screen-space anchored); Tab order = information priority (identity → CTAs → Dex → clusters by priority → workbench). Focus = halo + system focus ring on the proxy; Enter commits; camera *gently frames* the focused object in ≤300ms (focus drives camera — keyboard users get the tour for free). Esc returns focus to overlay. |
| **Touch** | First tap = hover-reveal (label), second = commit (no hover-gating, Law 20). Targets ≥44px screen-space — node halos scale to guarantee it. Scroll = rail, exactly as desktop; no touch-orbit. |
| **Reduced motion** | Stations model (§4); ambient §8 all off; interactions become instant state swaps; everything remains reachable. |
| **Idle** | The scene never solicits. No "look at me" pulses; Dex's drift is the only unprompted motion beyond ambient. |

## 7. Scroll Timeline (the five acts)

Scene occupies the first ~180–220vh of scroll; then hands off to the DOM page (S2+ evidence sections, unchanged).

| Act | Rail % | Camera | What happens | Visitor feels |
| --- | --- | --- | --- | --- |
| **I — Arrival** | 0–10 | Wide establishing; whole lab in soft depth | **Identity text + CTAs already legible (DOM, frame one)**; scene settles from atmosphere (≤2s, once/session) | *A place.* Who/what answered before any motion finishes |
| **II — The Constellation** | 10–40 | Dolly forward + drift through the graph's edge | Clusters label as approached; true counts surface ("14 publications" as a caption); edges light along the path | *This is his actual work, connected* |
| **III — The Workbench** | 40–60 | Curve toward the Twin; task light grows | "Currently working on ⟨real skill/project⟩" caption (R5 staleness rule applies); the acknowledging glance if dwelt upon | *Someone is here, now* — freshness made spatial |
| **IV — The Light** | 60–80 | Camera pauses; **Dex approaches the lens** | Dex's one scripted moment: drifts near, DOM caption introduces it in its own voice ("I'm Dex — I know everything in this room. Ask me anything about Deepak's work."), 2 suggestion chips | *Curiosity resolved into invitation* — discovery, not interruption (v1.5; pre-Dex, Act IV is a slow pass over the graph's whole and the caption names the graph instead) |
| **V — Handoff** | 80–100 | Rise + pull back; scene recedes, defocuses, settles as a fixed dimmed backdrop | DOM page (S2 Featured Work…) slides up over it; the scene's graph *visually becomes* the page's content — same items, now as cards | *The room becomes the record* — narrative continuity is literal |

**Continuity rules:** visual — the accent hue and graphite palette are identical across canvas and DOM; motion — the handoff's page entrance uses the same `entrance` recipe as everything below; narrative — Act II's counted claims are the same numbers S3's stat strip shows. Nothing said in the scene is unsaid on the page (DOM carries all content — SEO/AT/no-JS read a complete page that simply lacks a ceiling).

## 8. Animation Timeline (ambient + event)

| Layer | Spec | Cap |
| --- | --- | --- |
| Twin breath | ~4s cycle, torso only | always (except RM/Tier 0) |
| Dex breath | 2.4s (the preserved loop) | always |
| Node drift | ≤0.5% of scene scale, ≥8s periods, settles when camera is near (stillness = attention) | Full tier only |
| Lighting drift | ≥60s period | Full tier only |
| **Particles** | Sparse dust motes in the key-light shaft **only** (≤40 instances, near-imperceptible) — atmosphere, not spectacle. Anywhere else = the particle-cliché the R2 guardrail exists to kill | Full tier only |
| Event: halo on/off | 120ms / 80ms | all 3D tiers |
| Event: camera-frame-focused | ≤300ms ease-out | all 3D tiers |
| Event: Dex approach (Act IV) | 1.2s, once per session | scripted |
| Acknowledging glance | 0.8s, once per session | Full tier |

Budget law: **ambient layers may never exceed three simultaneously visible motions** in any frame composition — the one-focal-motion law, renormalized for a world.

## 9. Performance Budgets (release criteria, not aspirations)

| Budget | Full (Tier 2) | Lite (Tier 1) |
| --- | --- | --- |
| Added JS (engine + scene, gz) | ≤ 350 KB, **lazy after LCP** | ≤ 250 KB |
| Geometry | ≤ 150k tris total; Twin ≤ 60k | ≤ 60k; Twin = silhouette LOD ≤ 15k |
| Draw calls | ≤ 100 (nodes instanced) | ≤ 50 |
| Textures | ≤ 8 MB (KTX2) | ≤ 3 MB |
| Frame rate | 60fps target / 45 floor | 30 floor |
| LCP | **Unchanged from Tier 0** — identity text is DOM, scene loads after | same |
| CLS | 0 (canvas reserves its box) | 0 |
| Thermal/battery | rendering pauses off-viewport + `battery-saver`/hidden-tab; resumes on return | same |

**Tier gating (client heuristic at load):** RM preference ⇒ stations model on whatever tier; low `deviceMemory`/GPU-probe fail/save-data ⇒ Tier 0; mobile mid ⇒ Tier 1; capable ⇒ Tier 2. Gate decides **before** engine download — Tier 0 visitors never pay a byte of 3D.

## 10. Fallback Strategy — the tier ladder

| Tier | Experience | Status |
| --- | --- | --- |
| **2 — Full scene** | Everything above | This spec |
| **1 — Lite scene** | Same rail + acts; no particles/lighting-drift/node-drift; silhouette Twin; reduced parallax off | This spec |
| **0 — 2D interactive hero** | **The shipped Sprint 1 hero, verbatim** (typographic + drawn graph motif, D-026/D-029) — already built, tested, reviewed | In production |
| **RM (any tier)** | Five composed stations (3D) or pre-drawn motif (Tier 0) | Parity, designed |

Tier 0 is not an apology — it is the previously-ratified hero that scored 84/100. This architecture's cheapest property: **its fallback already exists and already shipped.** The DOM overlay (identity, CTAs, captions-as-content) is byte-identical across tiers.

## 11. Accessibility Notes

- Canvas is `aria-hidden` decoration; the **DOM overlay + page carry the complete narrative** — a screen-reader visit reads: identity → CTAs → (v1.5: Dex introduction + chips) → S2+ sections. Nothing exists only in 3D.
- Focus proxies (§6) give full keyboard traversal *with* the guided-camera benefit; focus ring always visible on proxies; no traps; Esc exits to overlay.
- Captions (Acts II–IV) are real DOM text, not baked into frames.
- Vestibular safety: no roll, pitch-capped, damped, user-scrubbed only; RM = cuts, never glides.
- Touch: 44px screen-space floors; two-tap commit; no gesture invention.
- Slow networks: Tier 0 renders complete immediately; the scene upgrades in place if/when assets arrive (never a loading wall — the arrival experience on 3G *is* Tier 0, by design).

## 12. Asset Pipeline

1. **Concept** — Twin style frames + graph art direction (2D, in the drawn-line language) → **owner sign-off gate #1** (likeness comfort + uncanny check on *drawings* first — cheapest kill point).
2. **Blockout** — untextured scene proportions, camera rail prototyped with placeholder primitives → sign-off gate #2 (the acts work before any sculpting money is spent).
3. **Production** — Twin sculpt → retopo → light rig (3 poses, breath, glance) · nodes/bench modeled + instanced · glTF + Draco, KTX2 textures, LOD chain per tier.
4. **Integration** — data binding (graph = ContentService output), DOM anchors, tier gates.
5. **Review gates** — hallway test (uncanny + particle-cliché checks, five fresh eyes), budget audit (§9 as pass/fail), accessibility walkthrough (§11), then release.
6. **Versioning** — scene assets are versioned artifacts in object storage/CDN (D-013); the Twin's look may be revised at major versions like the portrait photograph (Brand §8's yearly-renewal logic applies to the sculpt).

## 13. Self-Critique (required evaluation)

**Strengths:** the scene *is* the product thesis (the graph as inhabitable IA); fallback ladder de-risks everything (the old hero remains whole); honesty laws survive translation (real data, true counts, staleness rules, no-hijack scrubbing); Dex's discovery beat gains real theatrical power.
**Weaknesses:** the Twin is the single highest-risk asset (style is everything; budget gate #1 exists for this); Act length (~200vh) taxes the evaluator — mitigated by identity-at-0% + CTAs always clickable (the shortcut never requires the tour); authoring cost is an order of magnitude above anything else in the product.
**Risks:** *maintenance organism* (XA §12's bespoke-moment risk at maximum — one person must own a 3D pipeline for years); *uncanny drift* (style mandate + gates); *performance regressions* (budgets as release criteria, tier-down as the permanent escape hatch); *scope gravity* (a scene invites infinite polish — the act structure is the scope fence).
**Simplifications already taken:** no orbit controls, no gyro, no audio, no physics, no photoreal anything, no 3D text, particles confined to one light shaft, Twin's face nearly abstract.
**Future evolution:** the scene as persistent site-wide backdrop (the page always floating in the lab); Act IV variants by referrer context; the knowledge map (XA §13) growing into a fully explorable mode of this same scene; seasonal lighting as the freshness signal made atmospheric.

---

## Appendix — Downstream obligations

| Owes | What |
| --- | --- |
| `docs/06` (future session) | Engine/library ratification (R3F-class vs vanilla WebGL-class), asset tooling |
| `specs/landing.md` | Amendment: §2.1 hero superseded by this doc; S2–S8 unchanged; Tier 0 = current implementation |
| Sprint plan | Concept + blockout gates before any production asset spend |
| Budget | This is the product's first feature with real asset production cost — owner should size it before gate #1 |
