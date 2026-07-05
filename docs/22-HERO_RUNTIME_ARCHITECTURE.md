# 22 — Hero Scene: Runtime Architecture

> **Status:** Approved draft — the engineering architecture of the scene. **No implementation** — structure, contracts, and data flow only.
> **Authored as:** Lead Frontend Architect (3D runtime).
> **Bound by:** `17` (tiers/budgets) · `18` (bible) · `21` (assets) · the shipped `apps/web` foundation (D-028/D-029).
> **Engine ratification (D-036):** **React Three Fiber** (three.js + R3F + a minimal drei subset). Rationale: the scene graph *is* a component tree (17 §2 maps 1:1); Suspense-native asset streaming matches the "lab furnishes itself" loading order; it composes with the existing React 19 / Next App Router / Zustand stack instead of bridging to an imperative island. Cost honesty: three+R3F+drei-subset ≈ 220–280 KB gz — inside the ≤350 KB tier budget, **lazy-loaded after LCP, only for Tier 1/2 visitors**.

---

## 1. The load-bearing principle: the scene is an enhancement layer

```
┌──────────────────────────────────────────────┐
│ DOM (always, every tier, server-rendered)     │
│  Tier-0 hero content · identity · CTAs ·      │
│  captions · focus proxies · S2+ sections      │
├──────────────────────────────────────────────┤
│ <Canvas> (Tier 1/2 only, lazy, behind DOM)    │
│  the 3D scene — pure enhancement              │
└──────────────────────────────────────────────┘
```

The page is **complete before the canvas exists** and remains complete if the canvas dies. Every architectural choice below is downstream of this: error handling collapses to "unmount the canvas" (§14); accessibility collapses to "the canvas is decoration" (§12); LCP is untouched by definition. The tier ladder is not a fallback strategy bolted on — it *is* the architecture.

## 2. Module structure & the tier gate

```
features/hero-scene/
├── gate.ts              · tier decision — runs BEFORE any 3D import
├── scene/               · the lazy chunk (only chunk containing three.js)
│   ├── HeroCanvas       · Canvas + providers + boundaries
│   ├── objects/         · Atmosphere · LightRig · Graph · Twin · Dex
│   ├── camera/          · rail sampler + parallax head
│   ├── systems/         · scrollBridge · pointerBridge · perfGovernor
│   └── assets/          · loader config, LOD manifest, decoder setup
├── overlay/             · DOM: captions, chips, focus proxies (NOT lazy)
└── shared/              · scroll/pointer refs, types, tier context
```

**`gate.ts` decides before a byte of 3D downloads** (17 §9): `prefers-reduced-motion` → stations flag (any tier) · `save-data` / low `deviceMemory` / failed cheap WebGL2 probe → **Tier 0, no import** · mobile-capable → Tier 1 · else Tier 2. The scene chunk is `dynamic import`-ed on idle after LCP; the gate result also parameterizes feature flags (particles, drifts, parallax) per the bible's shedding order.

## 3. Component tree (R3F)

```
<HeroSceneRegion>                          (DOM section, ~200vh rail)
├── <Tier0Hero/>                           (always rendered — the D-026 hero)
├── <SceneOverlay/>                        (DOM: captions · chips · FocusProxies)
└── {tier >= 1 && (
    <SceneErrorBoundary fallback={null}>   (§14 — canvas dies silently)
      <HeroCanvas>                         (frameloop per §9 · DPR clamp)
        <Atmosphere/>                      (procedural — no Suspense)
        <LightRig/>                        (procedural)
        <KnowledgeGraph>                   (data via props from server)
          <InstancedNodes/>                (one InstancedMesh)
          <EdgeField/>                     (one merged/instanced geometry)
        </KnowledgeGraph>
        <AssetBoundary fallback={<TwinSilhouette/>}>
          <Suspense fallback={<TwinSilhouette/>}>
            <Twin/>                        (progressive LOD swap §11)
            <BenchSet/>
          </Suspense>
        </AssetBoundary>
        <DexEntity/>                       (shader sphere — procedural)
        <CameraRig/>                       (rail sampler + parallax head)
        <PerfGovernor/>                    (§9 — headless system component)
      </HeroCanvas>
    </SceneErrorBoundary>
)}
```

Rules: procedural objects (atmosphere, lights, graph, Dex) mount instantly outside Suspense — the lab exists before its heaviest resident arrives; **nothing in the DOM ever waits on the canvas**; the component tree mirrors 17 §2's scene graph node-for-node so the bible remains the source of truth for structure.

## 4. State management — three domains, three mechanisms

| Domain | Mechanism | Why |
| --- | --- | --- |
| **Continuous** (scroll %, pointer, camera position, breath phases) | **Mutable refs read in `useFrame`** — never React state | 60fps values through setState is the classic R3F failure; zero re-renders per frame is a law |
| **Discrete interaction** (hovered/focused node id, Dex state, act index) | **Zustand** — extends the existing `ui-store` patterns (own `hero-store` slice) | Shared between canvas and DOM overlay (captions/proxies react to the same store); devtools-inspectable |
| **Content** (graph data, counts, focus line) | **Server props** — resolved at build via ContentService, passed down once | The graph is real data (bible law); it is static per deploy, so it is not "state" at all |

