# 23 — Personal OS Runtime Architecture

> **Status:** Approved draft — the permanent runtime spine of Deepak Labs.
> **Authored as:** Principal Systems Architect.
> **Bound by / extends:** `11` (modular monolith, D-007) · `12` (XA) · `04` (IA/relations) · `22` (hero runtime, D-036) · the shipped `apps/web` stores. **Does not modify the Hero Runtime** — the hero becomes a *client* of this OS.
> **Architecture only — no implementation.** This is a target skeleton adopted incrementally (§11), not a rewrite of shipped code.

---

## 0. Position — what an "operating system" means here, and one correction

Deepak Labs stops being a stack of pages and becomes a set of **runtimes coordinated by a kernel**. The desktop-OS analogy is exact in one way that matters: an OS's programs don't call each other's internals — they talk to the *kernel* (syscalls) and to a *message layer* (signals/IPC). We copy that shape.

**The brief's one instruction I am overriding, with reason:** "communicate *only* through the Event Bus." A pure event bus is correct for **notifications** and wrong for **queries**. Search, retrieval, and relation-lookups are request→response; modeling them as fire-and-forget events forces correlation-ID plumbing, invites races, and buries simple reads under choreography — precisely the "unnecessary complexity" the PRD forbids. 

**The resolution — two planes, one kernel:**

| Plane | Shape | For | Coupling |
| --- | --- | --- | --- |
| **Event Bus** | pub/sub, fire-and-forget, past-tense facts | choreography, notifications, side-effects | many→many, anonymous |
| **Capability Registry** | typed request→response interfaces | queries, reads, commands with results | consumer→*interface* (not provider) |

Both are owned by the **Kernel**. A module depends on `IKnowledgeQuery` (a kernel-owned contract), never on the Knowledge module. The brief's real requirement — *no module directly depends on another* — is satisfied literally and completely. What changes is only that "depends on the kernel" now covers two mechanisms instead of one.

**The floor principle (inherited from the hero, made universal):** every runtime degrades to a designed lesser state; the DOM content plane is the permanent floor. "The ceiling disappears; the room remains" is now an OS-wide law (§9).

---

## 1. The Kernel

The kernel is tiny and owns nothing domain-specific. Its whole job is to let runtimes find each other without knowing each other.

```
┌──────────────────────── RUNTIME KERNEL ────────────────────────┐
│                                                                 │
│  EventBus            publish(event) · subscribe(type, handler)  │
│                      · isolated delivery · replay(last-N)        │
│                                                                 │
│  CapabilityRegistry  register(name@ver, impl) · resolve(name)   │
│                      · returns typed handle or Unavailable      │
│                                                                 │
│  Lifecycle           boot order · ready gates · teardown        │
│  Contracts           the event catalog + capability interfaces  │
│                      (the ONLY thing every module imports)      │
└─────────────────────────────────────────────────────────────────┘
```

- **Contracts package** is the single shared dependency: event type definitions + capability interfaces + shared value types (from `04` content model, `types/content.ts`). Modules import *contracts*, never each other. This is the enforceable form of D-007's "dependencies flow one way."
- **Boot & ready gates:** runtimes register capabilities and subscriptions at boot; a runtime may declare readiness so consumers can wait or degrade. No runtime blocks another's boot — a missing runtime resolves as `Unavailable`, not a crash.
- **Kernel has no business logic, no state, no UI.** It is replaceable and testable in isolation; every runtime is mockable by registering a fake capability.

---

## 2. Module Map

```
                          ┌─────────────┐
                          │   KERNEL    │  bus + registry + contracts
                          └──────┬──────┘
        ┌──────────┬──────────┬──┴───────┬──────────┬──────────┐
   Experience  Navigation   Motion    Theme    Accessibility  Analytics
     Engine      Runtime    Runtime   Runtime     Runtime      Runtime
        │          │          │          │           │            │
   ─────┴──────────┴──────────┴──────────┴───────────┴────────────┴─────
        │          │                                 │
    Knowledge   Content        AI Runtime        Hero Runtime
     Engine     Runtime         (Dex)            (docs/22 — CLIENT,
        │          │              │               unmodified)
   (system of record: PostgreSQL per D-008; runtimes own read-models)
```

