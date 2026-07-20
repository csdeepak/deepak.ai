import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, projectsTable, contentVersions } from "@/db/schema";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const db = getDb();

  const projects = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      status: contentItems.status,
      scheduledFor: contentItems.scheduledFor,
      updatedAt: contentItems.updatedAt,
    })
    .from(contentItems)
    .innerJoin(projectsTable, eq(projectsTable.id, contentItems.id))
    .orderBy(desc(contentItems.updatedAt));

  const recentActivity = await db
    .select({
      id: contentVersions.id,
      itemId: contentVersions.itemId,
      versionNum: contentVersions.versionNum,
      origin: contentVersions.origin,
      createdAt: contentVersions.createdAt,
      slug: contentItems.slug,
      title: contentItems.title,
    })
    .from(contentVersions)
    .innerJoin(contentItems, eq(contentItems.id, contentVersions.itemId))
    .orderBy(desc(contentVersions.createdAt))
    .limit(10);

  const drafts = projects.filter((p) => p.status === "draft").length;
  const published = projects.filter((p) => p.status === "published").length;
  const scheduled = projects.filter((p) => p.status === "scheduled");

  // Freshness: days since last update across all projects
  const lastUpdated = projects[0]?.updatedAt ?? null;
  const daysSince = lastUpdated
    ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86400000)
    : null;

  return (
    <div className="px-6 py-6">
      <h1 className="mb-6 text-h3 font-semibold text-ink">Overview</h1>

      {/* Freshness + counts */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Projects" value={String(projects.length)} />
        <StatCard label="Published" value={String(published)} />
        <StatCard
          label="Last update"
          value={daysSince === null ? "never" : daysSince === 0 ? "today" : `${daysSince}d ago`}
          alert={daysSince !== null && daysSince > 30 ? "red" : daysSince !== null && daysSince > 7 ? "amber" : "green"}
        />
      </div>

      {/* Scheduled items */}
      {scheduled.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-small font-semibold text-ink">
            Publish queue ({scheduled.length})
          </h2>
          <div className="flex flex-col divide-y divide-border rounded-md border border-border">
            {scheduled.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <Link
                  href={`/admin/projects/${p.slug}`}
                  className="text-small font-medium text-ink hover:text-accent"
                >
                  {p.title}
                </Link>
                <div className="flex items-center gap-3 text-small text-muted">
                  {p.scheduledFor
                    ? new Date(p.scheduledFor).toLocaleString()
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="mb-8 flex gap-3">
        <Link
          href="/admin/projects/new"
          className="inline-flex h-9 items-center rounded-md border border-border px-4 text-small text-muted hover:border-border-emphasis hover:text-ink"
        >
          + New project
        </Link>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-9 items-center rounded-md border border-border px-4 text-small text-muted hover:border-border-emphasis hover:text-ink"
        >
          + New post
        </Link>
      </section>

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <section>
          <h2 className="mb-3 text-small font-semibold text-ink">
            Recent activity
          </h2>
          <div className="flex flex-col divide-y divide-border rounded-md border border-border">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-small">
                <span className="text-muted">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
                <Link
                  href={`/admin/projects/${a.slug}`}
                  className="font-medium text-ink hover:text-accent"
                >
                  {a.title}
                </Link>
                <span className="rounded bg-recessed px-1.5 py-0.5 text-micro text-muted">
                  {a.origin}
                </span>
                <span className="ml-auto text-micro text-faint">v{a.versionNum}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {recentActivity.length === 0 && drafts === 0 && published === 0 && (
        <p className="text-small text-muted">
          No content yet.{" "}
          <Link href="/admin/projects/new" className="text-accent hover:underline">
            Create your first project.
          </Link>
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: "green" | "amber" | "red";
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="text-micro font-medium text-muted">{label}</div>
      <div
        className={cn(
          "mt-1 text-h4 font-semibold",
          alert === "red" ? "text-danger" : alert === "amber" ? "text-warning" : "text-ink",
        )}
      >
        {value}
      </div>
    </div>
  );
}
