import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/db/index";
import {
  contentItems,
  projectsTable,
  abandonedBranches,
  contentMedia,
} from "@/db/schema";
import { ProjectEditor } from "@/features/admin/components/ProjectEditor";
import { listMedia } from "@/features/admin/queries/media";
import type { MediaSelection } from "@/features/admin/components/MediaPicker";
import type { ContentStatus } from "@/types/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export default async function ProjectEditorPage({ params }: Props) {
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
      scheduledFor: contentItems.scheduledFor,
      verified: contentItems.verified,
      problem: projectsTable.problem,
      year: projectsTable.year,
      projectStatus: projectsTable.projectStatus,
      featured: projectsTable.featured,
      repoUrl: projectsTable.repoUrl,
      tags: projectsTable.tags,
      overview: projectsTable.overview,
      startDate: projectsTable.startDate,
      endDate: projectsTable.endDate,
      context: projectsTable.context,
      role: projectsTable.role,
      collaborators: projectsTable.collaborators,
      liveUrl: projectsTable.liveUrl,
      videoUrl: projectsTable.videoUrl,
      outcomes: projectsTable.outcomes,
      skillsLearned: projectsTable.skillsLearned,
    })
    .from(contentItems)
    .innerJoin(projectsTable, eq(projectsTable.id, contentItems.id))
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!row) notFound();

  const [branches, mediaRows, availableMedia] = await Promise.all([
    db
      .select({
        tried: abandonedBranches.tried,
        whyAbandoned: abandonedBranches.whyAbandoned,
        learned: abandonedBranches.learned,
      })
      .from(abandonedBranches)
      .where(eq(abandonedBranches.itemId, row.id))
      .orderBy(abandonedBranches.sortOrder),
    db
      .select({ mediaId: contentMedia.mediaId, role: contentMedia.role })
      .from(contentMedia)
      .where(eq(contentMedia.itemId, row.id))
      .orderBy(asc(contentMedia.sortOrder)),
    listMedia(),
  ]);

  const media: MediaSelection = {
    cover: mediaRows.find((m) => m.role === "cover")?.mediaId ?? null,
    gallery: mediaRows.filter((m) => m.role === "gallery").map((m) => m.mediaId),
    attachments: mediaRows
      .filter((m) => m.role === "attachment")
      .map((m) => m.mediaId),
  };

  return (
    <ProjectEditor
      availableMedia={availableMedia}
      data={{
        id: row.id,
        slug: row.slug,
        title: row.title,
        question: row.question,
        problem: row.problem,
        year: row.year,
        projectStatus: row.projectStatus as "active" | "archived",
        featured: row.featured,
        repoUrl: row.repoUrl ?? null,
        tags: row.tags,
        verified: row.verified,
        status: row.status as ContentStatus,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        scheduledFor: row.scheduledFor?.toISOString() ?? null,
        abandonedBranches: branches,
        overview: row.overview,
        startDate: row.startDate,
        endDate: row.endDate,
        context: row.context,
        role: row.role,
        collaborators: row.collaborators,
        liveUrl: row.liveUrl,
        videoUrl: row.videoUrl,
        outcomes: row.outcomes,
        skillsLearned: row.skillsLearned,
        media,
      }}
    />
  );
}