**What exists today vs. what this formalizes** (the OS is grown into, not bought):

| Runtime | Embryo shipped today | Status |
| --- | --- | --- |
| Motion / Accessibility | `MotionConfig reducedMotion="user"`, `animations/*` recipes | partial |
| Theme | `next-themes` provider | partial |
| Navigation | `ui-store` (⌘K wiring), `constants/routes` | partial |
| Knowledge / Content | `ContentService` interface + `localContent` | interface only |
| Hero (client) | full `features/hero-scene` (D-037) | shipped |
| AI (Dex) | `features/dex` graceful-absence boundary | stub |
| Experience / Analytics / Event Bus / Kernel | — | net-new |

The kernel + bus are the net-new spine; most runtimes already have a store or interface that becomes their public face.

---

## 3. Event Bus Design

**Event shape:** `{ type, payload, meta:{ id, ts, source, correlationId? } }`. Past-tense, immutable facts. Naming: `domain.thing.happened` (`nav.intent.raised`, `content.published`, `dex.answer.completed`, `theme.changed`, `a11y.reducedMotion.changed`).

**The catalog (by domain — versioned, additive-only):**

| Domain | Representative events |
| --- | --- |
| `nav.*` | `intent.raised` · `route.committed` · `context.switched` · `palette.opened/closed` |
| `experience.*` | `transition.started/completed` · `story.beat.entered` |
| `content.*` | `published` · `updated` · `unpublished` (from CMS/Content Runtime) |
| `knowledge.*` | `graph.rebuilt` · `node.focused` · `relation.traversed` |
| `dex.*` | `awoke` · `question.asked` · `answer.streaming` · `answer.cited` · `slept` · `unavailable` |
| `motion.*` | `budget.changed` · `celebration.fired` |
| `theme.*` | `changed` · `daypart.shifted` |
| `a11y.*` | `reducedMotion.changed` · `keyboardMode.entered` · `focus.moved` |
| `analytics.*` | (sink only — subscribes widely, rarely publishes) |

**Delivery guarantees:**
- **Isolated delivery:** a throwing subscriber never breaks the publish or other subscribers (bulkhead — §9). Errors route to Analytics/ops.
- **Synchronous within a frame, ordered per type**; no cross-type ordering promised (runtimes must not assume event B follows event A unless documented as a sequence).
- **Bounded replay:** the bus retains the last-N of designated "state-fact" events (e.g. `theme.changed`, `a11y.reducedMotion.changed`) so a late-booting runtime (the lazy hero chunk) can catch up on current reality without a query. This is the one concession to state-over-events, and it is deliberate and bounded.
- **No payload is a command.** Events describe the past; they never instruct. "Please navigate" is a *capability call* or a `nav.intent.raised` fact the Navigation Runtime chooses to honor — never `nav.do()` over the bus.

---

## 4. Capability Registry (the query plane)

Typed interfaces registered by their owner, resolved by consumers. Every capability returns either its typed result or a typed `Unavailable(reason)` — **no capability ever throws across a module boundary** (§9).

| Capability | Owner | Shape (illustrative) |
| --- | --- | --- |
| `IKnowledgeQuery` | Knowledge | `search(q) → Result[]` · `relations(id) → Relation[]` · `node(id) → Node` |
| `IContentRead` | Content | `get(type, slug)` · `list(type, filter)` · `latest(type, n)` |
| `IRetrieval` | Knowledge/AI | `retrieve(query) → Chunk[]` (RAG, gated) |
| `IDexSession` | AI | `ask(q) → stream` · `sessionContext()` |
| `IThemeState` | Theme | `current()` · `daypart()` |
| `IA11yState` | Accessibility | `reducedMotion()` · `keyboardActive()` |
| `INavigate` | Navigation | `to(route, opts) → Promise<committed>` |

**Versioning:** capabilities are `name@major`; a breaking change registers `name@2` alongside `name@1` until consumers migrate (deprecation-over-deletion, per D-025 governance). Consumers resolve the version they were written against.

**Why this is still decoupled:** the Knowledge Runtime could be replaced by a Postgres-backed implementation, a static-JSON one, or a mock — consumers of `IKnowledgeQuery@1` never notice. This is exactly D-011's "search behind a swappable interface," generalized to every module.

