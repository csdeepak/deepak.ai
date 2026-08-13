import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, postsTable, contentMedia } from "@/db/schema";
import { PostEditor } from "@/features/admin/components/PostEditor";
import { listMedia } from "@/features/admin/queries/media";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function PostEditorPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const [row] = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      question: contentItems.question,
      status: contentItems.status,
      publishedAt: contentItems.publishedAt,
      verified: contentItems.verified,
      dek: postsTable.dek,
      bodyMarkdown: postsTable.bodyMarkdown,
      readingMinutes: postsTable.readingMinutes,
      tags: postsTable.tags,
      featuredOrder: postsTable.featuredOrder,
    })
    .from(contentItems)
    .innerJoin(postsTable, eq(postsTable.id, contentItems.id))
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!row) notFound();

  const [coverRow, availableMedia] = await Promise.all([
    db
      .select({ mediaId: contentMedia.mediaId })
      .from(contentMedia)
      .where(eq(contentMedia.itemId, row.id))
      .limit(1),
    listMedia(),
  ]);

  const availableImages = availableMedia.filter((m) => m.kind === "image");

  return (
    <PostEditor
      availableImages={availableImages}
      data={{
        id: row.id,
        slug: row.slug,
        title: row.title,
        question: row.question,
        dek: row.dek,
        bodyMarkdown: row.bodyMarkdown,
        readingMinutes: row.readingMinutes,
        tags: row.tags,
        featured: row.featuredOrder !== null,
        featuredOrder: row.featuredOrder,
        verified: row.verified,
        status: row.status as ContentStatus,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        coverMediaId: coverRow[0]?.mediaId ?? null,
      }}
    />
  );
}
