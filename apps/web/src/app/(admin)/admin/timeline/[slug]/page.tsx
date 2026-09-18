import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, timelineEntriesTable } from "@/db/schema";
import { TimelineEditor } from "@/features/admin/components/TimelineEditor";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function TimelineEntryEditorPage({ params }: Props) {
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
      organization: timelineEntriesTable.organization,
      role: timelineEntriesTable.role,
      startDate: timelineEntriesTable.startDate,
      endDate: timelineEntriesTable.endDate,
      summary: timelineEntriesTable.summary,
      place: timelineEntriesTable.place,
      highlights: timelineEntriesTable.highlights,
    })
    .from(contentItems)
    .innerJoin(timelineEntriesTable, eq(timelineEntriesTable.id, contentItems.id))
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!row) notFound();

  return (
    <TimelineEditor
      data={{
        id: row.id,
        slug: row.slug,
        title: row.title,
        question: row.question,
        organization: row.organization,
        role: row.role,
        // `date` columns come back as ISO strings; the <input type="date">
        // wants exactly the YYYY-MM-DD head of that.
        startDate: String(row.startDate).slice(0, 10),
        endDate: row.endDate ? String(row.endDate).slice(0, 10) : null,
        summary: row.summary,
        place: row.place,
        highlights: row.highlights,
        verified: row.verified,
        status: row.status as ContentStatus,
      }}
    />
  );
}
