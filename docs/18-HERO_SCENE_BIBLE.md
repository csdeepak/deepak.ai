# 18 — Hero Scene Bible v1.0

> **Status:** Approved draft — the creative bible of the Hero Scene.
> **Authored as:** Creative Director · Experience Director · Scene Designer · Motion Director · Cinematographer.
> **Relationship to law:** deepens [`17-HERO_SCENE_ARCHITECTURE.md`](17-HERO_SCENE_ARCHITECTURE.md) (D-030/D-031). The architecture's laws (DOM-text-always, identity-at-scroll-zero, no hijack, no roll, tier ladder, budgets) are **binding on every page of this bible**. Three refinements to 17 are made here and logged as D-032: the separation light (§8), time-of-day lighting (§8), and the particle taxonomy (§9).
> **Likeness gate:** no reference images of Deepak exist in the repository yet. The Twin (§4) is specified as a *style system*; the likeness itself enters at concept gate #1 when references are provided. Nothing in this bible depends on waiting.
> **Art direction:** ratified as **"The Drafted Laboratory"** — [`19-HERO_ART_DIRECTION.md`](19-HERO_ART_DIRECTION.md) (D-033). It amends this bible in five named places: drawn-assembly births, "lab drafts itself" loading, construction-line edge pass on the uber-material (Twin exempt), accent = "the live line," ≤2° axonometric ease at Study framings.

---

## 1. The One Idea

> **"This is the digital workspace of someone building intelligent systems."**

Every object, light, motion, and particle either serves that sentence or is cut. The corollaries that keep it honest:

- A *workspace* is *used* — the scene shows work mid-flight, not trophies on plinths.
- *Intelligent systems* are built by a person — the Twin works; it does not pose.
- *Digital* means truthful data — everything luminous in the scene is real content.
- Someone *building* implies time — the scene has a today (time-of-day light, freshness captions), not an eternal demo-loop.

**Tone target:** WWDC-opening confidence at library volume. The scene should feel like the moment before a keynote begins — the lights are set, the work is real, nothing is shouting yet.

**Assumptions challenged (per the brief's mandate):**
| Brief impulse | Ruling |
| --- | --- |
| "Particles: neural signals, sparks" | Kept **only as data events** (§9) — a spark with no datum behind it is glitter with a résumé |
| Rim light | Banned *dramatic* rim stands; a functional **separation hairlight** is introduced (§8) because matte graphite on graphite atmosphere genuinely needs form legibility in dark mode |
| "The graph is alive" (perpetual motion) | The graph is alive the way a library is alive: it *responds* and it *grows*; it does not writhe. Stillness-when-studied stands (17 §3.1) |
| Color logic for the graph | There is no hue logic — one accent, always (D-018). "Color logic" is **luminance logic** (§6) |
| AAA-game-menu energy | Borrowed for *responsiveness*, refused for *idle spectacle* — game menus perform to hold attention; this scene already has the visitor's attention and must spend it on comprehension |

## 2. Scene Hierarchy (deepened from 17 §2)

```
SceneRoot
├── Atmosphere            · the paper/ink volume; depth is fog, not walls
├── LightRig              · key · fill · separation · ambients · task pool (§8)
├── TheLab (set dressing, minimal)
│   ├── Workbench         · the only furniture; everything else is space
│   └── GroundHint        · contact shadow only — the lab floats in thought
├── KnowledgeGraph        · §6 — the ecosystem's landmass
│   ├── Cluster:Research      (nodes = themes; publications orbit them)
│   ├── Cluster:Projects      (largest bodies; workbench-adjacent)
│   ├── Cluster:Publications  (small, precise, satellite rings)
│   ├── Cluster:GitHub        (activity ring; pulses on real cache events)
│   ├── Strand:Experience     (a timeline filament, linear, spine-like)
│   └── Halo:CurrentMission   (whatever is *current* sits nearest the Twin,
│                              inside the task light — recency = proximity)
├── TheTwin               · §4 — one inhabitant, working
├── Dex                   · §5 — one presence, luminous
├── ParticleSystems       · §9 — four data-event emitters, dormant by default
├── CameraRig             · §7 — rail + head
└── DOMOverlay            · identity, CTAs, captions, focus proxies (law: all text)
```

**Spatial thesis:** *recency is proximity.* Current work lives near the Twin in warm task light; older work recedes into cooler atmosphere. A visitor reads freshness with their eyes before any caption says it. Depth of field is information.

## 3. Object Bible

Format per object: **Purpose / Position / Importance / Animation / Interaction / Visibility / Lighting / Relationships / Future.**

### Atmosphere
Purpose: depth, mood, and the modes (paper/ink) — the scene's page-background equivalent. Position: everywhere; density increases with distance (fog as z-axis). Importance: silent MVP — it is why the scene reads *composed* instead of *floating clip-art*. Animation: none perceivable; ≥60s density breath (Full tier only). Interaction: none. Visibility: always. Lighting: receives and softens everything. Relationships: encodes recency-as-proximity by swallowing the old. Future: seasonal/temporal variation (v2, §15).

### Workbench
Purpose: the stage of *now* — grounds the Twin, hosts the active artifact. Position: mid-ground right, under the task-light pool. Importance: the scene's emotional anchor; cut everything before this. Animation: the docked artifact (latest real project node) rotates ≤1°/s only while camera is far; still when studied. Interaction: hover → artifact halo + title caption; commit → that project's route. Visibility: Acts I–III prominent; dims to backdrop in V. Lighting: the warm task pool (§8) — the scene's brightest surface. Relationships: `CurrentMission` halo orbits it; the Twin faces it; edges from the docked artifact run outward into the graph (today's work → its lineage). Future: bench contents grow with content types (a "talks" artifact when that section ships).

