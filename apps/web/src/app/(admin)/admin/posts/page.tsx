import type { Metadata } from "next";
import Link from "next/link";
import { eq, desc, ne } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, postsTable } from "@/db/schema";
import { StatusBadge } from "@/features/admin/components/PublishBar";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Posts" };

interface Props {
  searchParams: Promise<{ archived?: string }>;
}

export default async function PostsPage({ searchParams }: Props) {
  const { archived } = await searchParams;
  const showArchived = archived === "1";

  const db = getDb();
  const rows = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      status: contentItems.status,
      featured: postsTable.featured,
      readingMinutes: postsTable.readingMinutes,
      updatedAt: contentItems.updatedAt,
    })
    .from(contentItems)
    .innerJoin(postsTable, eq(postsTable.id, contentItems.id))
    .where(showArchived ? eq(contentItems.status, "archived") : ne(contentItems.status, "archived"))
    .orderBy(desc(contentItems.updatedAt));

  return (
    <div className="px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-9 items-center rounded-md bg-accent px-4 text-small font-medium text-on-accent hover:bg-accent-hover"
        >
          + New post
        </Link>
      </div>

      <div className="mb-4 flex gap-1 text-small">
        <Link
          href="/admin/posts"
          className={`rounded px-2.5 py-1 ${!showArchived ? "bg-recessed font-medium text-ink" : "text-muted hover:text-ink"}`}
        >
          Active
        </Link>
        <Link
          href="/admin/posts?archived=1"
          className={`rounded px-2.5 py-1 ${showArchived ? "bg-recessed font-medium text-ink" : "text-muted hover:text-ink"}`}
        >
          Archived
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted">
          {showArchived ? "No archived posts." : "No posts yet. Create your first one above."}
        </p>
      ) : (
        <table className="w-full text-small">
          <thead>
            <tr className="border-b border-border text-left text-micro font-medium text-muted">
              <th className="pb-2 pr-4">Title</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4">Featured</th>
              <th className="pb-2 pr-4">Reading</th>
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
                    href={`/admin/posts/${r.slug}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={r.status as ContentStatus} />
                </td>
                <td className="py-3 pr-4 text-muted">
                  {r.featured ? (
                    <span className="rounded bg-accent-weak px-1.5 py-0.5 text-micro font-medium text-ink">
                      ★ Featured
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 pr-4 text-muted">
                  {r.readingMinutes ? `${r.readingMinutes} min` : "—"}
                </td>
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
