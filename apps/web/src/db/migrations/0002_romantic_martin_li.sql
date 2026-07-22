CREATE TABLE "content_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"alt_text" text,
	"caption" text DEFAULT '' NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "overview" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "start_date" date;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "end_date" date;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "context" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "collaborators" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "video_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "outcomes" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "skills_learned" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "pub_date" date;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "pub_status" text DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "arxiv_url" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "category" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "since_year" integer;--> statement-breakpoint
ALTER TABLE "timeline_entries" ADD COLUMN "place" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "timeline_entries" ADD COLUMN "highlights" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "content_links" ADD CONSTRAINT "content_links_item_id_content_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_item_id_content_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_media" ADD CONSTRAINT "content_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
-- D-049 constraints not expressible in the Drizzle schema (docs/28 §2.1/§2.2):
-- alt_text is required for images (accessibility is honesty, LAW-008)
ALTER TABLE "media" ADD CONSTRAINT "ck_image_has_alt" CHECK ("kind" <> 'image' OR ("alt_text" IS NOT NULL AND "alt_text" <> ''));--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "ck_media_kind" CHECK ("kind" IN ('image','pdf'));--> statement-breakpoint
ALTER TABLE "content_media" ADD CONSTRAINT "ck_content_media_role" CHECK ("role" IN ('cover','gallery','attachment'));--> statement-breakpoint
-- At most one cover per item
CREATE UNIQUE INDEX "uq_content_media_cover" ON "content_media" ("item_id") WHERE "role" = 'cover';--> statement-breakpoint
CREATE INDEX "idx_content_media_item" ON "content_media" ("item_id","role","sort_order");--> statement-breakpoint
CREATE INDEX "idx_content_links_item" ON "content_links" ("item_id","sort_order");