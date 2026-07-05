# 21 — Hero Scene: Blender Production Pipeline

> **Status:** Approved draft — the production handbook for the Blender artist.
> **Authored as:** Lead Technical Artist.
> **Bound by:** `17` (budgets/tiers) · `18` (bible) · `19` (Drafted Laboratory, D-033) · `20` (moodboard values, D-034).
> **Tooling baseline:** Blender 4.x LTS · glTF 2.0 exporter · Draco · KTX2/Basis (toktx/gltf-transform) · gltf-validator. Engine-side integration is ratified separately (docs/06 queue); nothing here depends on the engine choice.

---

## 0. The boundary — what Blender makes vs what runtime makes

**The .blend is not the scene.** The real scene assembles at runtime from live data. Blender produces only what must be *sculpted or choreographed*:

| Made in Blender | Made at runtime (NOT Blender assets) |
| --- | --- |
| The Twin (LOD chain, rig, clips) | Knowledge graph nodes/edges — **instanced procedural primitives fed by real content data** (bible §6). Never model nodes. |
| Workbench + drafting tools + artifact dock | Dex — a shader sphere + light (18 §5). No asset. |
| Camera rail (the cinematography) | Atmosphere/fog, ground contact shadows, all lights (moodboard §3 is a *runtime* rig) |
| Look-dev stage (review renders only, never exported) | Construction-line edge pass, halos, vellum births — **runtime shaders** (D-033/D-034) |

Consequence for materials: Blender materials are **look-dev proxies** for review renders; runtime re-implements them as the uber-shader. What actually ships from Blender: geometry, UVs, vertex data, rig, clips, and *simple* PBR texture sets the runtime shader consumes.

## 1. Asset List (the complete production slate)

| ID | Asset | Contents | Budget owner |
| --- | --- | --- | --- |
| A1 | `twin` | Figure LOD0–2, rig, 5 clips | §9 |
| A2 | `bench` | Bench, stone-composite top, rail | §9 |
| A3 | `tools` | 3–4 blackened drafting tools (set-dressed) | §9 |
| A4 | `dock` | Artifact dock (the socket that displays the latest project node) | §9 |
| A5 | `cam_rail` | Hero camera path + framings (animation-only export) | §14 |
| A6 | `lookdev.blend` | Moodboard-parity stage — **never exported** | — |

That is the whole slate. If the artist finds themselves modeling anything else, stop and re-read §0.

## 2. File & Collection Structure

One production file per asset + a library file:

```
/blender
├── lib_deepaklabs.blend      · shared: units, look-dev materials, palette
├── twin.blend                · A1
├── bench_set.blend           · A2–A4 (one file, three export units)
├── cam_rail.blend            · A5
└── lookdev.blend             · A6 (links all of the above)
```

**Units & axes:** metric, 1.0 scale (1 BU = 1m); Twin seated height ≈ 1.30m; bench top at 0.74m. glTF exporter handles +Y-up conversion — author in Blender's native Z-up, never hand-rotate for export.

**Collections (per file) — collection = export unit:**

```
twin.blend
├── TWN_EXPORT_LOD0    · final mesh + Armature
├── TWN_EXPORT_LOD1
├── TWN_EXPORT_LOD2    · silhouette
├── TWN_WIP            · sculpts, retopo stages (never exported)
└── TWN_REF            · reference images/likeness boards (never exported)
```
Same pattern: `BNCH_EXPORT / TOOL_EXPORT / DOCK_EXPORT / CAM_EXPORT` + `_WIP` + `_REF`. Exporter setting: "Active Collection" per export unit — nothing outside an `_EXPORT` collection ever ships.

## 3. Mesh Naming Convention

`{ASSET}_{part}_{LODn}` — lowercase parts, e.g.:
`TWN_body_LOD0` · `TWN_hair_LOD0` · `TWN_shirt_LOD0` · `BNCH_top_LOD0` · `BNCH_frame_LOD0` · `TOOL_ruler_LOD0` · `DOCK_socket_LOD0`.
Armature: `TWN_rig`. Actions: `TWN_clip_{name}` (§13). Materials: `M_{asset}_{material}` (`M_twin_ceramic`, `M_bench_stone`). UV maps: `uv0` (always exactly one). **No default names ship** — a `Cube.001` in an export collection fails QC.

Vertex groups mirror bone names exactly (§12). Custom properties: none (runtime metadata lives in code, not in the GLB).

## 4. Modeling Rules

- Quads-dominant for the Twin (deformation), triangulate-on-export everywhere; no n-gons in `_EXPORT`.
- **Apply all transforms** (loc/rot/scale = 0/0/1) before export; modifiers applied except Armature.
- Hard edges via marked sharps + custom normals — **no edge-split modifier residue**.
- Bevel/chamfer real geometry only where the moodboard licenses it (the 2mm bench chamfer, §20-10); everywhere else normals do the work.
- The Twin per bible §4: single sculpted hair mass (its own mesh for material split), sculpted clothing (no cloth sim), **no blendshapes** — breath and glance are bones (§12).
- Watertight-ish silhouettes: LOD2 meshes must shadow/outline cleanly (they are what most mobile users see).