One-way doors: canvas systems may *write* to the discrete store; DOM overlay may *read* it; continuous refs never enter React state (captions that track acts subscribe to act-index changes — discrete — not to scroll % — continuous).

## 5. Scroll synchronization

- **Native scroll owns truth.** No scroll hijack (law): the region is ~200vh of real document; a passive listener + rAF writes `scrollProgress` (0–1) to the shared ref.
- **The rail is data:** `cam_rail.glb`'s baked frames 0–100 (D-035) are sampled at load into a lightweight curve LUT; `CameraRig`'s `useFrame` lerps current rail position toward `scrollProgress` with the ≤150ms damping constant (17 §4). Scrub-back is free — it's the same sampler.
- **Acts are derived, discrete:** thresholds over `scrollProgress` (the 18 §11 table as a constant) produce `actIndex` into the store — captions, Dex's Act-IV trigger, and the handoff all key off act transitions, not raw scroll.
- **Reduced motion:** the sampler snaps to the five station keys (nearest-threshold), no lerp — the stations model falls out of the same architecture with one flag.

## 6. Mouse interaction

- **Parallax:** pointer position → normalized ref (pointerBridge, passive listener) → parallax head reads it in `useFrame`, damped, ±2° cap, multiplied by the tier flag (off on touch/Tier 1/RM). The rail and the head compose: `camera = rail(t) ⊕ head(pointer)` — separated authorities (18 §7).
- **Picking:** R3F's raycasting on the InstancedMesh — `instanceId` → node record lookup → write `hoveredNode` to the store. Pointer-move raycasts are throttled to rAF and disabled while the camera is in fast travel (mid-lerp beyond a velocity threshold) — no hover storms during scrub.
- **Hover response is split by cost:** halo brightening = per-instance attribute write (canvas, cheap); label/caption = DOM overlay reacting to the store (never rendered in-canvas — text law).

## 7. GSAP integration & the motion division of labor

| Concern | Owner | Rationale |
| --- | --- | --- |
| DOM overlay (captions, chips, S2+ page) | **Motion** (existing recipes) | Already the site's DOM motion system (D-029) |
| Camera travel | **The rail sampler** (baked Blender animation) | Authored cinematography; no tween library re-animates it |
| In-canvas one-shot events (node birth line→solid, glance trigger blend, Dex Act-IV approach, citation traces) | **GSAP** (lazy-loaded *inside* the scene chunk) | Imperative tweens on shader uniforms and object props with authored easing — exactly GSAP's strength; this is the "reserved for draw-ins" promise (docs/06) landing |
| Ambient loops (breath, drift, lighting) | **`useFrame` + clock math** | Perpetual phase-offset cycles are cheaper as math than as tweens |

**The hard rule:** one property, one owner — GSAP never touches what the rail or `useFrame` owns, and neither touches the DOM. Crossfades between animation clips (Twin) use the three.js AnimationMixer with the 200ms crossfade constant (D-035 clip contract).

## 8. Instancing & frustum culling

- **Nodes:** one `InstancedMesh` (≤150 instances, bible §6 aggregation beyond); per-instance buffer attributes: `position · radius · luminance · haloIntensity · birthPhase`. All node visual state is attribute writes — zero per-node React components.
- **Edges:** one merged hairline geometry with per-vertex `edgeType/activation` attributes (typed styles + directional light-ups as shader work, not draw calls). Target: graph = **2 draw calls**.
- **Culling:** default frustum culling on; instanced meshes get one hand-set bounding sphere (nodes drift ≤0.5%, so static bounds are safe); the skinned Twin gets an explicit generous bound (skinned auto-bounds are wrong); atmosphere is `frustumCulled = false`. The bigger cull is temporal: **past Act V the whole loop idles** (§9) — the backdrop is a held frame, not a running scene.

## 9. Performance architecture

- **Frameloop policy:** `always` while (region intersecting viewport) ∧ (tab visible) ∧ (act < handoff-idle) — else the loop pauses (IntersectionObserver + visibility listener feeding a headless `PerfGovernor`). RM mode: `demand` — frames render only on station change.
- **DPR clamp:** `min(devicePixelRatio, 2)`, and the governor's first lever is dynamic resolution (drei-PerformanceMonitor-style sampling): fps sag → step DPR down before any feature sheds; then the bible's shedding order (particles → lighting drift → node drift → parallax) as flags the governor flips live.
- **Budget enforcement:** the §17-9 numbers live as constants; dev-mode asserts (draw-call and memory counters) fail loudly in development, log-only in production.
- **The scene never competes with the page:** chunk loads on idle after LCP; decoder WASM (Draco/KTX2) lazy with it; hydration of S2+ sections is never blocked by canvas mount.

