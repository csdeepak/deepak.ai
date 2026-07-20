import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { getDb } from "@/db/index";
import { contentItems, contentVersions } from "@/db/schema";
import {
  VersionHistory,
  type VersionRow,
} from "@/features/admin/components/VersionHistory";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Versions · ${slug}` };
}

export default async function ProjectVersionsPage({ params }: Props) {
  const { slug } = await params;
  const db = getDb();

  const [item] = await db
    .select({ id: contentItems.id, title: contentItems.title })
    .from(contentItems)
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!item) notFound();

  const versions = await db
    .select({
      id: contentVersions.id,
      versionNum: contentVersions.versionNum,
      changedFields: contentVersions.changedFields,
      origin: contentVersions.origin,
      createdAt: contentVersions.createdAt,
    })
    .from(contentVersions)
    .where(eq(contentVersions.itemId, item.id))
    .orderBy(desc(contentVersions.versionNum));

  const rows: VersionRow[] = versions.map((v) => ({
    id: v.id,
    versionNum: v.versionNum,
    changedFields: v.changedFields,
    origin: v.origin,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <VersionHistory
      itemId={item.id}
      versions={rows}
      backHref={`/admin/projects/${slug}`}
    />
  );
}
