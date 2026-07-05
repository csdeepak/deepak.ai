# 06 — Tech Stack

> **Status:** **Frontend ratified** (Sprint 0, D-028). Backend/data vendors and AI models remain open — see "Still to ratify."
> The architecture (`docs/11`) constrains these choices to capabilities; this document names the products.

## Frontend (ratified — D-028)

| Concern | Choice | Why (capability it satisfies) |
| --- | --- | --- |
| Framework | **Next.js (App Router)** | Hybrid SSG/ISR/SSR per route (docs/11 §6); server components default; the SEO/performance profile the landing budget demands |
| Language | **TypeScript, strict** (+ `noUncheckedIndexedAccess`) | Decade-maintainability; the content model as compile-time contract |
| Styling | **Tailwind CSS v4** | CSS-first `@theme` maps docs/15 tokens 1:1; semantic utilities enforce the three-tier rule |
| Motion | **Motion** (motion/react) | Declarative recipes (docs/08); `MotionConfig reducedMotion="user"` gives global parity |
| Draw-ins | **GSAP** (lazy-loaded only) | SVG stroke choreography (hero motif, timeline) beyond Motion's sweet spot; never on the reading path |
| Icons | **Lucide** | Outline, 1.5px stroke — matches DSVL §6 icon charter |
| Theming | **next-themes** | Class-strategy light/dark/system with no-flash |
| Primitives | **shadcn-style, hand-rolled on Radix** (Dialog, Tooltip) | "Foundation only, customize everything" — we take Radix behavior + CVA patterns, not the stock skin; one overlay contract (docs/15 §7) |
| State | **Zustand** | Overlay state only; content state belongs to the server |
| Lint | ESLint 9 + `eslint-config-next` | Standard Next flat config |

**Structure:** `apps/web` in the npm-workspaces monorepo (D-007). Shared packages split out (`packages/`) when the admin app lands.

## Decided at the architecture level (see docs/11)

- **Datastore:** PostgreSQL + `pgvector` + FTS *(D-008, D-009, D-011)*
- **Media:** object storage + CDN *(D-013)*
- **Shape:** modular monolith; app + workers *(D-007)*
- **Hosting model:** managed PaaS *(D-012)*

## Hero scene runtime (ratified — D-036)

| Concern | Choice | Why |
| --- | --- | --- |
| 3D engine | **three.js via React Three Fiber** (+ minimal drei subset) | Scene graph = component tree (docs/17 §2 maps 1:1); Suspense-native streaming; composes with the React/Zustand stack. ≈220–280 KB gz, inside the ≤350 KB tier budget, lazy after LCP, Tier 1/2 only |
| In-scene tweens | **GSAP** (lazy, inside the scene chunk) | One-shot events on uniforms/props (births, glance, Dex approach, citation traces) — the "reserved for draw-ins" promise landing |
| Camera | Baked Blender rail (`cam_rail.glb`), runtime-scrubbed | Authored cinematography; no tween library re-animates it |
| DOM motion | **Motion** (unchanged) | Hard rule: one property, one owner; GSAP never touches DOM |
| Asset formats | glTF + Draco + KTX2, self-hosted decoders, versioned CDN manifest | Per docs/21 pipeline |

Architecture: [`22-HERO_RUNTIME_ARCHITECTURE.md`](22-HERO_RUNTIME_ARCHITECTURE.md).

## Still to ratify (future sessions)

- **Database access layer / ORM** — with `docs/09-DATABASE_PLAN.md`.
- **LLM provider/model + embedding model** — with the Dex sprint (v1.5); consumed behind an interface per docs/11 §11.
- **Specific PaaS, object-storage, CDN vendors** — with `docs/10-DEPLOYMENT.md`.
- **Auth implementation** (managed vs self-rolled) — with the admin sprint.
- **Markdown pipeline** (renderer, syntax highlighting) — with the posts sprint.
- **Error tracking / analytics tools** — with `docs/10`.
- **Design sign-off on provisional color primitives** (D-028) — the graphite ramp + accent hex live in `apps/web/src/styles/globals.css` tier-1 only.

## Coding standards (in force)

The rules live where engineers see them: [`apps/web/README.md`](../apps/web/README.md) ("The rules that bind this codebase") + docs/15 §6–8 contracts + `07-COMPONENT_GUIDELINES.md` (to be written against the working codebase).
