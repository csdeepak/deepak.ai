# 09 — Database Plan

> **Status:** Accepted — all three phases complete (Phase 1 schema design,
> Phase 2 migrations + local dev, Phase 3 DB-backed ContentService).
>
> **Decisions made here:** D-043 (convergence — ratified Option B, CTI),
> D-044 (Drizzle ORM — ratified), D-045 (Docker Compose — ratified).
>
> **Governing constraints:** D-007 (modular monolith), D-008 (PostgreSQL single
> system of record — pgvector + FTS, no separate vector DB), D-009 (RAG
> architecture), D-042 (Project spine extension; convergence deferred here).

---

## Table of Contents

1. [Purpose and Governing Constraints](#1-purpose-and-governing-constraints)
2. [THE CONVERGENCE QUESTION — D-042 open item ⟨PENDING RULING⟩](#2-the-convergence-question--d-042-open-item-pending-ruling)
3. [Full Relational Schema](#3-full-relational-schema)
4. [The Cognitive Spine as Schema](#4-the-cognitive-spine-as-schema)
5. [Relations — the Graph as Constrained Data](#5-relations--the-graph-as-constrained-data)
6. [Lifecycle — Draft → Scheduled → Published → Archived](#6-lifecycle)
7. [Search — PostgreSQL FTS](#7-search--postgresql-fts)
8. [Embeddings — pgvector Schema](#8-embeddings--pgvector-schema)
9. [Migration Story — File Content → Database](#9-migration-story)
10. [Tooling Decisions (D-044, D-045)](#10-tooling-decisions)
11. [Runtime Posture — Static-First, File Mode Default](#11-runtime-posture)

---

## 1. Purpose and Governing Constraints

This sprint makes the decade-horizon schema decisions for Deepak Labs. The
database is **additive infrastructure** — it is placed behind the existing
`ContentService` interface so the public site remains statically generated from
file content until the owner explicitly opts in. Nothing in this sprint requires
a running database to build or deploy.

### Governing constraints that are non-negotiable

| Constraint | Source | What it means here |
|-----------|--------|-------------------|
| One Postgres instance covers content + search + vectors | D-008 | No separate Elasticsearch, no Pinecone, no headless CMS — all three live in one managed Postgres |
| Modular monolith | D-007 | The DB is the single datastore; background workers (scheduler, embedder, GitHub sync) run against it on the same Render instance |
| File mode is the permanent floor | D-040 / runtime law | `npm run build` must succeed with zero DB present; CI never touches a database |
| No fake data, ever | LAW-008 | No seeds, no fixtures with invented content; the migration script populates from real content files only |
| Tier 0 sacred | D-040 | The database never puts three.js or client-side fetching into public routes |
| The cognitive spine is structural | LAW-003 / LAW-004 | `question` and `abandoned_branches` are schema concerns, not optional CMS fields |
| The graph is generated from relations, never drawn | LAW-005 | Relations are rows; the graph is a query result |

---

## 2. The Convergence Question — D-043 ⟨Ratified: Option B⟩

D-042 explicitly deferred this question to this sprint: **does everything become
a `Memory`, or do content types stay separate with a shared spine?**

The docs/26 ontology asserts:
- Projects = Conclusions / deployments
- Publications = Crystallized ideas
- Posts = Reflections
- Failures = Abandoned branches
- Timeline = Consolidation history
- Skills = Procedural memory

These are **semantic meanings** (what each type *is* in the living memory
metaphor), not structural mandates. The question is whether the *schema*
enforces this unification or expresses it through a shared spine with type-
specific fields.

The current codebase has two co-existing models:

**Model A — Content types** (`src/types/content.ts`): `Project`, `Publication`,
`Post`, `TimelineEntry`, `Skill` each extend `ContentBase`. Rich type-specific
fields. The cognitive spine was added additively in D-042 (`question`,
`abandonedBranches`).

**Model B — Memory** (`src/features/memory/types.ts`): `Memory` has a full
`stages: ReconstructionStage[]` lifecycle array (question → hypothesis →
research → experiments → failures → iterations → architecture → results →
publication → future), a `gist` (the 90-second fast path), and `dex: DexRecall[]`
entries. This model exists today as the reconstruction format for the `/memory`
vertical slice (ASMOS).

### Option A — Unified Memory model

Every content item is stored as a `Memory`. A single `memories` table holds
all types via a `kind` discriminator. Type-specific fields live in JSONB or
nullable columns.

**Trade-offs:**

| | |
|-|-|
| ✅ | Perfectly mirrors the docs/26 ontology — the schema *is* the metaphor |
| ✅ | One table; admin editor is naturally universal (one write path) |
| ✅ | Dex/RAG reads one table; future embedding sync is simpler |
| ✅ | Every artifact gains the full cognitive spine by construction (question, stages, abandoned_branches) |
| ❌ | Type-specific constraints (venue NOT NULL for publications, org NOT NULL for timeline entries) cannot be column-level enforced — they migrate to application logic |
| ❌ | Schema sprawl: a Skill has `current: boolean`; a Publication has `authors, venue, bibtex, doi`. Under a single table these become nullable columns or JSONB opacity |
| ❌ | The 10-stage Memory model is expensive for simple artifacts: a Dart incrementor app from a 2023 course does not have a hypothesis, experiments, or results stage. Forcing the full stages model on 18 projects makes the admin update loop slower, not faster ��� violating the ≤10-minute update doctrine |
| ❌ | Migration risk: flattening the existing file content into a unified model requires mapping publication-specific fields to nullable positions — high impedance mismatch |

### Option B — Shared spine, separate type tables ⟨RECOMMENDED⟩

A `content_items` base table carries the shared cognitive spine (question,
published_at, status, search_vector). Each content type has its own child table
(`projects`, `publications`, `posts`, `timeline_entries`, `skills`) joined via
the same `id`. The `abandoned_branches` and `stages` tables attach to
`content_items.id` and are **optional** — a project with no abandoned branches
returns an empty set; an ASMOS-depth memory fills all stages.

**Trade-offs:**

| | |
|-|-|
| ✅ | Direct mirror of the TypeScript type hierarchy — migration from file content is zero-impedance |
| ✅ | Type-specific constraints enforced at the column level |
| ✅ | The cognitive spine (question, abandoned_branches, stages) is on the BASE table — all types gain it without requiring them to fill every stage |
| ✅ | Simple artifacts (course projects) need only question + problem; deep artifacts (ASMOS) can fill all 10 stages — the same schema serves both |
| ✅ | Admin editor renders the base fields for all types, then appends type-specific fields — the Universal Content Editor pattern from docs/24 Part 11 is exactly this |
| ✅ | Separate per-type indexes, no column-sprawl nullables |
| ❌ | Queries joining type-specific tables need a JOIN — one extra level of indirection |
| ❌ | Adding a new content type requires a new table migration (not just a new kind value) |

### Recommendation: Option B

**Recommendation: Option B — Shared spine, separate type tables.** Pending
owner ratification as D-043.

The decisive argument is **the one-maintainer decade-horizon boring-technology
principle**: a unified Memory model is conceptually elegant but operationally
complex. Column sprawl or JSONB opacity compounds silently over years. Option
B keeps every table's contract clear and typed, with the cognitive spine
enforced at the base level so no type escapes it.

Critically, **the Living Memory metaphor is preserved in full** under Option B
through three mechanisms:

1. **The cognitive spine in `content_items`:** every row — regardless of type —
   carries `question` (LAW-003) and can have `abandoned_branches` (LAW-004).
   The semantic meaning (this is a conclusion, this is a crystallized idea) is
   expressed in the `content_type` field and the `stages` table.

2. **The `stages` table (optional, all types):** any content item can have an
   ordered stages array (`question → hypothesis → experiments → failures →
   iterations → architecture → results → publication → future`). ASMOS fills
   all 10. A course project might fill only `question`. The schema makes no
   judgment; the content honesty laws do.

3. **The relations table IS the semantic memory (LAW-005):** the knowledge graph
   — Projects linked to Publications via `implements`, Posts to Projects via
   `writes-about`, Timeline entries to artifacts via `produced` — is the
   associative structure of the mind. This lives in the relations table, and it
   works identically under both convergence options. The graph is the memory;
   the table structure is implementation detail.

**The key principle:** the docs/26 ontology assigns semantic meaning to content
types; it does not require them to be structurally identical. A Publication is
a crystallized idea *and* has `venue`, `authors`, `bibtex`. A Skill is
procedural memory *and* has `current: boolean`. These distinctions are
features, not schema violations.

⟨D-043 ratified 2026-07-11: Option B. Three binding conditions logged in D-043 entry.⟩

---

## 3. Full Relational Schema

*Designed against Option B. If Option A is ratified, the base table absorbs the
type-specific columns as nullables; all other tables are unchanged.*

### 3.1 The base spine — `content_items`

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "vector";    -- pgvector (D-008 / D-009)

CREATE TABLE content_items (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            text        NOT NULL,
  title           text        NOT NULL,
  content_type    text        NOT NULL,

  -- Lifecycle (§6)
  status          text        NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  scheduled_for   timestamptz,  -- future publish (scheduler picks up status='scheduled')
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- Cognitive spine (LAW-003)
  -- Required on publish (enforced by application; schema allows empty while draft)
  question        text        NOT NULL DEFAULT '',

  -- Honesty flag (LAW-008)
  -- verified:false beats an invented metric; never fabricate a settled result
  verified        boolean     NOT NULL DEFAULT false,

  -- Full-text search vector (D-011, §7)
  -- Trigger keeps this current on title/question changes
  search_vector   tsvector    GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(question, '')
    )
  ) STORED,

  CONSTRAINT uq_content_items_slug UNIQUE (slug),
  CONSTRAINT ck_content_type CHECK (content_type IN (
    'project', 'publication', 'post', 'timeline_entry',
    'skill', 'gallery_item', 'news_item', 'document', 'page'
  )),
  CONSTRAINT ck_status CHECK (status IN (
    'draft', 'scheduled', 'published', 'archived'
  )),
  -- A published item must have a question (LAW-003)
  CONSTRAINT ck_published_has_question CHECK (
    status != 'published' OR (question IS NOT NULL AND question != '')
  ),
  -- A published item must have a publish timestamp
  CONSTRAINT ck_published_has_timestamp CHECK (
    status != 'published' OR published_at IS NOT NULL
  )
);

CREATE INDEX idx_ci_type_status   ON content_items (content_type, status);
CREATE INDEX idx_ci_published_at  ON content_items (published_at DESC NULLS LAST)
  WHERE status = 'published';
CREATE INDEX idx_ci_search        ON content_items USING GIN (search_vector);
CREATE INDEX idx_ci_updated_at    ON content_items (updated_at DESC);
```

### 3.2 Abandoned branches — `abandoned_branches` (LAW-004)

```sql
CREATE TABLE abandoned_branches (
  id            uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id       uuid  NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  tried         text  NOT NULL,
  why_abandoned text  NOT NULL,
  learned       text  NOT NULL,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_abandoned_branches_item ON abandoned_branches (item_id, sort_order);
```

### 3.3 Reconstruction stages — `content_stages` (the cognitive lifecycle)

An optional ordered sequence of lifecycle stages for any content item. ASMOS
fills all 10; a simple project might fill only `question` and `failures`.

```sql
CREATE TYPE stage_kind AS ENUM (
  'question', 'hypothesis', 'research', 'experiments',
  'failures', 'iterations', 'architecture',
  'results', 'publication', 'future'
);

CREATE TYPE fragment_state AS ENUM (
  'settled',       -- final, honest knowledge
  'in-progress',   -- actively being developed
  'unformed'       -- real but not yet documented (LAW-008: honest gap)
);

CREATE TABLE content_stages (
  id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id     uuid         NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  stage_kind  stage_kind   NOT NULL,
  label       text         NOT NULL,
  state       fragment_state NOT NULL DEFAULT 'unformed',
  body        text[]       NOT NULL DEFAULT '{}',    -- ordered paragraphs
  sort_order  integer      NOT NULL DEFAULT 0,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (item_id, stage_kind)
);

-- Stage items (experiments, failures — each stage can have named sub-items)
CREATE TYPE item_outcome AS ENUM ('worked', 'failed', 'partial');

CREATE TABLE stage_items (
  id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_id    uuid         NOT NULL REFERENCES content_stages(id) ON DELETE CASCADE,
  title       text         NOT NULL,
  note        text         NOT NULL DEFAULT '',
  outcome     item_outcome,
  sort_order  integer      NOT NULL DEFAULT 0
);

CREATE INDEX idx_content_stages_item ON content_stages (item_id, sort_order);
CREATE INDEX idx_stage_items_stage   ON stage_items (stage_id, sort_order);
```

### 3.4 Type-specific tables

Each joins `content_items` via the same `id` (class-table inheritance pattern).

```sql
-- ── Projects ───────────────────────────────────────────────────────────────��
CREATE TABLE projects (
  id              uuid    PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  problem         text    NOT NULL DEFAULT '',
  year            integer NOT NULL,
  project_status  text    NOT NULL DEFAULT 'archived',
  tags            text[]  NOT NULL DEFAULT '{}',
  featured        boolean NOT NULL DEFAULT false,
  repo_url        text,
  CONSTRAINT ck_project_status CHECK (project_status IN ('active', 'archived'))
);

CREATE INDEX idx_projects_featured ON projects (featured) WHERE featured = true;
CREATE INDEX idx_projects_year     ON projects (year DESC);

-- ── Publications ─────────────────────────────────────────────────────────────
CREATE TABLE publications (
  id            uuid    PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  authors       text[]  NOT NULL DEFAULT '{}',
  venue         text    NOT NULL DEFAULT '',
  year          integer NOT NULL,
  abstract      text    NOT NULL DEFAULT '',
  plain_summary text    NOT NULL DEFAULT '',
  pdf_url       text,
  bibtex        text,
  doi           text
);

CREATE INDEX idx_publications_year ON publications (year DESC);

-- ── Posts ─────────────────────────────────────────────────────────────────────
-- Body is stored as Markdown; rendered server-side at build / ISR time (no DB
-- reads in the browser per the runtime posture §11).
CREATE TABLE posts (
  id              uuid    PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  dek             text    NOT NULL DEFAULT '',
  body_markdown   text    NOT NULL DEFAULT '',
  reading_minutes integer,   -- computed from body_markdown at save time
  tags            text[]  NOT NULL DEFAULT '{}'
);

-- FTS on posts also covers the body; extend the trigger in §7 for post bodies.

-- ── Timeline entries ─────────────────────────────────────────────────────────
CREATE TABLE timeline_entries (
  id           uuid PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  organization text NOT NULL DEFAULT '',
  role         text NOT NULL DEFAULT '',
  start_date   date NOT NULL,
  end_date     date,   -- NULL = current position
  summary      text NOT NULL DEFAULT ''
);

CREATE INDEX idx_timeline_start ON timeline_entries (start_date DESC);

-- ── Skills ───────────────────────────────────────────────────────────────────
CREATE TABLE skills (
  id      uuid    PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  context text    NOT NULL DEFAULT '',
  current boolean NOT NULL DEFAULT false
);

CREATE INDEX idx_skills_current ON skills (current) WHERE current = true;

-- ── Gallery items ─────────────────────────────────────────────────────────────
-- Media originals are in S3-compatible object storage (D-013); only the
-- reference and metadata live here.
CREATE TABLE gallery_items (
  id          uuid  PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
  media_key   text  NOT NULL,  -- S3 key (no full URL �� base URL is env config)
  alt_text    text  NOT NULL DEFAULT '',
  caption     text  NOT NULL DEFAULT '',
  width       integer,
  height      integer
);
```

### 3.5 Version history — `content_versions`

Full snapshot on every save. Supports diff + restore (docs/24 Part 11 CMS).

```sql
CREATE TABLE content_versions (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id     uuid    NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  version_num integer NOT NULL,
  -- Full snapshot of content_items row + type-specific row at save time
  snapshot    jsonb   NOT NULL,
  changed_by  text    NOT NULL DEFAULT 'admin',
  change_note text    NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, version_num)
);

CREATE INDEX idx_content_versions_item ON content_versions (item_id, version_num DESC);
```

### 3.6 Site settings — `site_settings`

Owner-managed key-value pairs (outbound links, CV URL, contact email, etc.).
Managed through the admin settings UI (docs/24 §11.7).

```sql
CREATE TABLE site_settings (
  key        text  PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 3.7 Auth (D-014 skeleton)

One admin identity now; schema is RBAC-future-ready.

```sql
CREATE TABLE users (
  id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  email      text  NOT NULL UNIQUE,
  role       text  NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_role CHECK (role IN ('admin', 'viewer'))  -- viewer = future read-only
);

-- Session tokens (stateless JWT is the default; this table is for server-side
-- session revocation if ever needed)
CREATE TABLE sessions (
  id         uuid  DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text  NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 3.8 GitHub cache (D-010)

```sql
CREATE TABLE github_cache (
  repo_full_name text PRIMARY KEY,  -- "csdeepak/ASMOS"
  data           jsonb NOT NULL,    -- raw GitHub API response cached
  synced_at      timestamptz NOT NULL DEFAULT now(),
  etag           text               -- for conditional GET
);
```

---

## 4. The Cognitive Spine as Schema

The three constitutional constraints map directly to the schema:

| Law | Schema mechanism |
|-----|-----------------|
| **LAW-003** — every artifact answers "what question created me?" | `content_items.question text NOT NULL` + CHECK constraint enforcing non-empty on publish |
| **LAW-004** — every conclusion exposes abandoned branches | `abandoned_branches` table, foreign-keyed to `content_items.id`, returns empty set (graceful absence) when no rows exist |
| **LAW-005** — the graph is generated from relations, never drawn by hand | `relations` table (§5); the graph is a query result, never a hand-authored JSON blob |
| **LAW-008** — honesty over completeness | `content_items.verified boolean DEFAULT false`; `content_stages.state fragment_state DEFAULT 'unformed'`; stages and abandoned_branches are absent (not fabricated) until real |

The `content_stages` table implements the full cognitive lifecycle as *optional*
first-class data. A project fills only the stages it genuinely has. `state =
'unformed'` is the honest representation of "real but not yet documented" —
never a fabricated result.

The `content_items.verified` flag is the schema-level enforcement of LAW-008's
"`verified: false` beats an invented metric." All items start unverified; the
admin sets `verified = true` when the content is independently confirmed.

---

## 5. Relations — the Graph as Constrained Data

The knowledge graph IS the semantic memory (LAW-005). Relations are rows, never
hand-authored adjacency lists.

```sql
CREATE TYPE relation_kind AS ENUM (
  'implements',    -- project → publication
  'writes-about',  -- post → project | publication
  'produced',      -- timeline_entry → any artifact
  'evidences',     -- skill → project | publication | post
  'depicts',       -- gallery_item → any
  'references'     -- any → any (use sparingly — never the default)
);

CREATE TABLE relations (
  id        uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  from_id   uuid          NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  to_id     uuid          NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  kind      relation_kind NOT NULL,
  -- Denormalized for display without join (graph queries read these hot)
  to_type   text          NOT NULL,
  to_slug   text          NOT NULL,
  to_title  text          NOT NULL,
  created_at timestamptz  NOT NULL DEFAULT now(),
  UNIQUE (from_id, to_id, kind),
  -- No self-relations
  CONSTRAINT ck_no_self_relation CHECK (from_id != to_id)
);

CREATE INDEX idx_relations_from ON relations (from_id, kind);
CREATE INDEX idx_relations_to   ON relations (to_id, kind);
```

**Bidirectional traversal:** The admin editor creates relations in both
directions (e.g., adding `implements` from project → publication also adds a
`references` edge from publication → project for the "implemented by →" trail).
This is an application concern, not a trigger — keeps the schema clean and
the application explicit.

**Adding a relation kind:** requires a new D-entry per D-021 (closed taxonomy
rule). The ENUM migration is a single `ALTER TYPE ... ADD VALUE` statement.

---

## 6. Lifecycle

### Status state machine

```
draft ──────────────────────────────► published
  │                                      │
  ├──► scheduled ─��► [clock tick] ──►    │
  │                                      │
  └──��───────────────────────────────► archived
```

The scheduler is a Render Cron job (1-minute tick) that runs:
```sql
UPDATE content_items
SET status = 'published', published_at = now()
WHERE status = 'scheduled' AND scheduled_for <= now();
```
This is the only write path outside the admin; it is idempotent and safe to
re-run.

### Publish constraints (enforced in schema and application)

Before a `content_items` row may move to `published`:
1. `question` is non-empty (LAW-003 — enforced by the CHECK constraint in §3.1)
2. `published_at` is set (also CHECK-constrained)
3. All `content_stages` with `state = 'in-progress'` or `state = 'unformed'`
   that would publicly render are owner-acknowledged (application check, not
   schema — the schema stores state; the admin UI warns and requires acknowledgment)

### Version history

Every save to `content_items` or a type-specific table triggers a version entry
in `content_versions`. The snapshot is a JSONB merge of the base row + type
row at save time. Restore = read snapshot + re-apply rows. Diff = application-
level text diff of `snapshot.question`, `snapshot.problem`, etc.

---

## 7. Search — PostgreSQL FTS

D-011: Postgres FTS first, behind a swappable `SearchIndex` interface.

### `tsvector` column strategy

`content_items.search_vector` is a `GENERATED ALWAYS AS ... STORED` column
covering `title` and `question` — two fields available on all content types.

Each type-specific table extends search coverage via a trigger-maintained
`search_ext` tsvector on its table, then a view joins them:

```sql
-- Posts: add the body to the search corpus
ALTER TABLE posts ADD COLUMN search_ext tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(dek, '') || ' ' || coalesce(body_markdown, ''))
) STORED;
CREATE INDEX idx_posts_search_ext ON posts USING GIN (search_ext);

-- Publications: add abstract and plain_summary
ALTER TABLE publications ADD COLUMN search_ext tsvector GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(abstract, '') || ' ' || coalesce(plain_summary, ''))
) STORED;
CREATE INDEX idx_publications_search_ext ON publications USING GIN (search_ext);
```

The `SearchService` queries both columns with `||` and ranks results by
`ts_rank_cd`. The interface returns ranked `ContentBase` results; the backing
store is swappable (D-011).

### Query pattern

```sql
SELECT
  ci.id, ci.slug, ci.title, ci.content_type, ci.published_at,
  ts_rank_cd(ci.search_vector, query) AS rank
FROM content_items ci,
     to_tsquery('english', $1) query
WHERE ci.status = 'published'
  AND ci.search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

---

## 8. Embeddings — pgvector Schema

D-009: RAG with pgvector. Schema designed here; implementation deferred to the
Dex sprint (P1, after corpus exists — D-004).

### Design principles

- Long-form content (posts, publication abstracts, memory stages) is chunked
  (≤512 tokens per chunk); short items (skills, project one-liners) are a
  single chunk
- Every chunk knows its source item, chunk index, and the model that generated it
- Sync status tracks the embedding pipeline: `synced` / `pending` / `stale`
- `pending` = new content not yet embedded; `stale` = source content changed
  since the last embedding run (triggered by `content_items.updated_at` advancing)

```sql
CREATE TABLE embeddings (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id     uuid    NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  -- Chunk index 0 = the item's title + question (the fast-path summary)
  -- Chunk index 1+ = slices of the body / stage content
  chunk_index integer NOT NULL DEFAULT 0,
  chunk_text  text    NOT NULL,   -- the actual text that was embedded
  -- 1536 = text-embedding-3-small (OpenAI) or compatible Anthropic embedding
  -- The dimension is config; the column accepts NULL until embeddings are generated
  embedding   vector(1536),
  model       text    NOT NULL DEFAULT '',
  sync_status text    NOT NULL DEFAULT 'pending',
  synced_at   timestamptz,
  UNIQUE (item_id, chunk_index),
  CONSTRAINT ck_sync_status CHECK (
    sync_status IN ('synced', 'pending', 'stale')
  )
);

CREATE INDEX idx_embeddings_item   ON embeddings (item_id);
CREATE INDEX idx_embeddings_sync   ON embeddings (sync_status) WHERE sync_status != 'synced';
-- IVFFlat index for ANN search (created after the first batch of embeddings exists)
-- CREATE INDEX idx_embeddings_vector ON embeddings
--   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

The IVFFlat index is commented out here and applied via a migration once the
first real embeddings exist (the index requires data to train the centroids).

### Re-embedding trigger

The event-driven re-embedding hook (D-009) marks embeddings stale on content
change:

```sql
CREATE OR REPLACE FUNCTION mark_embeddings_stale()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE embeddings
  SET sync_status = 'stale'
  WHERE item_id = NEW.id AND sync_status = 'synced';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_updated_stale
AFTER UPDATE OF title, question ON content_items
FOR EACH ROW EXECUTE FUNCTION mark_embeddings_stale();
```

The background worker polls `WHERE sync_status IN ('pending', 'stale')` on a
schedule, calls the embedding API, and updates `embedding`, `model`,
`sync_status = 'synced'`, `synced_at = now()`.

---

## 9. Migration Story

### Principles

- Real content only — zero seed data, zero invented fields
- The 18 draft projects in `content/site.ts` migrate byte-faithfully
- Idempotent and re-runnable: `ON CONFLICT (slug) DO UPDATE` or `DO NOTHING`
- Empty stays empty: `question: ""` in the file → `question: ''` in the DB
- The migration script is a TypeScript file in `scripts/` that imports from
  `content/site.ts` directly

### Script: `scripts/db-ingest.ts`

```
Input:  apps/web/content/site.ts  (projects, publications, posts, timeline, skills, siteContent)
Output: Rows in content_items + type-specific tables
Mode:   Upsert (ON CONFLICT slug DO UPDATE) — safe to re-run
```

The script:
1. Reads each export from `content/site.ts`
2. For each project: INSERT into `content_items` (type='project', question from
   file), then INSERT into `projects` (problem, year, tags, featured, etc.),
   then INSERT into `abandoned_branches` rows if any
3. Does NOT insert stages (stages are the richer reconstruction model; the
   current content files do not have stages data — they stay empty in the DB
   until the owner populates them via the admin)
4. For `siteContent` settings (outbound links, contactEmail, etc.): upserts
   into `site_settings` as individual key-value rows

### Row counts expected after ingest

| Table | Expected rows |
|-------|--------------|
| `content_items` (type='project') | 18 |
| `projects` | 18 |
| `abandoned_branches` | 0 (none filled yet — correct, LAW-008) |
| `content_items` (other types) | 0 (no other content yet) |
| `content_stages` | 0 |
| `embeddings` | 0 (populated by the Dex sprint) |

Verify after ingest:
```sql
SELECT content_type, count(*) FROM content_items GROUP BY content_type;
-- Expected: project | 18

SELECT count(*) FROM projects;
-- Expected: 18

SELECT count(*) FROM abandoned_branches;
-- Expected: 0 (all projects have abandonedBranches omitted �� correct)
```

---

## 10. Tooling Decisions

### D-044 — Data-access tool: Drizzle ORM ⟨Proposed⟩

**Decision:** Use **Drizzle ORM** as the data-access layer.

**Rationale:**

| Criterion | Drizzle | Prisma | Raw SQL | TypeORM |
|-----------|---------|--------|---------|---------|
| TypeScript-native schema | ✅ schema defined in TS | ❌ separate .prisma DSL | ❌ | ✅ decorators |
| Queries look like SQL | ✅ "just SQL with types" | ❌ own query API | ✅ | ❌ |
| Migration files are plain SQL | ✅ generates readable .sql | ❌ generates a binary | ✅ | ✅ |
| Edge runtime compatible | ✅ | ⚠️ (edge client) | ✅ | ❌ |
| Maintenance burden (1 dev, 10yr) | Low | Medium | High (manual query types) | High (decorator magic) |
| pgvector support | ✅ `drizzle-orm/pg-core` + extension | ✅ `@prisma/extension-pgvector` | ✅ | ❌ |

Drizzle is the boring, low-magic choice that remains readable and maintainable
without a thick abstraction. Queries are written once, read many times over a
decade; Drizzle's SQL-like syntax makes them self-documenting. Prisma's
runtime magic (the client, the query engine binary, the `schema.prisma` DSL)
compounds maintenance cost silently.

**Package:** `drizzle-orm` + `drizzle-kit` (migrations CLI) + `pg` (native
Postgres driver).

### D-045 — Local dev database: Docker Compose ⟨Proposed⟩

**Decision:** A `docker-compose.dev.yml` at the repo root with a single
PostgreSQL service (with pgvector). **Optional** — frontend-only work requires
zero DB; the file-content path is always the default.

```yaml
# docker-compose.dev.yml
services:
  db:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_DB: deepak_labs_dev
      POSTGRES_USER: deepak
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
volumes:
  db_data:
```

Start DB: `docker compose -f docker-compose.dev.yml up -d`
Run migrations: `npm run db:migrate`
Ingest content: `npm run db:ingest`

The `.env.example` gains:
```
# Database (optional — file-content mode is the default when unset)
DATABASE_URL=postgresql://deepak:devpassword@localhost:5432/deepak_labs_dev
CONTENT_SOURCE=file   # 'file' | 'db'
```

CI runs with `CONTENT_SOURCE=file` (no DB needed — build stays green).

---

## 11. Runtime Posture

### Static-first, file mode default

The public site is always **statically generated at build time**. There is no
server-side database read during a page request on public routes. The database
serves two purposes:

1. **At build time (SSG/ISR):** the DB-backed `ContentService` implementation
   is called during `generateStaticParams` and page rendering — same as the
   current file-backed implementation. The output is identical static HTML.

2. **At admin runtime (authenticated, server-only):** the admin CMS reads and
   writes through the DB. Public routes are never affected by admin write
   failures (separate concerns — D-038 single-writer law).

### Source selection

```typescript
// src/services/index.ts
import { localContent }  from './local-content';   // file mode (current)
import { dbContent }     from './db-content';       // DB mode (Phase 3)

export const contentService =
  process.env.CONTENT_SOURCE === 'db'
    ? dbContent
    : localContent;
```

`CONTENT_SOURCE` is an environment variable. Default is `file`. The CI
environment never sets it, so `npm run build` succeeds with no DB present.

### Three.js stays out

The database introduces zero new client-side dependencies. Public routes are
statically rendered; the DB client (`drizzle-orm` + `pg`) runs server-only
and is never in any route's client bundle. The three.js First Load JS guard
(CI workflow) is unaffected.

### Render deployment implications (D-041)

The `render.yaml` already has a commented Postgres stub. When the DB sprint
ships:
1. Uncomment the `databases:` block in `render.yaml`
2. Add `DATABASE_URL` to Render's environment group
3. Add a pre-deploy hook: `npm run db:migrate`
4. Set `CONTENT_SOURCE=db` in the Render web service environment

No host migration. No runtime model change. This is the documented path in
`docs/10` §7.

---

## Summary — What Phase 2 and 3 need from Phase 1

Phase 2 (implementation) requires:
- Owner's convergence ruling (D-043) — **waiting**
- Migration tooling: `drizzle-kit init` + the schema file (from §3 above)
- `docker-compose.dev.yml` (from §10)
- `scripts/db-ingest.ts` populating from `content/site.ts`

Phase 3 (DB-backed ContentService) requires:
- Phase 2 complete and clean
- `src/services/db-content.ts` implementing the `ContentService` interface
  using Drizzle queries
- Source selection via `CONTENT_SOURCE` env var
- Typecheck + build green in file mode; identical output in DB mode

⟨All three phases complete. CONTENT_SOURCE=db activates the DB-backed path.⟩
