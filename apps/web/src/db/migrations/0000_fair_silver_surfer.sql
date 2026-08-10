CREATE TABLE "abandoned_branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"tried" text NOT NULL,
	"why_abandoned" text NOT NULL,
	"learned" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"scheduled_for" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"question" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "content_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"dek" text DEFAULT '' NOT NULL,
	"body_markdown" text DEFAULT '' NOT NULL,
	"reading_minutes" integer,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"problem" text DEFAULT '' NOT NULL,
	"year" integer NOT NULL,
	"project_status" text DEFAULT 'archived' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"repo_url" text
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"authors" text[] DEFAULT '{}'::text[] NOT NULL,
	"venue" text DEFAULT '' NOT NULL,
	"year" integer NOT NULL,
	"abstract" text DEFAULT '' NOT NULL,
	"plain_summary" text DEFAULT '' NOT NULL,
	"pdf_url" text,
	"bibtex" text,
	"doi" text
);
--> statement-breakpoint
CREATE TABLE "relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_id" uuid NOT NULL,
	"to_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"to_type" text NOT NULL,
	"to_slug" text NOT NULL,
	"to_title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY NOT NULL,
	"context" text DEFAULT '' NOT NULL,
	"current" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"summary" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abandoned_branches" ADD CONSTRAINT "abandoned_branches_item_id_content_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_id_content_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_id_content_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_id_content_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relations" ADD CONSTRAINT "relations_from_id_content_items_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relations" ADD CONSTRAINT "relations_to_id_content_items_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_id_content_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_entries" ADD CONSTRAINT "timeline_entries_id_content_items_id_fk" FOREIGN KEY ("id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- D-043 binding conditions (3): reject self-relations + duplicate (from, to, kind) triples
ALTER TABLE "relations" ADD CONSTRAINT "ck_no_self_relation" CHECK (from_id != to_id);
--> statement-breakpoint
ALTER TABLE "relations" ADD CONSTRAINT "uq_relations_from_to_kind" UNIQUE (from_id, to_id, kind);
--> statement-breakpoint
-- D-043 binding conditions (2): LAW-003 CHECK — lifecycle-aware; drafts freely saveable
ALTER TABLE "content_items" ADD CONSTRAINT "ck_published_has_question"
  CHECK (status != 'published' OR (question IS NOT NULL AND question != ''));
--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "ck_published_has_timestamp"
  CHECK (status != 'published' OR published_at IS NOT NULL);
--> statement-breakpoint
-- Performance indexes
CREATE INDEX "idx_ci_type_status"    ON "content_items" (content_type, status);
CREATE INDEX "idx_ci_published_at"   ON "content_items" (published_at DESC NULLS LAST) WHERE status = 'published';
CREATE INDEX "idx_ci_updated_at"     ON "content_items" (updated_at DESC);
CREATE INDEX "idx_ab_item_order"     ON "abandoned_branches" (item_id, sort_order);
CREATE INDEX "idx_rel_from"          ON "relations" (from_id, kind);
CREATE INDEX "idx_rel_to"            ON "relations" (to_id, kind);
CREATE INDEX "idx_projects_featured" ON "projects" (featured) WHERE featured = true;
CREATE INDEX "idx_projects_year"     ON "projects" (year DESC);
CREATE INDEX "idx_timeline_start"    ON "timeline_entries" (start_date DESC);
CREATE INDEX "idx_skills_current"    ON "skills" (current) WHERE current = true;
