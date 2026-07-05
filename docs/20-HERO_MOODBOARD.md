# 20 — Hero Moodboard Specification: "The Drafted Laboratory"

> **Status:** Approved draft — the look-dev contract for D-033's art direction.
> **Authored as:** Art Director, for the visual designer / 3D artist executing gate #1 and look-dev.
> **Bound by:** `17` (architecture) · `18` (bible) · `19` (art direction, D-033) · DSVL/Tokens (color primitives are provisional — all color references below are **token names**, resolved in `apps/web/src/styles/globals.css`).
> Values here (roughness, Kelvin, mm, opacities) are targets with ±10% artistic latitude; anything outside that range returns to review.

---

## 1. The board in one sentence

**A warm working lab at dusk, whose every object quietly remembers the drawing it came from** — matte ceramic and graphite solids, hairline ink edges, one pool of warm task light, one living accent, and air you could file documents in.

**Reference photography to source for the physical board (16 tiles):**
1. An architect's drafting table at golden hour, tools mid-use
2. Otl Aicher diagram sheets (line discipline)
3. A ceramics studio shelf — matte glazed vessels in raking window light
4. Museum model-shop architectural maquettes (basswood/ivory, unpainted)
5. A dusk-lit workshop with one task lamp burning
6. Graphite sticks + their shavings on paper
7. Vellum sheet over a technical drawing, half-lifted
8. Blackened-steel hand tools, oiled, non-reflective
9. A dark wool overshirt, folded — visible weave, no sheen
10. Fog through a north window (atmosphere depth reference)
11. An indicator LED on lab equipment, in a dark room (the accent's whole personality)
12. Ink line drying on hot-press paper — wet-to-matte transition ("the live line")
13. A constellation chart, hairline engraved style
14. Contact shadow of an object on paper (soft, single-source)
15. A person at a workbench, medium shot, back three-quarter, absorbed
16. The existing Tier-0 graph motif screenshot (continuity anchor — the board must reconcile with it)

## 2. Materials

**The uber-material family** — everything below is one shader with parameter swaps (bible §12), plus the construction-line edge pass (D-033):

| Material | Base | Roughness | Notes |
| --- | --- | --- | --- |
| **Graphite solid** (nodes, bench frame, set) | neutral ramp mid-dark | 0.85–0.95 | The workhorse. Zero metalness. Edge pass at hairline opacity 8–12%, brightening to ~35% under attention. |
| **Warm ceramic** (the Twin — skin/hair mass) | graphite warmed 2 steps toward clay | 0.8 | The warmest solid in scene; **no edge pass ever** (D-033: the human is never a diagram). Reads as fine unglazed porcelain under the key. |
| **Paper/board** (bench top, document props) | canvas token | 0.95 | Micro tooth in normal map (§10); receives the task pool like hot-press stock. |
| **Vellum** (mid-birth nodes only) | canvas at 40–55% opacity | 0.6 | The scene's only translucency. Depth-fogged, never refractive. Lives ≤1.2s per birth, then solidifies. |
| **Ink line** (edge pass, edges, annotations) | ink token (mode-aware) | n/a (emissive-flat) | Hairline weight ≈1px at 1080p equivalent, distance-compensated so lines never thicken visually. |
| **The live line** (accent) | `color.accent` as low emissive | n/a | Emissive intensity capped so it *glows like an LED, never blooms like neon* (§5). |

- **Glass:** **none in scene** (17 §3.3 stands). The DOM overlay's palette/Dex-panel glass (D-020) is the product's only glass and is not part of this board. Vellum is the licensed translucency and must never read as glass (no fresnel edge-brightening, no refraction).
- **Metal:** almost none. Licensed exceptions: drafting tools on the bench and the bench's rail — **blackened oiled steel**, roughness 0.6, metalness ≤0.3, anisotropy off. If a highlight ever reads "chrome," it fails review.
- **Fabric:** the Twin's overshirt — sculpted (no sim), deep graphite **wool**, roughness 0.9, a coarse weave normal at close-LOD only; one accent detail ≤4mm (cuff seam or zipper pull) per bible §4. Fabric must read *worn today*, not tailored for a render.
- **Stone:** the bench top may read as **honed (never polished) stone-composite** — roughness 0.75, subtle warm speckle at micro scale. No marble veining (decorative), no polish (reflection ban). Otherwise stone is unused.

## 3. Lighting (the rig, in artist numbers)

| Light | Spec |
| --- | --- |
| **Key — "the window"** | Large soft area, upper-left, elevation ~40°, azimuth ~30° off camera-left. **4300K neutral-warm** at daytime baseline; time-of-day eases 5000K (morning, higher) → 3600K (evening, lower) per bible §8. Intensity: shapes forms at ~3:1 over fill. |
| **Fill** | Atmosphere ambient only — no fill fixture. Lift blacks to ~12% (light mode) / ~8% (dark mode); shadows always readable, never crushed. |
| **Task pool** | Small warm spot on the bench, **3200K**, tight falloff (inverse-square honest), the brightest surface in frame at roughly **+1 stop over key** on the paper. It is the composition's destination. |
| **Separation hairlight** | Behind-above, **5500K cool**, intensity ≤15% of key — reads as a drawn edge of light on the Twin's shoulder-line, never as rim glow (D-032 cap). |
| **Dex** | Accent-hue point light, radius ~0.5m falloff, the only small light that casts onto neighbors. Breath modulates intensity ±20% on the 2.4s cycle. |
| **Node self-luminance** | Emissive per recency (luminance logic, bible §6): newest ≈ 40% emissive, oldest ≈ 8%. Never lights neighbors (Dex's privilege). |

## 4. Lens & Camera (look-dev settings)

- **Focal:** 35mm-equivalent, fixed (17 §4). Vertical FOV locked; no zooms, no focal breathing.
- **Exposure:** filmic tone curve, gentle shoulder; no auto-exposure adaptation (honesty: the room doesn't re-meter itself).
- **White balance:** fixed per theme mode; the time-of-day drift moves the *light*, not the camera's interpretation.
- **The axonometric ease:** at Study framings, perspective eases ≤2° toward parallel (D-033) over 300ms — the "reading a drawing" whisper. Never full ortho.

## 5. Depth, Bloom, Reflections (the governed trio)

- **Depth:** DoF is *atmospheric first, optical second.* Primary depth = fog density (paper/ink volume swallowing distance). A restrained optical DoF assist at Study/Audience framings only: f/4-equivalent, focus plane on the subject, background softening ≤30% blur radius — enough to feel lens-made, never bokeh-balls (highlights are too dim to ball, by design).
- **Bloom: none.** (Bible §12 law restated for the artist.) The accent's glow is **painted in-shader** — a 2–3px emissive falloff baked into halo materials. If a post-bloom pass appears in look-dev, it fails review; bloom is where the one-accent discipline dies.
- **Reflections: functionally absent.** Roughness floor 0.6 scene-wide; no SSR, no planar reflections, no mirror surfaces. The *only* licensed specular events: (1) the blackened tools' dull sheen under the task pool, (2) a soft broad key response on the Twin's ceramic forehead/cheek planes — form description, not sparkle. Environment reflections: a 1×1-ish blurred irradiance of the atmosphere only.

## 6. Environment & Atmosphere

- **The void has a temperature:** light mode = warm paper fog (canvas token drifting toward faint warm gray with distance); dark mode = ink fog (deep graphite, *never pure black* — DSVL). Fog begins ~2m behind the bench, full swallow by ~15m.
- **No walls, no ceiling, no horizon line.** The ground exists only as contact shadows (soft, single-source, ~20% opacity). The lab is a *place made of attention*, not architecture.
- **Density gradient is the recency axis** (bible §2): measurable — an object at "archive distance" sits at ~60% fog occlusion.
- **Negative space:** the composition's law — **≥55% of any resting frame is atmosphere/empty paper.** The scene must always look like a spread from a beautifully set book: content clustered with intent, silence around it. If a frame feels full, remove until it doesn't (Law 25 in 3D).

## 7. Typography (in and over the scene)

- **All text is DOM** (the unbreakable law) — but the board must art-direct how DOM text *sits over* the scene: identity/display in Inter per tokens, rendered on the overlay with **no scrim, no text-shadow, no plate** — the scene's §6 negative-space law guarantees clean paper behind text zones (composition serves typography, not vice versa).
- **Annotations** (captions, counts, stamps): Small/micro sizes, mono for machine-truth stamps, anchored to screen-space with a **drawn hairline leader line** (SVG, DOM layer) connecting caption to object — the G-direction's dimension-annotation language, executed in the overlay. Leader lines: 1px, 40% opacity, 45°-then-horizontal elbow, ≤120px run.
- **Never:** 3D-extruded text, text baked into textures, text in perspective. A label in perspective is a label you can't read — and a law you broke.

## 8. Photography (of the human, for the board and the likeness gate)

The gate #1 reference set (when the owner supplies photos) should match: natural window light from camera-left (mirroring the key), eye-level, medium shot, working posture, honest color per DSVL §10 — the sculptor works from references lit like the scene. Board tiles 15 (posture) and 3/6 (material warmth) calibrate the Twin's ceramic-warmth translation: **skin reads as material, not as flesh** — the reference photos inform *proportion and silhouette*, never texture.

## 9. Camera framing swatches (the five shots as compositions)

| Shot | Composition spec |
| --- | --- |
| Establishing | Bench + Twin lower-right third; graph constellation upper-left mass; ≥60% atmosphere; identity text zone (upper-left DOM) guaranteed clean paper |
| Drift | Nodes cross frame edges (the world exceeds the frame); no centered subjects mid-travel |
| Study | Subject at right-third crossing, axonometric ease engaged; caption + leader line enters from clean space |
| Audience | Dex lower-third left, slightly foreground-soft; graph behind at fog distance; the frame *listens* |
| Departure | The whole lab, high three-quarter, task pool as the warm heart of a cooling composition |

## 10. Micro-details (the 2% that makes it real)

Licensed set — nothing beyond this list without review:
- **Paper tooth** on bench documents (normal-map only, visible ≤1m).
- **Graphite dust** — a faint scatter on the bench near the tools (static texture, not particles).
- **Tool wear** — edge-lightening on the drafting tools' contact points (things get used).
- **The Twin's sleeve push** — one sleeve slightly higher (asymmetry = life; sculpted, not simulated).
- **Ink-wet transition** — the live line renders 8% brighter for its first 400ms, then settles matte ("drying," tile 12). The accent's most characterful micro-behavior.
- **Node etch** — each graph node carries a barely-visible engraved ring (tile 13's language) readable only at Study distance.
- **Bench edge chamfer** — a 2mm chamfer catching the hairlight; the one place the scene admits it was *made well*.
- **Dust motes** — already governed (17 §8): ≤40, key-shaft only.

**Banned micro-details, explicitly:** fingerprints/smudges (grime ≠ honesty), lens dirt/vignette grime, chromatic aberration, film grain overlays, scratches-for-character. The lab is kept by someone careful.

---

## Acceptance checklist (look-dev passes when…)

- [ ] A grayscale render still reads perfectly (hierarchy survives without color — DSVL Law 3 in 3D)
- [ ] The accent appears in ≤5% of any resting frame's pixels
- [ ] No pixel blooms; no surface mirrors; no glass exists
- [ ] The Twin carries zero construction lines; everything drawn-born can be identified as such at Study distance
- [ ] Text zones sit on clean atmosphere with no plates/scrims
- [ ] ≥55% negative space at every rail rest-point
- [ ] The Tier-0 motif placed beside the Establishing frame reads as *the same world's drawing layer* (tile 16 test)
- [ ] Both theme modes pass all of the above independently