### Experience strand
Purpose: time made legible — a filament of era-nodes, linear where the clusters are spatial. Position: low arc across the background, left→right = past→present, terminating near the workbench (*the past ends at today*). Importance: medium; it is context, not headline. Animation: none idle. Interaction: hover an era-node → era caption + its `produced` edges light toward artifacts. Visibility: Acts II–III. Lighting: coolest object in the scene (it is memory). Relationships: `produced` edges to everything. Future: era expansion (v2 explorable mode).

### GitHub activity ring
Purpose: live proof, cache-fed (D-010). Position: orbiting the Projects cluster. Importance: high for engineer personas. Animation: a faint pulse traverses the ring **per real recent-commit datum** (a §9 particle event — capped). Interaction: hover → "last synced ⟨stamp⟩" (honesty stamp survives in 3D); commit → /github. Visibility: Acts II–V. Lighting: self-luminous at hairline intensity. Future: PR/release event particles.

*(Twin §4 · Dex §5 · Graph §6 · Particles §9 · Camera §7 · Lighting §8 get full chapters.)*

## 4. The Twin — full design chapter

**Purpose (restated from 17, sharpened):** the Twin is not identity — DOM text is. The Twin is **presence**: the visible fact that a specific person works here, presently. Every styling decision below optimizes for *dignified presence at a respectful distance*, never for close-up likeness performance.