## 5. Scene Graph (as exported, per GLB)

```
twin_lod0.glb
└── TWN_rig (skeleton root)
    ├── TWN_body_LOD0 (skinned)
    ├── TWN_hair_LOD0 (skinned: head bone only)
    └── TWN_shirt_LOD0 (skinned)
bench.glb
└── BNCH_root (empty)
    ├── BNCH_top / BNCH_frame / TOOL_* (static)
    └── DOCK_socket (empty marker — runtime docks the artifact node here)
cam_rail.glb
└── CAM_root
    ├── CAM_rail (animated empty: the dolly, frames 0–100)
    └── CAM_aim  (animated empty: look-target)
```
Empties as runtime markers: `DOCK_socket`, `DEX_perch` (on bench edge — asleep-Dex dock, bible §5), `TWN_focus` (Study-framing target). Markers cost nothing and save the integrator guesswork.

## 6. Materials (look-dev proxies + what actually exports)

Blender Principled setup per moodboard §2, for review renders and to bake/export the maps runtime needs:

| Material | Base color | Rough | Metal | Ships as |
| --- | --- | --- | --- | --- |
| `M_twin_ceramic` | clay-warm graphite (lib palette) | 0.80 | 0 | 2k atlas: color+rough packed, normal |
| `M_twin_hair` | 1 step darker | 0.85 | 0 | shares Twin atlas |
| `M_twin_wool` | deep graphite | 0.90 | 0 | shares Twin atlas (+weave normal region) |
| `M_bench_stone` | honed composite | 0.75 | 0 | 1k atlas (bench+tools+dock shared) |
| `M_bench_frame` | graphite | 0.90 | 0 | shared atlas |
| `M_tools_steel` | blackened | 0.60 | 0.3 | shared atlas |

Rules: **no procedural textures in `_EXPORT` materials** (bake first); no transparency anywhere (vellum is runtime); vertex color layer `col0` on bench/tools carrying the AO bake (saves a texture); the construction-line pass does **not** exist in Blender — do not fake it with wireframe modifiers.

## 7. Lighting & HDRI

Runtime owns all shipped lighting (moodboard §3). In Blender:
- `lookdev.blend` reproduces the rig 1:1 for parity renders: Key = area 2×2m @ 4300K equiv, azimuth 30° camera-left, elev 40°; task spot 3200K +1 stop on the bench; hairlight strip ≤15% key; world = flat graphite at low strength.
- **HDRI:** a neutral gray studio HDRI at ≤0.3 strength may assist look-dev *only*. **No HDRI is exported or shipped** — runtime ambient is procedural. Never light assets to look good under an HDRI the product doesn't have.
- Deliverable from look-dev: two parity renders (light + dark mode) per gate, framed as moodboard §9's Establishing shot, judged against the §20 acceptance checklist.

## 8. LOD Strategy

| Asset | LOD0 | LOD1 | LOD2 |
| --- | --- | --- | --- |
| Twin | ≤60k tris — Act III medium shot | ≤25k — Acts I–II distance | ≤8k silhouette — Lite tier / far |
| Bench+tools+dock | ≤10k | — | ≤3k merged silhouette |
| Method | retopo | decimate-then-repair by hand | re-model silhouette by hand (decimation makes bad silhouettes) |

LODs are separate export collections → **separate GLBs** (streaming order: LOD2 first — "the lab furnishes itself," bible §12). LOD1/2 reuse LOD0's rig (delete unused vertex groups); UVs re-use the same atlas (no per-LOD textures).

## 9. Geometry / Poly Budget (hard, from 17 §9)

| Item | Tris (LOD0) | Notes |
| --- | --- | --- |
| Twin total | **≤60,000** | body ≤42k · hair ≤8k · shirt ≤10k |
| Bench set | ≤10,000 | incl. tools + dock |
| **Blender-authored total** | **≤70,000** | Scene total ≤150k; the remaining ~80k belongs to runtime instanced nodes/edges — not the artist's budget |
| Vertex color layers | 1 (`col0`) | AO bake |
| UV channels | 1 | |
QC script (in-repo later): sums tris per `_EXPORT` collection; over-budget fails the export, not the review.

## 10. Texture Pipeline & Budget

1. Bake in Blender (Cycles): AO → `col0` vertex color (bench set) / atlas (Twin); normal (sculpt → retopo); curvature only as a *masking aid*, never shipped.
2. Export PNG 16-bit masters to `/textures/master/` (kept in object storage, not git).
3. Compress via CLI (gltf-transform/toktx) — **not** inside Blender:

| Map | Size | Format |
| --- | --- | --- |
| Twin color+rough (packed RGB+A) | 2048² | KTX2 ETC1S |
| Twin normal | 2048² | KTX2 UASTC |
| Bench-set color+rough | 1024² | KTX2 ETC1S |
| Bench-set normal | 1024² | KTX2 UASTC |
| **Total shipped** | | **≤8MB (17 §9); expected ≈4–5MB** |

