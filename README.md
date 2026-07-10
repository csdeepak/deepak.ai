# Deepak Labs

> A Personal Operating System — research, engineering, publications, projects, and an AI assistant, unified into a single long-term product.

---

## What This Project Is

**Deepak Labs** is not a conventional portfolio website. It is a long-lived product: a *Personal Operating System* that presents and connects my research, engineering work, publications, projects, professional experience, a personal AI assistant, and a personal knowledge platform.

It is designed to be built, maintained, and extended over many years — by future developers and by AI assistants — using this repository as the single source of truth.

## Project Vision

To build a durable, self-documenting platform where every piece of my professional and intellectual output lives in one coherent system, navigable by humans and machines alike, and continuously improvable without loss of context.

See [`docs/01-VISION.md`](docs/01-VISION.md) for the full vision.

## High-Level Architecture

The architecture is intentionally undecided at this stage. The repository is structured as a monorepo to accommodate multiple applications and shared packages as they are defined.

```
apps/       → deployable applications
packages/   → shared libraries and modules
docs/       → architecture and product documentation
memory/     → long-term context for AI assistants
specs/      → feature specifications
prompts/    → reusable prompts per AI tool
scripts/    → automation and tooling
assets/     → static and design assets
```

Architectural decisions will be recorded in [`memory/DECISIONS.md`](memory/DECISIONS.md) and detailed in [`docs/`](docs/) as they are made.

## Repository Layout

| Path         | Purpose                                                        |
| ------------ | ------------------------------------------------------------- |
| `apps/`      | Individual deployable applications.                            |
| `packages/`  | Reusable code shared across apps.                             |
| `docs/`      | Vision, product, design, and technical documentation.         |
| `memory/`    | Persistent project context for AI collaborators.              |
| `specs/`     | Feature-level specifications.                                  |
| `prompts/`   | Curated prompts organized by AI tool.                        |
| `scripts/`   | Build, automation, and maintenance scripts.                  |
| `assets/`    | Images, fonts, and design assets.                            |

## Development Philosophy

- **The repository is the source of truth.** Every important decision is documented before or as it is made.
- **Documentation before implementation.** We plan and specify, then build.
- **Continuity of context.** Any human or AI assistant can resume work by reading the documentation.
- **Enterprise discipline for a personal product.** Conventions, versioning, and review standards apply even to solo work.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the standards that make this possible.

## Roadmap

The high-level plan and phased milestones live in [`ROADMAP.md`](ROADMAP.md).

## Current Status

- **Phase:** V2 implementation — Tier 0 landing release-ready
- **Version:** see [`VERSION.md`](VERSION.md)
- **Next:** owner content fill → first production deploy

Live status is tracked in [`memory/CURRENT_STATE.md`](memory/CURRENT_STATE.md).

## Local development

Run everything from the repository root (npm workspaces):

```bash
npm install
npm run dev         # start the web app (apps/web)
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

## Deployment

Hosting is a managed PaaS — **Render** (primary recommendation, pending
owner ratification: D-041). The full plan, vendor comparison, environments,
CI, caching, and rollback story live in
[`docs/10-DEPLOYMENT.md`](docs/10-DEPLOYMENT.md). Infrastructure is declared
as code in [`render.yaml`](render.yaml); CI (typecheck + build + a three.js
First-Load guard) is [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

**Before the first deploy**, clear every gate in
[`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) (content fill, R4 copy tests,
the real ASMOS memory, and look-dev sign-off).

**First deploy — the exact steps the owner runs (once the gates pass):**

1. Confirm CI is green on `main` (typecheck + build + three.js guard).
2. In Render: **New → Blueprint**, select this repository. Render reads
   `render.yaml` and shows the planned `deepak-labs-web` service — review it.
3. **Apply / Deploy** — this manual click is the first production deploy
   (nothing deploys on your behalf before this).
4. Add the custom domain and DNS records per `docs/10-DEPLOYMENT.md` §2;
   wait for TLS to be issued.
5. Smoke-test production: `/` renders with the headline as LCP, nav/footer
   have no dead links, `/memory` reconstructs, the theme toggle works, and
   `/dev/hero` returns 404.
6. Flip `autoDeploy: false → true` in `render.yaml` (and enable the CI
   status check as a required branch-protection gate) to turn on
   deploy-on-`main`.

The database, background workers, and secrets are **not** part of this
deploy — they are added to the same `render.yaml` when the database sprint
(docs/09) lands, without changing hosts (docs/10 §7).

## How to Approach This Project

1. Read [`memory/MASTER_CONTEXT.md`](memory/MASTER_CONTEXT.md) first — always.
2. Review [`memory/CURRENT_STATE.md`](memory/CURRENT_STATE.md) to understand where things stand.
3. Read the relevant `docs/` and `specs/` before touching anything.
4. Follow the conventions in [`CONTRIBUTING.md`](CONTRIBUTING.md).
5. Update the `memory/` files and [`CHANGELOG.md`](CHANGELOG.md) when you finish.

> Setup instructions are intentionally omitted until a framework and tech stack are chosen.
