import type { Metadata } from "next";
import Link from "next/link";
import { eq, desc, ne, and } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, timelineEntriesTable } from "@/db/schema";
import { StatusBadge } from "@/features/admin/components/PublishBar";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Experience" };

/** "2025 — present" · "Jun 2025 — Aug 2025" */
function range(start: string, end: string | null): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  return `${fmt(start)} — ${end ? fmt(end) : "present"}`;
}

export default async function AdminTimelinePage() {
  const db = getDb();

  const rows = await db
    .select({
      slug: contentItems.slug,
      title: contentItems.title,
      status: contentItems.status,
      role: timelineEntriesTable.role,
      organization: timelineEntriesTable.organization,
      startDate: timelineEntriesTable.startDate,
      endDate: timelineEntriesTable.endDate,
    })
    .from(contentItems)
    .innerJoin(timelineEntriesTable, eq(timelineEntriesTable.id, contentItems.id))
    .where(
      and(
        eq(contentItems.contentType, "timeline_entry"),
        ne(contentItems.status, "archived"),
      ),
    )
    .orderBy(desc(timelineEntriesTable.startDate));

  return (
    <div className="px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-display font-semibold text-ink">
            Experience
          </h1>
          <p className="mt-2 max-w-[60ch] text-small text-muted">
            Roles, internships and research positions — newest first. This is
            the career timeline, separate from the landing page&rsquo;s project
            spine.
          </p>
        </div>
        <Link href="/admin/timeline/new">
          <Button variant="primary">New entry</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-md border border-dashed border-border p-8 text-center text-small text-muted">
          No experience entries yet. Until one is published, the public
          Experience page stays hidden rather than showing an empty shelf.
        </p>
      ) : (
        <ul className="mt-8 space-y-px overflow-hidden rounded-md border border-border bg-border">
          {rows.map((row) => (
            <li key={row.slug} className="bg-canvas">
              <Link
                href={`/admin/timeline/${row.slug}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 p-5 transition-colors hover:bg-surface"
              >
                <span className="text-body font-medium text-ink">
                  {row.role}
                </span>
                <span className="text-small text-muted">
                  {row.organization}
                </span>
                <span className="font-mono text-micro tabular text-faint">
                  {range(String(row.startDate), row.endDate ? String(row.endDate) : null)}
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
