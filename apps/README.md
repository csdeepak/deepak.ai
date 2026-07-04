# apps/

Deployable applications that make up Deepak Labs.

Each application lives in its own subdirectory and is independently buildable and deployable. The monorepo layout allows multiple front-ends, services, or tools to share code from [`packages/`](../packages).

## Conventions

- One subdirectory per application, named in `kebab-case`.
- Each app contains its own `README.md` describing purpose, ownership, and how it relates to the rest of the system.
- Apps consume shared logic from `packages/` rather than duplicating it.

## Status

No applications have been created yet. The tech stack and app boundaries will be defined in [`docs/06-TECH_STACK.md`](../docs/06-TECH_STACK.md) and relevant `specs/`.
