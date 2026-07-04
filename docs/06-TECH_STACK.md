# 06 — Tech Stack

> Status: **Awaiting ratification.** The [System Architecture Document](11-SYSTEM_ARCHITECTURE.md) has decided the architecture and datastore; this document ratifies the concrete framework/vendor selections during the Technical Foundation phase. Do not implement until ratified here.

## Overview

_Summary of the chosen technologies and why. The architecture (`docs/11`) constrains these choices to their required capabilities; this document names the specific products. TBD until Technical Foundation phase._

## Decided at the architecture level (see `docs/11`)

- **Primary datastore:** PostgreSQL (relational system of record) with `pgvector` and full-text search. *(D-008, D-009, D-011)*
- **Media:** object storage + CDN. *(D-013)*
- **Shape:** modular monolith; app tier + background workers. *(D-007)*
- **Hosting model:** managed PaaS + managed services. *(D-012)*

## To be ratified here (Appendix B of `docs/11`)

- Concrete full-stack framework and language (must support hybrid SSR/SSG + an integrated server layer).
- Specific LLM provider/model and embedding model.
- Specific PaaS, object-storage, and CDN vendors.
- Auth implementation (managed provider vs. self-rolled).
- Error-tracking, logging, and analytics tools.

## Frontend

_Framework, language, styling approach. TBD._

## Backend / Services

_Runtime, frameworks, APIs. TBD._

## Data Layer

_Database and data access. See [`09-DATABASE_PLAN.md`](09-DATABASE_PLAN.md). TBD._

## AI / ML

_Models and providers for the AI assistant and related features. TBD._

## Tooling

_Package manager, monorepo tooling, linting, formatting, testing. TBD._

## Coding Standards

_Language-specific standards, once the stack is chosen. TBD._

## Rationale & Trade-offs

_Why these choices were made; alternatives considered. Record decisions in [`../memory/DECISIONS.md`](../memory/DECISIONS.md). TBD._
