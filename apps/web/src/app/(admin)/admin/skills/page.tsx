import type { Metadata } from "next";
import Link from "next/link";
import { eq, desc, ne, and } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, skillsTable } from "@/db/schema";
import { StatusBadge } from "@/features/admin/components/PublishBar";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const db = getDb();

  const rows = await db
    .select({
      slug: contentItems.slug,
      title: contentItems.title,
      status: contentItems.status,
      context: skillsTable.context,
      category: skillsTable.category,
      current: skillsTable.current,
    })
    .from(contentItems)
    .innerJoin(skillsTable, eq(skillsTable.id, contentItems.id))
    .where(
      and(eq(contentItems.contentType, "skill"), ne(contentItems.status, "archived")),
    )
    .orderBy(desc(skillsTable.current), contentItems.title);

  return (
    <div className="px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-display font-semibold text-ink">Skills</h1>
          <p className="mt-2 max-w-[64ch] text-small text-muted">
            Optional enrichment. <code className="font-mono text-micro">/skills</code>{" "}
            already lists everything derived from your project tags and the
            taxonomy — entries here add context, category and the
            Currently/Previously split on top.
          </p>
        </div>
        <Link href="/admin/skills/new">
          <Button variant="primary">New skill</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-md border border-dashed border-border p-8 text-center text-small text-muted">
          Nothing enriched yet — and that is a fine state. The public skills page
          works entirely from derived data until you add something here.
        </p>
      ) : (
        <ul className="mt-8 space-y-px overflow-hidden rounded-md border border-border bg-border">
          {rows.map((row) => (
            <li key={row.slug} className="bg-canvas">
              <Link
                href={`/admin/skills/${row.slug}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 p-5 transition-colors hover:bg-surface"
              >
                <span className="text-body font-medium text-ink">{row.title}</span>
                {row.category && (
                  <span className="text-small text-muted">{row.category}</span>
                )}
                <span className="font-mono text-micro uppercase tracking-[0.14em] text-faint">
                  {row.current ? "current" : "previously"}
                </span>
                <span className="ml-auto">
                  <StatusBadge status={row.status as ContentStatus} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
