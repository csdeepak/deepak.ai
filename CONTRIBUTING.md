# Contributing to Deepak Labs

This document defines the standards and conventions for contributing to Deepak Labs. It applies to human contributors and AI assistants equally. Read it fully before making changes.

---

## Guiding Principle

The repository is the source of truth. If a change is worth making, the reasoning behind it is worth documenting. Never leave the documentation out of sync with the code.

---

## Folder Conventions

- `apps/` — one subdirectory per deployable application.
- `packages/` — one subdirectory per shared library; each is independently documented.
- `docs/` — numbered, ordered architecture and product documents.
- `memory/` — AI-facing context files; keep them current.
- `specs/` — one file per feature specification.
- `prompts/` — one subdirectory per AI tool.
- `scripts/` — automation; each script self-describes its purpose.
- `assets/` — static and design assets, organized by type.

Every top-level directory contains a `README.md` explaining its purpose.

## Naming Conventions

- **Directories:** `kebab-case` (e.g., `admin-dashboard`).
- **Documentation files:** `SCREAMING-KEBAB-CASE.md` for root/memory docs, numbered `NN-NAME.md` in `docs/`, `kebab-case.md` for specs.
- **Code files:** to be defined in `docs/06-TECH_STACK.md` once the stack is chosen (placeholder until then).
- **Components:** `PascalCase` names; see `docs/07-COMPONENT_GUIDELINES.md`.
- **Branches:** see Git Branch Strategy below.

## Component Conventions

Component structure, composition rules, and reuse policy are defined in [`docs/07-COMPONENT_GUIDELINES.md`](docs/07-COMPONENT_GUIDELINES.md). Do not create UI components until that document and the tech stack are finalized.

## Git Branch Strategy

We follow a Git Flow–style model:

| Branch        | Purpose                                                        |
| ------------- | ------------------------------------------------------------- |
| `main`        | Production-ready, always deployable.                          |
| `develop`     | Integration branch for completed work.                        |
| `feature/*`   | New features, branched from `develop`.                        |
| `fix/*`       | Non-urgent bug fixes, branched from `develop`.                |
| `hotfix/*`    | Urgent production fixes, branched from `main`.                |
| `release/*`   | Release stabilization, branched from `develop`.               |

Feature and fix branches merge back into `develop`. Releases and hotfixes merge into both `main` and `develop`.

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>

<optional body>

<optional footer>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

**Examples:**
```
docs(memory): add AI handoff template
chore: initialize repository structure
feat(gallery): add image lightbox
```

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`, with pre-release labels (`-alpha`, `-beta`, `-rc`).

- **MAJOR** — incompatible or product-defining changes.
- **MINOR** — backwards-compatible functionality.
- **PATCH** — backwards-compatible fixes.

Current version: `v0.1.0-alpha`. See [`VERSION.md`](VERSION.md).

## Coding Standards

Detailed coding standards will be defined in `docs/06-TECH_STACK.md` and `docs/07-COMPONENT_GUIDELINES.md` once the stack is selected. Until then:

- Prefer clarity over cleverness.
- Document non-obvious decisions.
- No dead code, no unused placeholders in shipped code.

## Documentation Standards

- Use professional Markdown; no lorem ipsum.
- Keep headings meaningful and templates ready to be filled.
- Do not invent decisions that have not been made — mark them `TBD`.
- Update relevant `docs/`, `memory/`, and `CHANGELOG.md` with every substantive change.

## Pull Request Expectations

- Reference the relevant spec or doc.
- Describe *what* changed and *why*.
- Confirm documentation and `memory/` files are synchronized.
- Ensure the branch follows the branch strategy and commits follow the format above.
- Keep PRs focused and reviewable.

## For AI Assistants

See the AI collaboration rules in [`memory/AI_HANDOFF.md`](memory/AI_HANDOFF.md) and [`memory/MASTER_CONTEXT.md`](memory/MASTER_CONTEXT.md). In short: read context first, update context last, never remove documentation, never change architecture silently.
