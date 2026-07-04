# Architecture

> The current architectural understanding of Deepak Labs. Keep this in sync with reality; record the reasoning for changes in [`DECISIONS.md`](DECISIONS.md).

## Current State

The architecture is intentionally minimal. No framework, runtime, or data layer has been chosen. The repository is structured as a monorepo to accommodate future applications and shared packages.

## Structural Model

```
deepak.ai/
├── apps/        # deployable applications (none yet)
├── packages/    # shared libraries (none yet)
├── docs/        # architecture & product docs
├── memory/      # AI context system
├── specs/       # feature specifications
├── prompts/     # reusable AI prompts
├── scripts/     # automation
└── assets/      # static & design assets
```

## Dependency Direction

Applications depend on packages. Packages never depend on applications. Shared logic is extracted into `packages/`.

## Decided

- Monorepo layout (see `D-001`).
- Documentation-first workflow (see `D-002`).

## Undecided (TBD)

- Frontend framework and language
- Backend / services
- Database and data layer (see [`../docs/09-DATABASE_PLAN.md`](../docs/09-DATABASE_PLAN.md))
- AI assistant architecture
- Deployment and infrastructure (see [`../docs/10-DEPLOYMENT.md`](../docs/10-DEPLOYMENT.md))

## References

Detailed technical documentation lives in [`../docs/`](../docs). Decisions are logged in [`DECISIONS.md`](DECISIONS.md).
