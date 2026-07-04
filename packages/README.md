# packages/

Reusable libraries and modules shared across applications in [`apps/`](../apps).

Packages hold code that is meaningfully shared: UI components, utilities, configuration, types, and domain logic. Extracting shared code here keeps applications thin and consistent.

## Conventions

- One subdirectory per package, named in `kebab-case`.
- Each package contains its own `README.md` and a clear, minimal public API.
- Packages must not depend on applications; dependencies flow from apps → packages.

## Status

No packages have been created yet. Package boundaries will emerge as features are specified in `specs/` and the stack is chosen.