## 10. Suspense & lazy loading

Three nested tiers of "not yet," each with a designed appearance:
1. **Chunk** (tier-gated dynamic import) — until then: Tier 0 hero, complete.
2. **Procedural mount** — atmosphere/lights/graph/Dex appear on first canvas frame (near-instant, no Suspense).
3. **Assets** — `<Suspense>` around Twin+bench with `TwinSilhouette` (a ≤1k-tri primitive matching the seated pose) as fallback; `twin_lod2.glb` (≤300KB) replaces it, then LOD1/LOD0 swap in silently (§11). The visible order **is** the bible's "lab drafts itself": world → silhouette → person.

Preload strategy: rail + bench begin fetching with the chunk; Twin LODs fetch serially by size; nothing fetches for Tier 0.

## 11. Asset loading & LOD swap

- Loader config: GLTF + Draco + KTX2 (decoders self-hosted, versioned with the app); asset URLs from the CDN manifest (`hero/{asset}@{version}.glb`, D-013/D-035) — the manifest is data, so asset revisions deploy without code changes.
- **Progressive LOD:** a `TwinLODController` owns the swap — mounts LOD2 on arrival, upgrades when the next GLB resolves *and* the camera is not mid-Study on the Twin (never swap while observed; swap on travel). Distance-based LOD selection thereafter (Acts I–II vs III).
- Disposal on upgrade: the replaced LOD's geometry/textures are explicitly disposed (§15) — memory is a budget, not a hope.

## 12. Reduced motion & accessibility (runtime duties)

- RM flag (from the gate, live-updated on media-query change): stations sampler (§5) · ambient systems **unmounted, not paused** (their memory returns) · `frameloop="demand"` · GSAP events become instant state sets.
- Canvas: `aria-hidden`, non-focusable. **FocusProxies** (DOM overlay): one button per interactive object, positioned from screen-space projections **recomputed at rail rest-points only** (never per frame — proxies are for keyboard users, who travel by focus, not by scroll); focus → writes `focusedNode` → CameraRig frames it via the same rail API (§5); Esc → returns focus to overlay root.
- Captions render in document order inside the overlay regardless of act (visually revealed by act, always present for AT) — the "whole tour audible" guarantee (18 §13) is an overlay property, not a canvas one.

## 13. Dex runtime contract (v1.5 seam)

`DexEntity` renders the body (shader sphere, states from the store); its *mind* (panel, RAG) remains `features/dex/` — the existing graceful-absence boundary. Pre-v1.5: state machine runs `resting`-docked only (bible §5 sleep). The Act-IV trigger, citation-trace events, and panel-docking are store transitions the scene already understands — v1.5 plugs intelligence into a body that shipped earlier. No rework seam.

## 14. Error boundaries — the ladder as error architecture

| Failure | Boundary | Result |
| --- | --- | --- |
| Twin/bench GLB fails (network, parse) | `AssetBoundary` | Silhouette primitive persists — scene stays emotionally complete (bible §4 fallback) |
| WebGL init fails / not supported | gate probe (§2) | Tier 0; chunk never loads |
| **WebGL context loss** (GPU reset, OOM) | context-loss listener → one silent restore attempt → else unmount canvas | The DOM page was always complete underneath — **failure = the ceiling disappears, the room remains** |
| Scene chunk fails to load | dynamic-import catch | Tier 0, silently; log to ops |
| Frame-budget collapse (thermal) | PerfGovernor floor | Shed to Lite; below Lite floor → freeze scene as static backdrop |

No error state is ever *shown* — every failure resolves to a lesser tier that was already a designed experience. Errors are logged (ops §17-arch), never displayed.

## 15. Memory management

- R3F auto-dispose on unmount + **explicit disposal** for everything loaded imperatively: swapped LODs (§11), decoder workers after final asset, GSAP timeline kills on unmount.
- Texture memory ceiling per tier (17 §9: 300/150MB) asserted in dev via renderer info.
- The region unmount (route change) tears down the entire canvas — listeners (scroll/pointer/IO/visibility) are owned by the two bridge systems and die with them; the shared refs are module-scoped but inert without writers.
- HMR-safety in dev (dispose-on-fast-refresh) so iteration doesn't leak — a dev-experience duty that becomes a prod-safety habit.

---

## Appendix — contracts to downstream work

| Consumer | Contract |
| --- | --- |
| Implementation sprint | This tree + the store shape + the two bridges are the skeleton; budgets/constants imported from a single `hero-constants` module |
| `docs/06` | Engine ratified (D-036): three.js + R3F + drei-subset + GSAP-in-scene; Motion stays DOM-only |
| Asset manifest | `hero/{asset}@{version}` scheme; LOD serial-fetch order |
| v1.5 Dex sprint | §13 seam — body/mind boundary, store transitions named |
| Tier 0 | Untouched, forever the floor of the ladder |
