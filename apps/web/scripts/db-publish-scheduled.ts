import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { sql, inArray, eq, desc } from "drizzle-orm";
import { getDb } from "../src/db/index";
import { contentItems, contentVersions, abandonedBranches, projectsTable } from "../src/db/schema";

// Idempotent scheduled-publishing cron (docs/27 §10).
// Uses FOR UPDATE SKIP LOCKED so concurrent runs never double-publish.
// Amendment (owner 2026-07-12): must be safe to overlap.

async function main() {
  const db = getDb();

  await db.transaction(async (tx) => {
    // Claim up to 50 rows atomically; skip any row locked by a concurrent run.
    const claimed = await tx.execute<{ id: string; slug: string; content_type: string }>(
      sql`
        SELECT id, slug, content_type
        FROM content_items
        WHERE status = 'scheduled' AND scheduled_for <= NOW()
        FOR UPDATE SKIP LOCKED
        LIMIT 50
      `,
    );

    if (claimed.rows.length === 0) {
      console.log("No scheduled items due. Exiting.");
      return;
    }

    const ids = claimed.rows.map((r) => r.id);
    console.log(`Publishing ${ids.length} item(s): ${claimed.rows.map((r) => r.slug).join(", ")}`);

    // Publish all claimed rows.
    await tx
      .update(contentItems)
      .set({ status: "published", publishedAt: new Date(), scheduledFor: null, updatedAt: new Date() })
      .where(inArray(contentItems.id, ids));

    // Write a version entry for each published item.
    for (const row of claimed.rows) {
      const [base] = await tx.select().from(contentItems).where(eq(contentItems.id, row.id)).limit(1);
      if (!base) continue;

      let typeRow: Record<string, unknown> = {};
      if (base.contentType === "project") {
        const [p] = await tx.select().from(projectsTable).where(eq(projectsTable.id, row.id)).limit(1);
        if (p) typeRow = p as Record<string, unknown>;
      }

      const branches = await tx.select().from(abandonedBranches).where(eq(abandonedBranches.itemId, row.id));
      const snapshot = { base: base as Record<string, unknown>, project: typeRow, abandonedBranches: branches };

      const [latest] = await tx
        .select({ versionNum: contentVersions.versionNum })
        .from(contentVersions)
        .where(eq(contentVersions.itemId, row.id))
        .orderBy(desc(contentVersions.versionNum))
        .limit(1);

      await tx.insert(contentVersions).values({
        itemId: row.id,
        versionNum: (latest?.versionNum ?? 0) + 1,
        snapshot,
        changedFields: ["status", "publishedAt"],
        origin: "scheduled_publish",
      });
    }
  });

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Scheduler error:", err);
  process.exit(1);
});