| Attribute | Specification |
| --- | --- |
| **Facial style** | Stylized-sculptural: simplified planar construction, features suggested by form and light rather than modeled detail — closer to a LoveFrom sculpture or a WWDC-title figure than to any game character. Recognizably *a* person with Deepak's silhouette, build, and posture; deliberately under-resolved at feature level. **Likeness calibration happens at gate #1 against real references** — target: "family resemblance," never "wax figure." |
| **Hair** | A single sculpted mass (no strand systems — the #1 uncanny-and-performance trap). Matte, one tone darker than skin material; silhouette-accurate to references at gate #1. |
| **Materials / skin** | Matte mineral — the graphite ramp warmed two steps toward clay. **No subsurface scattering, no specular skin, no pores.** The skin renders like a fine ceramic under studio light. This single decision buys: uncanny immunity, huge shader savings, and brand coherence (the DSVL made flesh — literally). |
| **Eyes** | The highest-risk 4mm in the product. Ruling: **suggested, not simulated** — softly recessed forms catching the key light; no wet shader, no irises tracking, **no eye contact with the camera, ever** (eye contact is the uncanny threshold *and* breaks the "at work" fiction). The acknowledging glance (17 §3.2) is a *head* attitude; the eyes stay with the work. |
| **Clothing** | Real-world simple: crew/overshirt in a deep graphite, single accent detail permitted (a zipper pull, a cuff seam — the one-accent law worn quietly). No logos, no tech-bro costume, no lab coat theater. Cloth is sculpted, not simulated. |
| **Pose** | Seated at the bench, weight forward, hands at the artifact — *mid-thought*, not mid-demo. The pose must read as interruptible ("he'd look up if you knocked") rather than performing ("he knows you're watching"). |
| **Idle behavior** | Breath ~4s (torso/shoulders); micro weight shifts ≥20s apart; occasional hand adjustment on the artifact (≥45s, Full tier). Nothing loops visibly — idle motion is authored in long, offset cycles so no two visits sync. |
| **Expression** | Neutral-engaged (slight concentration), fixed. **No emotional animation system** — expression change is where stylization dies and puppetry begins. |
| **Lighting** | Key models the face at ~45°; task light warms the hands and forearms (the work is lit warmer than the worker — where the eye should go); separation hairlight (§8) holds the silhouette off the atmosphere. |
| **Camera framing** | Never closer than a medium shot (waist-up at Act III's nearest). The camera respects the person the way the brand respects the visitor. Close-ups are permanently out — framing law. |
| **LOD strategy** | LOD0 ≤60k tris (Act III proximity) · LOD1 ≤25k (Acts I–II distance) · LOD2 silhouette ≤8k (Lite tier / far) · LOD3 = 2D silhouette card (Tier 0 has no Twin at all — the motif hero stands). |
| **Performance** | One skinned mesh, one 2k KTX2 material atlas, ≤24 bones, no blendshapes beyond breath/glance attitude, no cloth sim, no hair sim. |
| **Fallbacks** | Uncanny-at-gate-#1 → regress to silhouette-at-workbench (still emotionally complete: *someone works here*). Budget-fail → LOD2 permanent. References never provided → silhouette ships; the Bible does not block on the likeness. |

## 5. Dex Bible

Where 17 §3.4 defined states, this defines the *life*.

- **Where Dex lives:** the graph is Dex's habitat — it rests in the negative space between clusters, never at the scene's center (the center belongs to the work). Its home perch: the midpoint of the densest edge-cluster, where "knowing everything in the room" is spatially true.
- **How Dex appears:** it doesn't *enter* — it is already present at Arrival, small and unexplained at the graph's edge. Discovery-not-interruption is preserved: most visitors notice the moving light around Act II and form the question the Act IV beat answers.
- **How Dex sleeps:** pre-v1.5 (no AI yet) and during AI-offline: Dex rests *docked at the workbench edge* — dim, breathing at half amplitude, unlit falloff. Asleep-Dex is honest UI: the presence exists, the intelligence isn't awake. Caption on hover: "Dex is resting. Everything it knows is still on the site."
- **How Dex awakens:** on first pointer entry into the graph (or Act II via scroll), Dex brightens one step and begins its drift — awakened by *attention*, not by timer. No sound, no flash: a light noticing you back.
- **How it introduces itself:** Act IV (17 §7): drifts toward the lens, holds a respectful distance (never center-frame — offset lower-third), DOM caption in its own voice + two suggestion chips. Once per session. If the visitor scrolls past without engaging, Dex returns to habitat — no second attempt (the no-solicitation law).
- **How Dex disappears:** it doesn't vanish; it *withdraws* — panel closed or conversation ended, it drifts back to habitat over ~2s. Presence is continuous; attention is borrowed.
- **How Dex reacts:** pointer approach within its social radius → a soft brightening and a slight yield (it makes room — never flees, never chases). Node hover → if the hovered content is in Dex's last-answer citations, the edge between Dex and that node lights hairline (memory made visible).
- **How Dex follows conversation:** panel open → Dex docks screen-edge nearest the panel; **as it answers, the nodes it cites illuminate in sequence** — the scene becomes the citation trail. This is the bible's single most important AI moment: retrieval, visualized truthfully.
- **How Dex connects to the graph:** Dex's light is the only light that casts onto nodes (17). During `curious`, it hovers near whatever cluster the camera studies. Dex is rendered as *of* the graph — same accent, softer form — the librarian, not a visitor.

## 6. Knowledge Graph Bible

- **Nodes:** per 17 §3.1 anatomy. Size = content-type token; **luminance = recency** (the color logic: newest brightest — one hue, many brightnesses; a rainbow taxonomy is refused, D-018). Every node is a real record; node count is a true count.
- **Connections:** typed per IA §2 (solid `implements`, pulse-on-hover `writes-about`, dashed `references`, spine `produced`). Edges light *directionally* on interaction — meaning flows.
- **Motion:** settle-then-still. Force layout runs once at load to a hand-tuned seed, then freezes. Drift (Full tier) is sub-perceptual and suspends when the camera studies a cluster.
- **Growth:** new published content = a node *grows in* over ~1.2s with a single §9 birth-particle — on the next visit after publishing. The graph visibly accretes over months; returning visitors literally watch the record grow. (The strongest freshness signal the product will ever have.)
- **Focus:** camera-proximity or keyboard-focus → node halo + label + sibling brightening; everything else dims one step (attention as lighting).
- **Selection:** commit → route navigation (17 §6). Before leaving, the selected node flares once softly — the departure has a source.
- **Expansion / collapse:** clusters expand on focus (members ease apart ~15% for legibility) and re-nest on blur. No manual expand/collapse UI in v1 — the camera and focus do it; explicit controls belong to the explorable mode (v2).
- **Filtering:** v1 has none in-scene (filters are page furniture; the scene is a place). v2's lenses ("show me the research spine") arrive with the knowledge-map merge.
- **AI integration:** the citation-trail illumination (§5); Dex's suggested chips name real nodes; asking about a node while its cluster is framed = context awareness closing the loop.
- **Scaling:** instanced nodes cap at ~150 rendered; beyond that, oldest publications aggregate into per-year cluster nodes ("2021 · 4 papers") that expand on focus — the graph ages the way an archive does.

## 7. Camera Bible

**Grammar:** five named shots — *Establishing* (wide, all), *Drift* (dolly through graph edge), *Study* (framed on a cluster), *Audience* (Dex's Act IV two-shot: Dex lower-third, graph behind), *Departure* (rise + recede). All camera language is combinations of these; nothing else exists.

| State | Behavior |
| --- | --- |
| **Beginning** | Establishing, locked, over which identity text is already printed. The scene settles *into* the frame (≤2s, once) — the camera never "flies in" (arrival theater is banned). |
| **Hover (pointer)** | Parallax head only (≤2°, damped). The rail never responds to the pointer — scroll owns travel, pointer owns micro-perspective. Clean separation of authority. |
| **Scroll** | The rail (17 §4): scrubbed, bidirectional, damped ≤150ms, no roll, pitch ±12°. |
| **Idle** | Nothing. The camera never wanders on its own — an unattended scene is a still photograph, not a screensaver. (Challenged and kept: idle drift is what AAA menus do to beg attention; refused, §1.) |
| **Focus (keyboard)** | Focus proxy → nearest rail point + Study framing in ≤300ms. Keyboard users travel by attention. |
| **Conversation** | Panel opens → camera eases to Audience and *holds* (a conversation deserves a stable shot); citation illuminations play in the held frame. |
| **Project selection** | Study on the node → soft flare → shared-element hand-off toward the route (the node's screen position seeds the destination page's title position where the platform allows). |
| **Research exploration** | Drift slows through the Research cluster; publications' satellite rings resolve; the strand's `produced` edges glimmer beneath. |
| **End of hero** | Departure: rise, recede, atmosphere thickens, scene settles into a dimmed backdrop as the DOM page slides over (Act V). The last frame holds the whole lab — you leave knowing where everything is. |

## 8. Lighting Bible

| Light | Spec | Purpose |
| --- | --- | --- |
| **Key** | Soft area, upper-left, slightly warm; the lab's window | Forms, faces, the day |
| **Fill** | Atmosphere-ambient, low ratio | Legibility without drama |
| **Separation hairlight** *(refines 17 — D-032)* | Hairline-thin, cool, from behind-above; intensity capped so it reads as *edge definition*, never as glow | Holds the Twin and near objects off the atmosphere in dark mode; **dramatic rim remains banned** — this light draws the DSVL hairline around the figure |
| **Task pool** | Small warm pool on the bench | *Work happens here* — the narrative light |
| **Graph illumination** | Node self-luminance (recency = brightness); edges hairline-emissive | The record lit by its own currency |
| **Interaction lighting** | Focus/hover halos; the attention-dimming of everything else | Attention as light, one step, reversible |
| **Dex** | The only caster among the small lights (17) | Presence as illumination |
| **Time-of-day philosophy** *(refines 17 — D-032)* | Key temperature/angle eases across the *visitor's local* day: cooler higher morning → warm low evening; range subtle enough to never break either theme mode. The lab exists in the visitor's own time — quiet honesty, and no two visits are identical. Disabled: RM, Lite, Tier 0. | The scene has a *today* |
| **Future dynamic** | Publication-day warmth, deadline-week cooler focus (v2, opt-in, data-driven only) | Atmosphere as freshness |

## 9. Particle Bible — particles as information (D-032 taxonomy)

**The law: every particle is a datum.** A particle with no record behind it does not spawn. No idle emitters, no ambient sparkle fields; the one atmospheric exception (dust in the key shaft, ≤40 instances, 17 §8) is *set dressing*, not information, and is named as such.

| Event particle | Trigger (real datum) | Behavior | Cap |
| --- | --- | --- | --- |
| **Birth** | New content published since visitor's last session | Single soft flare as the node grows in (§6) | ≤3/session, queued |
| **Commit pulse** | Recent commits in the GitHub cache | A pulse traverses the activity ring per datum | ≤1 visible at a time |
| **Citation trace** | Dex cites a source mid-answer | A point of light travels Dex→node along the edge, then the node holds lit | ≤2 concurrent |
| **Selection flare** | Visitor commits a node | One soft flare at departure (§7) | 1 |

Rejected from the brief's examples: "neural signals" and "research sparks" as ambient effects — neurons that fire without information are the definition of glitter. If a future datum earns a particle, it enters this table by decision entry.

## 10. Motion Bible (consolidated)

| Object | Idle | Hover/Focus | Selection/Event |
| --- | --- | --- | --- |
| Twin | breath 4s · micro-shifts ≥20s | none (people aren't buttons); bench artifact only | acknowledging glance (once, 0.8s, head-only) |
| Dex | breath 2.4s · habitat drift | brighten + yield | Act IV approach 1.2s once · dock/withdraw 2s |
| Nodes | still (drift Full-tier, suspends on study) | halo 120ms + siblings +1 step | grow-in 1.2s · flare 300ms |
| Edges | still | directional light-up 200ms | citation trace ~600ms/edge |
| Camera | **never** | parallax ≤2° damped | rail scrub · Study ≤300ms · Audience hold |
| Lighting | ≥60s drifts (Full) | attention-dimming 200ms | — |
| Particles | none exist idle | — | per §9 table |
| Ambient budget | **≤3 simultaneous ambient motions per frame** (17 §8 law) — this table is auditable against it | | |

## 11. Scroll Bible (0→100% of the rail ≈ first ~200vh)

| % | Camera | Scene | DOM overlay |
| --- | --- | --- | --- |
| 0 | Establishing, locked | Scene settles (once/session); Twin at work; Dex faint at habitat | **Identity + CTAs fully legible** |
| 5 | Micro push-in begins | Atmosphere parts slightly | Identity holds |
| 10 | Rail engages toward graph | Nearest cluster (Projects) gains definition | CTAs persist (screen-fixed until 20%) |
| 15 | Drift enters graph airspace | Project nodes label as passed | First caption: "⟨n⟩ projects" (true count) |
| 20 | Drift deepens | Edges light along travel direction | Identity condenses to the nav (wordmark persists) |
| 25 | Bearing toward Research | Publications' satellite rings resolve | "⟨n⟩ publications · ⟨venues⟩" |
| 30 | Study: Research cluster | Theme nodes brighten; strand glimmers below | Theme name caption |
| 35 | Pull back to Drift | GitHub ring enters view; commit pulse if datum exists | "last synced ⟨stamp⟩" |
| 40 | Curve toward the bench | Task pool grows in the frame | — |
| 45 | Approach | CurrentMission halo resolves around bench | "Currently: ⟨real focus⟩" (R5 rule) |
| 50 | **Study: the Twin** (medium shot, nearest) | Acknowledging glance if dwelt ≥3s | Freshness caption holds |
| 55 | Hold eases | Docked artifact hoverable, titled | Artifact title |
| 60 | Camera pauses (Audience pre-frame) | **Dex leaves habitat, approaches** | — |
| 65 | Audience two-shot | Dex holds lower-third, breathing | Dex introduces itself (own voice) |
| 70 | Hold | Citation edges shimmer once toward 2 nodes (a preview of how it answers) | 2 suggestion chips |
| 75 | Hold releases | Dex yields aside if not engaged | Chips persist until 80% |
| 80 | Departure begins: rise | Graph re-widens below; whole lab re-enters frame | — |
| 85 | Rise + recede | Atmosphere thickens; scene dims one step | S2's heading edge appears |
| 90 | Recede continues | Scene settles as fixed backdrop | Page begins sliding over |
| 95 | Locked backdrop | Lab holds in soft focus | S2 Featured Work fully arriving |
| 100 | Static | Scene = dimmed environment behind the page | **The page owns the scroll** — the record the scene promised |

Reduced motion: rows 0 / 25 / 50 / 65 / 90 become the five composed stations (17 §4); all between-states are cuts.

## 12. Performance Bible

Budgets are 17 §9 (binding). Strategy:
- **Instancing:** all nodes one instanced mesh (per-instance: position, radius, luminance, halo). Edges: instanced segments or a single merged hairline mesh. Target ≤100 draw calls total.
- **LOD:** Twin 4-chain (§4); node halos are shader, not geometry; clusters aggregate past 150 nodes (§6).
- **Asset streaming:** scene loads **after** DOM LCP (law): overlay text → atmosphere+lights (procedural, ~0 bytes) → graph (data + instanced mesh, tiny) → Twin (the heavy asset, streamed with silhouette-LOD placeholder first). The visitor watches the lab *furnish itself* inside 2–3s — loading as arrival, never as a wall.
- **Shaders:** one uber-material (matte graphite, params per object) + one emissive + atmosphere. No post stack beyond tone mapping + soft vignette; **no bloom** (halos are painted in-shader — bloom is where accent discipline goes to die).
- **Textures:** Twin atlas 2k KTX2; everything else vertex-color/procedural. Total ≤8MB (17).
- **Mesh:** ≤150k tris scene (Twin ≤60k within it).
- **Memory:** ≤300MB GPU (Full) / ≤150MB (Lite); render pauses off-viewport, hidden tab, battery-saver (17).
- **Frame governance:** dynamic resolution scaling before feature loss; feature-shedding order (Full→Lite live): particles → lighting drift → node drift → parallax. 60fps desktop / 30–60 mobile per tier.

## 13. Accessibility Bible

All of 17 §11 binding, plus bible-level specifics: the scroll table's every caption is DOM text in document order (a screen reader hears the *whole tour* as a coherent narrative without the canvas); Dex's introduction and chips are the same DOM as v1.5's S6 grammar; keyboard focus order = Act order (identity → CTAs → clusters by act → bench artifact → Dex); the acknowledging glance never fires for keyboard-only visitors' focus (a glance you can't see approaching is a jump-scare — pointer-dwell only); low-end/save-data = Tier 0 with zero 3D bytes (the shipped hero); the fallback scene *is* the product's already-reviewed hero — fallback as first-class citizen, permanently.

## 14. Asset Bible

| Asset | Spec | Gate |
| --- | --- | --- |
| Twin style frames (2D) | 3–5 concept drawings in the drawn-line language, against likeness references | **Gate #1 — owner + hallway (uncanny check on paper)** |
| Twin sculpt | LOD0–3 chain, rig ≤24 bones, breath/shift/glance clips | Gate #2 blockout first |
| Workbench + artifact dock | ≤10k tris, shares uber-material | Gate #2 |
| Node/edge kit | instanced primitives + shader halos | — (procedural-first) |
| Dex | sphere + falloff light + shader breath | — (already fully specified) |
| Atmosphere/light rig | procedural | — |
| Scene data binding | ContentService → graph schema | with content layer (docs/09) |
All assets: glTF+Draco, KTX2, versioned in object storage/CDN (D-013); the Twin's sculpt is renewable at major versions (the portrait-photograph logic, Brand §8).

## 15. Future Evolution

**Hero v2 — the persistent lab:** the scene stops ending at Act V; it becomes the site-wide environment. Pages float as planes *within* the lab; navigation = camera travel; the knowledge map (XA §13) merges with the graph — one world, fully explorable, with in-scene lenses/filters (§6). The Dex citation-trail becomes site-wide: any page you read lights its node behind the glass.

**Hero v3 — the inhabited lab:** presence-honesty made literal — the Twin's activity mirrors real recent activity (writing days at the desk's notebook, shipping weeks at the artifact); voice conversation with Dex in-scene (the reserved slot); visitor co-presence experiments (anonymous "3 people are reading the metric-learning paper" as faint warm points — only if it can be done with dignity); atmosphere seasons driven by the actual research calendar. v3's bar: the scene should eventually be *the truthful ambient render of a working life* — the Personal OS with the lights on.

---

## Appendix — Self-critique
**Strongest ideas:** recency-as-proximity (space = freshness); the citation-trail illumination (RAG made visible and honest); the graph that grows between visits; loading-as-arrival. **Riskiest:** the Twin's face (mitigated: style system + eyes-suggested + no-close-ups + gate #1 on drawings); time-of-day subtlety (must never fight theme modes — capped range, disable lever). **Cut candidates if scope bites** (in order): time-of-day → acknowledging glance → commit pulses → separation light (dark-mode legibility then solved by atmosphere contrast). The bible obeys its own law: everything above serves the one idea, and everything that didn't is already gone.