Mip chains on; no texture exceeds 2k, ever (moodboard's matte world doesn't reward it).

## 11. Export Pipeline & GLB Optimization

**Exporter settings (locked):** glTF Separate → then packed by the optimizer · Selected/Active Collection · Apply Modifiers ✓ · +Y Up ✓ · Tangents ✓ (normal-mapped meshes only) · Skinning ✓ (twin) · Animation: sampled, 30fps, "Actions as NLA" per §13 · no lights, no cameras exported (except A5), no Draco *in Blender* (the CLI does it — better control).

**Post-export CLI chain (one script, run per asset):**
`gltf-transform`: prune → dedup → quantize/draco (position 14-bit, normal 10, uv 12) → ktx2 (per §10 table) → validate (gltf-validator, zero errors policy).

**Ship targets:** `twin_lod2.glb` ≤ 300KB · `twin_lod1.glb` ≤ 1.2MB · `twin_lod0.glb` ≤ 3MB (incl. atlas share) · `bench.glb` ≤ 800KB · `cam_rail.glb` ≤ 50KB. All versioned into object storage/CDN (D-013) as `hero/{asset}@{version}.glb`.

## 12. Animation Rig (the ≤24-bone contract, bible §4)

```
TWN_root (1)
└─ hips (1) ─ spine.001, spine.002 (2) ─ chest (1) ─ neck (1) ─ head (1)
   ├─ clavicle.L/R (2) ─ upperarm.L/R (2) ─ forearm.L/R (2) ─ hand.L/R (2)
   │                                        └─ fingers.L/R (2, one grouped bone per hand)
   └─ thigh.L/R (2) ─ shin.L/R (2) ─ foot.L/R (2)
Total: 23 deform bones ✓ (cap 24 — one spare, reserved)
```
- Control rig (IK arms, seated-pose helpers) lives in `_WIP`; **only deform bones export** (exporter: "Deform Bones Only" ✓).
- Max 4 influences/vertex (exporter enforces); clean weights, no negative or micro (<0.01) weights.
- The seated pose is the **rest pose** (the Twin never stands in v1 — don't rig for standing).
- No facial bones. The glance is `neck`+`head` attitude only (D-032: eyes never track).

## 13. Animation Clips

| Action name | Length | Loop | Content |
| --- | --- | --- | --- |
| `TWN_clip_idle_breath` | 4.0s | ✓ seamless | chest/shoulder breath, ≤1.5cm travel |
| `TWN_clip_shift_a` | 2.5s | ✗ | weight shift left (event, ≥20s cadence at runtime) |
| `TWN_clip_shift_b` | 2.5s | ✗ | weight shift right (variety — never alternate mechanically) |
| `TWN_clip_glance` | 0.8s | ✗ | head-only acknowledge: 15° toward camera-side, hold 0.2s, return (once/session) |
| `TWN_clip_hand_adjust` | 1.5s | ✗ | one hand repositions on the artifact (Full tier, ≥45s cadence) |

Rules: 30fps sampling; every clip starts/ends on the shared base pose (runtime crossfades ≤200ms); no root motion; hips never leave the stool. Camera rail (A5): `CAM_rail`/`CAM_aim` empties keyed **frames 0–100 = rail 0–100%** — the scroll bible's table (18 §11) *is* the keyframe sheet; author the five named framings as marker-labeled keys (`EST/DRIFT/STUDY/AUD/DEP`).

## 14. QC & Review Gates (per delivery)

- [ ] gltf-validator zero errors/warnings · budgets script green (§9–11 targets)
- [ ] Parity renders (light+dark) pass moodboard §Acceptance (incl. grayscale test)
- [ ] LOD2-only load test: the lab must read correctly with silhouettes alone
- [ ] Clip crossfade test: breath→shift→breath with no pop
- [ ] Twin: gate #1 (style frames) and gate #2 (blockout in `cam_rail` framings) precede sculpt-polish — **no polishing before gates** (17 §12)
- [ ] Naming lint: no `.001`, no default names, collections match §2

## 15. Future Expansion

Designed-in, zero rework: additional **dock artifacts** per new content type (each a ≤1k-tri object docking to `DOCK_socket` — talks podium chip, reading-list book spine); **seasonal bench props** (v2 lighting seasons, one prop each, same shared atlas rules); **Hero v2 explorable set** — new set modules follow this exact pipeline as `SETX_*` assets (the collection/naming/budget grammar scales without amendment); **Twin resculpt at major versions** (Brand §8 renewal logic): same rig, same clips, new mesh — clips are rig-bound, not mesh-bound, precisely so the sculpt is replaceable.

---

**Start order for the artist:** lib file → bench set (cheap, proves the pipeline end-to-end) → cam rail (unblocks gate #2 with primitive stand-ins) → Twin blockout → gates → Twin production. The Twin is last on purpose: it is the most expensive asset and the only one gated on inputs that don't exist yet (owner's reference photos).
