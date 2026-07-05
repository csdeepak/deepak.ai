# apps/web/content/

Reserved for local content during early development (before the database-backed content layer from `docs/09` lands).

Rules:

- Content entering here must satisfy the types in `src/types/content.ts`.
- No fake or lorem data — ever (Sprint 0 rule; Brand §13 "the ventriloquist").
- This directory is a temporary convenience; the system of record becomes PostgreSQL per the architecture (`docs/11` §7).
