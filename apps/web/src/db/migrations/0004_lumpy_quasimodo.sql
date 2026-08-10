CREATE TABLE "dex_question_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer_kind" text NOT NULL,
	"matched_question" text DEFAULT '' NOT NULL,
	"visitor_role" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