---

## 5. The Ten Runtimes

Each: **Responsibility · Owns (data/state) · Publishes · Subscribes · Exposes · Consumes · Degraded mode.**

### 5.1 Experience Engine
- **Responsibility:** the storyteller — orchestrates page/scene transitions and the global narrative arc; decides *how* a context change is performed.
- **Owns:** transition state; the story-beat model (which arc position the visitor is in).
- **Publishes:** `experience.transition.started/completed`, `experience.story.beat.entered`.
- **Subscribes:** `nav.intent.raised` (to choreograph the move), `a11y.reducedMotion.changed`, `theme.changed`.
- **Exposes:** — (orchestrator, not a data source).
- **Consumes:** `INavigate` (to commit routes), `IA11yState`, Motion via events.
- **Degraded:** falls back to instant route commits (no choreography) — the Navigation Runtime still delivers the destination. The story is an enhancement; wayfinding is the floor.

### 5.2 Knowledge Engine
- **Responsibility:** the semantic brain — projects, publications, skills, timeline, the relation graph (`04` §2), search, and the retrieval index for Dex.
- **Owns:** the **read-models** derived from content: the graph, the search index (Postgres FTS, D-011), the embedding index view (pgvector, D-009). *Not* the source content (that's Content Runtime) — Knowledge owns *projections*.
- **Publishes:** `knowledge.graph.rebuilt`, `knowledge.node.focused`.
- **Subscribes:** `content.published/updated/unpublished` (to reproject).
- **Exposes:** `IKnowledgeQuery`, `IRetrieval`.
- **Consumes:** `IContentRead`.
- **Degraded:** stale-but-served (last good projection); if the index is cold, `search` returns `Unavailable` and consumers fall back (palette → static routes; Dex → "I can't reach my knowledge right now").

### 5.3 Motion Runtime
- **Responsibility:** global motion authority — tokens, shared timelines, and **ownership of scroll, cursor, and gesture** (the brief's key demand: one owner, no fights).
- **Owns:** the motion budget/quality flags (generalizing the hero's PerfGovernor concept OS-wide); the scroll-progress and pointer refs (the continuous plane, D-029/D-037); the gesture interpretation.
- **Publishes:** `motion.budget.changed`, `motion.celebration.fired`.
- **Subscribes:** `a11y.reducedMotion.changed` (hard override), `experience.transition.*` (to lend shared-element timelines).
- **Exposes:** shared timeline handles (via capability for imperative one-shots — GSAP seam), the continuous refs (module-scoped, read-only to others).
- **Consumes:** `IA11yState`.
- **Degraded / the ownership rule:** exactly **one** scroll owner, one cursor policy, one gesture interpreter, globally. Modules *request* motion; they never install competing scroll listeners. Under reduced motion, Motion Runtime resolves every token to its static equivalent — the parity mapping (`08`) becomes an OS service, not per-component code.

### 5.4 Navigation Runtime
- **Responsibility:** global search, the Command Palette, AI routing (hand-off to Dex), and context switching — the "what does the visitor want to reach" layer.
- **Owns:** palette open/focus state (today's `ui-store`), route intent, current-context descriptor.
- **Publishes:** `nav.intent.raised`, `nav.route.committed`, `nav.context.switched`, `nav.palette.opened/closed`.
- **Subscribes:** `dex.answer.cited` (a citation is a navigable intent), `knowledge.node.focused`.
- **Exposes:** `INavigate` (the single sanctioned way to change route — no module calls the router directly).
- **Consumes:** `IKnowledgeQuery` (palette search results), `IDexSession` (the "ask instead" hand-off).
- **Degraded:** palette reduces to static route list if Knowledge search is unavailable; AI routing hides if Dex is asleep. Native links always work (the floor).

### 5.5 AI Runtime (Dex)
- **Responsibility:** Dex's lifecycle, conversation state, retrieval orchestration, recommendations, session awareness (per `12` §7, D-015). The *mind*; the hero's `DexPlaceholder` is only the *body*.
- **Owns:** conversation state, session context (client-held, ephemeral — future opt-in memory), recommendation logic.
- **Publishes:** the full `dex.*` lifecycle (`awoke`, `question.asked`, `answer.streaming`, `answer.cited`, `slept`, `unavailable`).
- **Subscribes:** `nav.context.switched` (context awareness — "reading about X"), `knowledge.node.focused`.
- **Exposes:** `IDexSession`.
- **Consumes:** `IRetrieval` (RAG, retrieval-gated), `IKnowledgeQuery` (recommendations traverse the graph).
- **Degraded:** the graceful-absence spine already shipped — no capability registered ⇒ Dex is "resting," entry points quietly reduce, the site is fully usable. `dex.*` simply never fires. This is v1.5's plug-in point: register `IDexSession`, and the body already listening in the hero wakes up. **No rework seam** (D-037 confirmed).

### 5.6 Content Runtime
- **Responsibility:** the system of record for authored content — posts, news, publications, gallery — and CMS synchronization (the admin's write path, GitHub cache sync, news ingestion).
- **Owns:** the canonical content data (PostgreSQL, D-008); publish lifecycle state (draft→scheduled→published→archived); the CDN media references.
- **Publishes:** `content.published/updated/unpublished` (the fan-out trigger — architecture §3's "write once, surface everywhere").
- **Subscribes:** — (source of truth; upstream of everything).
- **Exposes:** `IContentRead`.
- **Consumes:** — (owns its data end-to-end).
- **Degraded:** reads serve the last successful build/ISR snapshot; a CMS write failure never affects the public read path (separate concerns, architecture §5). Today: `localContent` is the implementation; swapping to Postgres is a registry re-registration.

### 5.7 Analytics Runtime
- **Responsibility:** visitor journeys, reading depth, hero engagement, AI-interaction and heatmap capture — privacy-respecting, aggregate-only (PRD constraint).
- **Owns:** the event sink + aggregation store; nothing on the read/render path.
- **Publishes:** rarely (maybe `analytics.milestone` for the admin).
- **Subscribes:** **widely and passively** — `nav.*`, `experience.story.beat.*`, `dex.question.asked`, `content.*`. It is the bus's model tenant: a pure subscriber that couples to nothing.
- **Exposes:** an admin-only query capability (later).
- **Degraded:** **always droppable.** Analytics failure is invisible to visitors by construction — events are fire-and-forget, the sink is best-effort, and no runtime ever awaits Analytics. This is *why* the bus matters: the most optional runtime is also the most decoupled.

### 5.8 Theme Runtime
- **Responsibility:** themes (light/dark/system), dynamic lighting cues, time-aware appearance (the hero's daypart lighting), future seasonal themes.
- **Owns:** theme preference + resolved mode; the daypart clock; the design-token *values* surface (the CSS custom-property layer, D-025 tier-1).
- **Publishes:** `theme.changed`, `theme.daypart.shifted`.
- **Subscribes:** — (a source; time and user preference drive it).
- **Exposes:** `IThemeState`.
- **Consumes:** `IA11yState` (reduced motion disables daypart drift, per D-032).
- **Degraded:** falls to the default light mode with static tokens; the daypart system is pure enhancement. The hero already consumes theme via `useCssColor` — this formalizes that channel.

### 5.9 Accessibility Runtime
- **Responsibility:** the OS-wide guarantor — reduced-motion, keyboard-mode detection, screen-reader posture, focus orchestration. **The highest-authority runtime:** its signals override motion, theme drift, and experience choreography.
- **Owns:** the a11y state (reduced-motion, keyboard-active, focus target).
- **Publishes:** `a11y.reducedMotion.changed`, `a11y.keyboardMode.entered`, `a11y.focus.moved`.
- **Subscribes:** `nav.route.committed` (manage focus across routes), `experience.transition.completed` (return focus).
- **Exposes:** `IA11yState`.
- **Consumes:** — (senses the environment directly: media queries, input modality).
- **Degraded:** **never degrades — it is a floor, not a ceiling.** If everything else fails, the DOM + semantics + focus ring remain, governed here. Accessibility is the one runtime with no "lesser mode": its minimum *is* the product's guarantee (`12` §11).

### 5.10 Event Bus
Not a peer runtime — it is *inside the kernel* (§1, §3). Listed by the brief as a module; architecturally it is the substrate the other nine stand on. Recording it here so the mapping is complete: the bus is kernel-owned, has no domain state, and is the only thing that may be "always present" because it is the thing presence is measured against.

---

## 6. Event Flow (choreographies)

**A. Visitor selects a project (the flagship flow):**
```
[Graph node / card click]
  → Navigation: publish nav.intent.raised{to: project/x}
  → Experience: (subscribes) chooses transition; publish experience.transition.started
  → Motion: (subscribes) lends shared-element timeline (owns the animation)
  → Hero Runtime: (subscribes) if leaving hero, plays departure (Act V)
  → Navigation: resolve INavigate.to() → route commits → publish nav.route.committed
  → Accessibility: (subscribes) moves focus to the new <main> heading
  → Analytics: (subscribes) records the journey hop
  → Experience: publish experience.transition.completed
```
No module called another. Five runtimes cooperated; each only knows the bus.

**B. Dex answers with citations (v1.5):**
```
[Visitor asks in palette] → Navigation: IDexSession.ask()
  → AI: publish dex.question.asked; IRetrieval.retrieve() (gated)
  → AI: stream; publish dex.answer.streaming ... dex.answer.cited{nodeIds}
  → Knowledge/Hero: (subscribe cited) illuminate those nodes (the citation trail, docs/18 §5)
  → Navigation: cited node is a nav.intent candidate ("take me there")
  → Analytics: records ai.interaction
```

**C. Time-of-day shift (ambient, no user action):**
```
Theme: daypart clock ticks → publish theme.daypart.shifted
  → Hero: relights key (if Full tier & not reduced-motion — checks IA11yState)
  → (DOM needs nothing; tokens unchanged) 
```

**D. Visitor enables reduced motion mid-session:**
```
Accessibility: media query flips → publish a11y.reducedMotion.changed{true}
  → Motion: resolve all tokens to static; publish motion.budget.changed
  → Hero: switch to stations model (frameloop=demand)
  → Experience: transitions become instant
  → Theme: disable daypart drift
```
One fact; four runtimes reconfigure; zero coupling. This flow *is* the argument for the bus.

---

## 7. Ownership Model (the single-writer law)

**Exactly one runtime writes any given datum; everyone else reads via capability or reacts to events.** Violations are the bug class this architecture exists to prevent.

| Domain | Sole writer | Everyone else |
| --- | --- | --- |
| Authored content | Content Runtime | read via `IContentRead` |
| Graph / search / embedding index | Knowledge Engine | read via `IKnowledgeQuery` / `IRetrieval` |
| Route / navigation intent | Navigation Runtime | request via `INavigate`, observe `nav.*` |
| Conversation / session | AI Runtime | observe `dex.*`, ask via `IDexSession` |
| Theme / daypart / token values | Theme Runtime | read `IThemeState`, observe `theme.*` |
| Reduced-motion / focus / kbd | Accessibility Runtime | read `IA11yState`, observe `a11y.*` |
| Motion budget / scroll / cursor | Motion Runtime | request timelines, read refs |
| Transition / story beat | Experience Engine | observe `experience.*` |
| Analytics log | Analytics Runtime | (write-only sink; nobody reads on the render path) |

## 8. Data & State Ownership Map (grounded in the codebase)

- **System of record (server):** PostgreSQL (D-008) — Content owns rows; Knowledge owns derived read-models/indexes over them. One database, clear projection boundary.
- **Client runtime state (Zustand + refs, per D-029/D-037):**
  - `ui-store`/nav-store → Navigation Runtime (overlays, palette, context)
  - `hero-store` → Hero Runtime (scene discrete state) — *unchanged*
  - session/conversation store → AI Runtime
  - theme (next-themes) → Theme Runtime
  - continuous refs (scroll, pointer) → Motion Runtime (the one owner)
- **Contracts package** → Kernel (event types + capability interfaces + shared content types). The only cross-module import.
- **Rule:** client state mirrors server via capability reads; it is never a second source of truth. Continuous values never enter React state (D-029) — that law is now Motion Runtime's charter.

## 9. Failure & Recovery

**Bulkheads, not cascades.** Each runtime is isolated; one failing degrades *itself* to a designed mode, never the whole.

| Mechanism | Behavior |
| --- | --- |
| **Bus isolation** | a throwing subscriber is caught, logged to Analytics/ops, and does not affect the publish or siblings |
| **Capability `Unavailable`** | reads return a typed unavailable-result; consumers have a declared fallback (never a throw across boundaries) |
| **Per-runtime degraded mode** | declared in §5 — every runtime has one *except Accessibility*, which is the floor |
| **The content plane is the floor** | DOM + semantics + native links survive the loss of every enhancement runtime (the hero's "room remains," OS-wide) |
| **Boot resilience** | a runtime that fails to register simply doesn't exist to consumers (`Unavailable`); nothing waits on it |
| **Replay for late boot** | state-fact events (theme, reduced-motion) are replayable so lazy runtimes (hero chunk) start in the correct reality |

**Recovery ordering under pressure** mirrors the hero governor generalized: shed enhancement runtimes before core ones — Analytics (always droppable) → Motion ambient → Experience choreography → AI → … → Content/Accessibility (never shed). The visitor loses polish before they lose the work, and never loses access.

## 10. Extension Strategy

**Open/closed by construction:** a new module ships by (1) importing contracts, (2) registering its capabilities, (3) subscribing/publishing events — **with zero edits to any existing module.** The kernel never grows for a new module; only the contract catalog does (additively).

| Future module | Plugs in as |
| --- | --- |
| Dex (v1.5) | register `IDexSession` + `IRetrieval`; the shipped body and Navigation hand-off already listen — pure addition (D-037) |
| News / Radar (v2) | a Content Runtime content-type + its ingestion worker publishing `content.published`; a lane in Navigation. No core change |
| Admin | a write-side client of Content Runtime; publishes `content.*`; consumes everything read-only for previews |
| Knowledge Map (XA §13) | a new *view* over `IKnowledgeQuery` + `knowledge.graph.rebuilt` — the graph data already exists |
| Programmatic/agent API (arch §20) | a public adapter over `IContentRead`/`IKnowledgeQuery` — the read plane, exposed |
| Multilingual, seasonal themes, voice Dex | locale dimension / Theme daypart extension / AI capability extension — all additive |

**Contract governance** follows D-025: closed where it must be (event *shapes* are versioned, capabilities are `@major`), open where it should be (new event types, new capabilities). Deprecation aliases for one major version; nothing breaks silently.

## 11. Adoption Reality (the honest part)

This is a **target skeleton, adopted incrementally** — not a mandate to refactor shipped code this week. For a one-maintainer product, the value is *discipline for what comes next*, and premature kernelization would itself violate the PRD.

**Recommended adoption order:**
1. **Contracts package + a minimal EventBus** (net-new, tiny) — and route the *already-shipped* cross-cutting signals through it: reduced-motion, theme-changed. Immediate payoff, no rewrite.
2. **Wrap existing stores as runtime faces** — `ui-store` → Navigation, `hero-store` stays, `ContentService` → Content/Knowledge capabilities. Rename-and-formalize, not rebuild.
3. **New modules are born OS-native** — Dex (v1.5), News (v2), Admin ship as proper runtimes from day one. This is where the architecture earns itself.
4. **Never retrofit for its own sake** — a runtime that works and has one consumer does not need the bus until it has two. The kernel is ready when the second consumer arrives, not before.

The OS is the shape the product *grows into* as its modules multiply — the same way the documentation-first repository was the shape the codebase grew into.

---

## Appendix — Relationship to existing decisions

| This runtime formalizes | Prior decision |
| --- | --- |
| Modular monolith, one-way deps | D-007 (kernel makes it enforceable) |
| Content = system of record; Knowledge = projections | D-008/D-009/D-011 |
| Interface-swappable everything | D-011 generalized to the Capability Registry |
| Continuous-in-refs, discrete-in-store | D-029/D-037 → Motion Runtime charter |
| Graceful absence / tier floor | D-037 → OS-wide floor principle (§9) |
| Reduced-motion parity as a service | `08`/`12` §11 → Accessibility Runtime |
| Token values behind one surface | D-025 → Theme Runtime |
| Dex represents-not-impersonates, cited, gated | D-015/D-009 → AI Runtime contracts |

**New decision:** D-038 (the kernel, the two-plane model, the ten runtimes, the single-writer law).
