import type { Metadata } from "next";
import Link from "next/link";
import { eq, desc, ne, and } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, publicationsTable } from "@/db/schema";
import { StatusBadge } from "@/features/admin/components/PublishBar";
import { Button } from "@/components/ui/button";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Publications" };

export default async function AdminPublicationsPage() {
  const db = getDb();

  const rows = await db
    .select({
      slug: contentItems.slug,
      title: contentItems.title,
      status: contentItems.status,
      venue: publicationsTable.venue,
      year: publicationsTable.year,
      pubStatus: publicationsTable.pubStatus,
    })
    .from(contentItems)
    .innerJoin(publicationsTable, eq(publicationsTable.id, contentItems.id))
    .where(
      and(
        eq(contentItems.contentType, "publication"),
        ne(contentItems.status, "archived"),
      ),
    )
    .orderBy(desc(publicationsTable.year));

  return (
    <div className="px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h3 font-display font-semibold text-ink">
            Publications
          </h1>
          <p className="mt-2 max-w-[60ch] text-small text-muted">
            Papers, preprints and work under review — newest first.
          </p>
        </div>
        <Link href="/admin/publications/new">
          <Button variant="primary">New publication</Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 rounded-md border border-dashed border-border p-8 text-center text-small text-muted">
          No publications yet. The public shelf stays visibly empty rather than
          fabricating one.
        </p>
      ) : (
        <ul className="mt-8 space-y-px overflow-hidden rounded-md border border-border bg-border">
          {rows.map((row) => (
            <li key={row.slug} className="bg-canvas">
              <Link
                href={`/admin/publications/${row.slug}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 p-5 transition-colors hover:bg-surface"
              >
                <span className="text-body font-medium text-ink">{row.title}</span>
                {row.venue && (
                  <span className="text-small text-muted">{row.venue}</span>
                )}
                <span className="font-mono text-micro tabular text-faint">
                  {row.year}
                </span>
                {row.pubStatus !== "published" && (
                  <span className="font-mono text-micro uppercase tracking-[0.14em] text-accent">
                    {row.pubStatus}
                  </span>
                )}
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
