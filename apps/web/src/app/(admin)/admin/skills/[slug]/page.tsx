import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, skillsTable } from "@/db/schema";
import { SkillEditor } from "@/features/admin/components/SkillEditor";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function SkillEditorPage({ params }: Props) {
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
      context: skillsTable.context,
      category: skillsTable.category,
      current: skillsTable.current,
      sinceYear: skillsTable.sinceYear,
    })
    .from(contentItems)
    .innerJoin(skillsTable, eq(skillsTable.id, contentItems.id))
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!row) notFound();

  return <SkillEditor data={{ ...row, status: row.status as ContentStatus }} />;
}
