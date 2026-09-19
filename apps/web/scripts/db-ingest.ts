/**
 * DB ingest — loads content/site.ts into PostgreSQL via Drizzle.
 *
 * Idempotent: ON CONFLICT (slug) DO UPDATE — safe to re-run after edits.
 * Only inserts real content from site.ts (no seeds, no invented fields).
 * Empty stays empty: question: "" → question: '' in the DB.
 *
 * Usage (from apps/web/):
 *   npm run db:ingest
 *
 * Requires DATABASE_URL in .env.local and the DB to be running.
 * Start the local DB with: docker compose -f docker-compose.dev.yml up -d
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { eq } from "drizzle-orm";
import { getDb } from "../src/db/index";
import {
  contentItems,
  abandonedBranches,
  projectsTable,
  publicationsTable,
  siteSettings,
} from "../src/db/schema";
import { projects, publications, siteContent } from "../content/site";

const db = getDb();

async function ingestProjects() {
  console.log(`Ingesting ${projects.length} projects…`);

  for (const project of projects) {
    // 1. Upsert the base spine row
    const returning = await db
      .insert(contentItems)
      .values({
        slug: project.slug,
        title: project.title,
        contentType: "project",
        status: project.status,
        question: project.question ?? "",
        publishedAt:
          project.publishedAt ? new Date(project.publishedAt) : null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: contentItems.slug,
        set: {
          title: project.title,
          status: project.status,
          question: project.question ?? "",
          publishedAt:
            project.publishedAt ? new Date(project.publishedAt) : null,
          updatedAt: new Date(),
        },
      })
      .returning({ id: contentItems.id });

    const itemId = returning[0]?.id;
    if (!itemId) throw new Error(`Upsert returned no id for ${project.slug}`);

    // 2. Upsert the projects child row.
    //    Rich metadata (D-048) maps from the file when present; absent fields
    //    default to empty — no invented values (LAW-008). Media attachments are
    //    admin-managed only (there is no file representation), so they are never
    //    touched by ingest.
    const richFields = {
      overview: project.overview ?? "",
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      context: project.context ?? "",
      role: project.role ?? "",
      collaborators: project.collaborators ?? [],
      liveUrl: project.liveUrl ?? null,
      videoUrl: project.videoUrl ?? null,
      outcomes: project.outcomes ?? [],
      skillsLearned: project.skillsLearned ?? [],
      // In the schema since D-058 Phase E and never ingested, so the landing
      // page's project spine silently ignored whatever the file said and kept
      // whatever the DB already held. An ordering set in site.ts that the
      // ingest drops is worse than no ordering: it looks applied and is not.
      timelineOrder: project.timelineOrder ?? null,
    };
    await db
      .insert(projectsTable)
      .values({
        id: itemId,
        problem: project.problem ?? "",
        year: project.year,
        projectStatus: project.projectStatus ?? "archived",
        tags: project.tags ?? [],
        featured: project.featured ?? false,
        repoUrl: project.repoUrl ?? null,
        ...richFields,
      })
      .onConflictDoUpdate({
        target: projectsTable.id,
        set: {
          problem: project.problem ?? "",
          year: project.year,
          projectStatus: project.projectStatus ?? "archived",
          tags: project.tags ?? [],
          featured: project.featured ?? false,
          repoUrl: project.repoUrl ?? null,
          ...richFields,
        },
      });

    // 3. Replace abandoned branches (delete + re-insert preserves sort_order
    //    and avoids stale rows when branches are removed in the source file)
    await db
      .delete(abandonedBranches)
      .where(eq(abandonedBranches.itemId, itemId));

    if (project.abandonedBranches && project.abandonedBranches.length > 0) {
      await db.insert(abandonedBranches).values(
        project.abandonedBranches.map((branch, i) => ({
          itemId,
          tried: branch.tried,
          whyAbandoned: branch.whyAbandoned,
          learned: branch.learned,
          sortOrder: i,
        }))
      );
    }

    console.log(`  ✓ ${project.slug} (${project.status})`);
  }
}

/**
 * Publications were never ingested — the array existed in site.ts and this
 * script only ever read `projects`, so a paper added to the file could not
 * reach the site in db mode. Mirrors ingestProjects: upsert the base
 * content_items row, then the child row.
 */
async function ingestPublications() {
  if (publications.length === 0) {
    console.log("Ingesting publications… none in site.ts, skipping.");
    return;
  }
  console.log(`Ingesting ${publications.length} publication(s)…`);

  for (const publication of publications) {
    const returning = await db
      .insert(contentItems)
      .values({
        slug: publication.slug,
        title: publication.title,
        contentType: "publication",
        status: publication.status,
        publishedAt: publication.publishedAt
          ? new Date(publication.publishedAt)
          : null,
        question: "",
      })
      .onConflictDoUpdate({
        target: contentItems.slug,
        set: {
          title: publication.title,
          status: publication.status,
          publishedAt: publication.publishedAt
            ? new Date(publication.publishedAt)
            : null,
          updatedAt: new Date(),
        },
      })
      .returning({ id: contentItems.id });

    const itemId = returning[0]?.id;
    if (!itemId) throw new Error(`Upsert returned no id for ${publication.slug}`);

    const fields = {
      authors: publication.authors ?? [],
      venue: publication.venue ?? "",
      year: publication.year,
      abstract: publication.abstract ?? "",
      plainSummary: publication.plainSummary ?? "",
      pdfUrl: publication.pdfUrl ?? null,
      bibtex: publication.bibtex ?? null,
      doi: publication.doi ?? null,
      pubDate: publication.pubDate ?? null,
      pubStatus: publication.pubStatus ?? "published",
      arxivUrl: publication.arxivUrl ?? null,
    };

    await db
      .insert(publicationsTable)
      .values({ id: itemId, ...fields })
      .onConflictDoUpdate({ target: publicationsTable.id, set: fields });

    console.log(`  ✓ ${publication.slug} (${publication.status})`);
  }
}

async function ingestSiteSettings() {
  console.log("Ingesting site settings…");

  const outbound = siteContent.outbound ?? {};
  const settings: Array<{ key: string; value: unknown }> = [
    { key: "contactEmail", value: siteContent.contactEmail ?? null },
    {
      key: "contactSentence",
      value: (siteContent as Record<string, unknown>).contactSentence ?? null,
    },
    { key: "outbound", value: outbound },
  ];

  for (const { key, value } of settings) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value, updatedAt: new Date() },
      });
    console.log(`  ✓ settings/${key}`);
  }
}

async function main() {
  console.log("── DB ingest starting ──");
  await ingestProjects();
  await ingestPublications();
  await ingestSiteSettings();
  console.log("── DB ingest complete ──");
  process.exit(0);
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
