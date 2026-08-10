import type { Metadata } from "next";
import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, projectsTable } from "@/db/schema";
import { StatusBadge } from "@/features/admin/components/PublishBar";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsListPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      status: contentItems.status,
      featured: projectsTable.featured,
      year: projectsTable.year,
      updatedAt: contentItems.updatedAt,
    })
    .from(contentItems)
    .innerJoin(projectsTable, eq(projectsTable.id, contentItems.id))
    .orderBy(desc(contentItems.updatedAt));

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-small font-medium text-on-accent hover:bg-accent-hover"
        >
          + New project
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted">No projects yet. Create your first one above.</p>
      ) : (
        <table className="w-full text-small">
          <thead>
            <tr className="border-b border-border text-left text-micro font-medium text-muted">
              <th className="pb-2 pr-4">Title</th>
              <th className="pb-2 pr-4">Year</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Featured</th>
              <th className="pb-2">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border hover:bg-recessed"
              >
                <td className="py-3 pr-4">
                  <Link
                    href={`/admin/projects/${r.slug}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-muted">{r.year}</td>
                <td className="py-3 pr-4">
                  <StatusBadge status={r.status as ContentStatus} />
                </td>
                <td className="py-3 pr-4 text-muted">{r.featured ? "★" : "—"}</td>
                <td className="py-3 text-muted">
                  {new Date(r.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
