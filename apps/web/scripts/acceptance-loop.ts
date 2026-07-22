/**
 * Acceptance ritual — timed update loop (docs/27 §, Phase 3).
 *
 * Simulates: draft → write question → publish → verify on /projects
 * Times each step. Total must be well under 10 minutes.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { eq, desc } from "drizzle-orm";
import { getDb } from "../src/db/index";
import { contentItems, projectsTable, contentVersions } from "../src/db/schema";

async function main() {
  const t0 = Date.now();
  const db = getDb();

  console.log("=== ACCEPTANCE: TIMED UPDATE LOOP ===");
  console.log(`Start: ${new Date().toISOString()}\n`);

  // ── Step 1: Find a draft project ──────────────────────────────────────────
  const t1 = Date.now();
  const drafts = await db
    .select({ id: contentItems.id, slug: contentItems.slug, title: contentItems.title, question: contentItems.question })
    .from(contentItems)
    .innerJoin(projectsTable, eq(projectsTable.id, contentItems.id))
    .where(eq(contentItems.status, "draft"))
    .limit(1);

  if (drafts.length === 0) {
    console.log("⚠ No draft projects. Run npm run db:ingest first.");
    process.exit(0);
  }

  const draft = drafts[0]!;
  console.log(`[+${Date.now() - t0}ms] Step 1 — Found draft: "${draft.title}" (${draft.slug})`);

  // ── Step 2: Write the question ────────────────────────────────────────────
  const question = "What would happen if a keyboard learned how you think before you type?";

  await db.update(contentItems).set({
    question,
    updatedAt: new Date(),
  }).where(eq(contentItems.id, draft.id));

  console.log(`[+${Date.now() - t0}ms] Step 2 — Question written: "${question}"`);

  // ── Step 3: Publish (same logic as publishProject server action) ──────────
  await db.update(contentItems).set({
    status: "published",
    publishedAt: new Date(),
    scheduledFor: null,
    updatedAt: new Date(),
  }).where(eq(contentItems.id, draft.id));

  // Write version
  const [latest] = await db.select({ versionNum: contentVersions.versionNum })
    .from(contentVersions).where(eq(contentVersions.itemId, draft.id))
    .orderBy(desc(contentVersions.versionNum)).limit(1);

  await db.insert(contentVersions).values({
    itemId: draft.id,
    versionNum: (latest?.versionNum ?? 0) + 1,
    snapshot: { published: true },
    changedFields: ["status", "publishedAt", "question"],
    origin: "publish",
  });

  console.log(`[+${Date.now() - t0}ms] Step 3 — Published!`);

  // ── Step 4: Verify it appears on /projects (same query the public page uses) ──
  const published = await db
    .select({ slug: contentItems.slug, title: contentItems.title, question: contentItems.question })
    .from(contentItems)
    .innerJoin(projectsTable, eq(projectsTable.id, contentItems.id))
    .where(eq(contentItems.status, "published"))
    .orderBy(desc(contentItems.publishedAt));

  const found = published.find(p => p.slug === draft.slug);

  if (found) {
    console.log(`[+${Date.now() - t0}ms] Step 4 — Appears on /projects ✓`);
    console.log(`  Title: "${found.title}"`);
    console.log(`  Question: "${found.question}"`);
  } else {
    console.log(`[+${Date.now() - t0}ms] Step 4 — NOT FOUND on /projects ✗`);
    process.exit(1);
  }

  // ── HTTP check: verify /projects endpoint returns it ─────────────────────
  const t5 = Date.now();
  const resp = await fetch("http://localhost:3000/projects");
  const html = await resp.text();
  const appearsInHTML = html.includes(draft.slug) || html.includes(draft.title);
  console.log(`[+${Date.now() - t0}ms] Step 5 — /projects HTTP ${resp.status}, project in HTML: ${appearsInHTML}`);

  const totalMs = Date.now() - t0;
  const totalSec = (totalMs / 1000).toFixed(1);
  console.log(`\n=== RESULT ===`);
  console.log(`Total time: ${totalSec}s (${totalMs}ms)`);
  console.log(`Limit: 10 minutes = 600s`);
  console.log(`Result: ${parseFloat(totalSec) < 600 ? "✓ PASS" : "✗ FAIL"}`);

  // ── Cleanup: revert to draft (don't litter the DB with test publishes) ────
  await db.update(contentItems).set({
    status: "draft",
    publishedAt: null,
    question: "",
    updatedAt: new Date(),
  }).where(eq(contentItems.id, draft.id));
  console.log(`\n[cleanup] Reverted "${draft.title}" back to draft.`);

  process.exit(0);
}

main().catch(err => {
  console.error("Acceptance test error:", err);
  process.exit(1);
});
