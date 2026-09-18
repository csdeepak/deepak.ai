import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, publicationsTable } from "@/db/schema";
import { PublicationEditor } from "@/features/admin/components/PublicationEditor";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function PublicationEditorPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const [row] = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      question: contentItems.question,
      status: contentItems.status,
      verified: contentItems.verified,
      authors: publicationsTable.authors,
      venue: publicationsTable.venue,
      year: publicationsTable.year,
      abstract: publicationsTable.abstract,
      plainSummary: publicationsTable.plainSummary,
      pubStatus: publicationsTable.pubStatus,
      pubDate: publicationsTable.pubDate,
      pdfUrl: publicationsTable.pdfUrl,
      arxivUrl: publicationsTable.arxivUrl,
      doi: publicationsTable.doi,
      bibtex: publicationsTable.bibtex,
    })
    .from(contentItems)
    .innerJoin(publicationsTable, eq(publicationsTable.id, contentItems.id))
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!row) notFound();

  return (
    <PublicationEditor
      data={{
        ...row,
        pubDate: row.pubDate ? String(row.pubDate).slice(0, 10) : null,
        status: row.status as ContentStatus,
      }}
    />
  );
}
