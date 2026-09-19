import { normalizeMaybe, normalizeTypography } from "@/lib/text";
import type { ContentService } from "./content";
import type {
  MediaAsset,
  Post,
  Project,
  Publication,
  Skill,
  TimelineEntry,
} from "@/types/content";

/**
 * Typography normalization for the public read path.
 *
 * Deliberately an explicit per-type field list rather than a generic "walk
 * the object and normalise every string". Slugs, URLs, ISO dates, status
 * enums and relation kinds are strings too, and a blanket transform over
 * them would be a silent correctness risk for no benefit — none of them can
 * legitimately contain pseudo-styled Unicode. Only fields a human types for
 * other humans to read are touched.
 *
 * Every function below returns a new object; nothing is mutated in place,
 * so file mode's module-level content arrays are never rewritten.
 */

function media(asset: MediaAsset): MediaAsset {
  return {
    ...asset,
    alt: normalizeTypography(asset.alt),
    caption: normalizeTypography(asset.caption),
  };
}

function mediaList(assets?: MediaAsset[]): MediaAsset[] | undefined {
  return assets?.map(media);
}

function project(item: Project): Project {
  return {
    ...item,
    title: normalizeTypography(item.title),
    question: normalizeTypography(item.question),
    problem: normalizeTypography(item.problem),
    tags: item.tags.map(normalizeTypography),
    overview: normalizeMaybe(item.overview),
    context: normalizeMaybe(item.context),
    role: normalizeMaybe(item.role),
    collaborators: item.collaborators?.map(normalizeTypography),
    outcomes: item.outcomes?.map(normalizeTypography),
    skillsLearned: item.skillsLearned?.map(normalizeTypography),
    abandonedBranches: item.abandonedBranches?.map((branch) => ({
      tried: normalizeTypography(branch.tried),
      whyAbandoned: normalizeTypography(branch.whyAbandoned),
      learned: normalizeTypography(branch.learned),
    })),
    relations: item.relations.map((relation) => ({
      ...relation,
      toTitle: normalizeTypography(relation.toTitle),
    })),
    coverImage: item.coverImage ? media(item.coverImage) : undefined,
    gallery: mediaList(item.gallery),
    attachments: mediaList(item.attachments),
  };
}

function post(item: Post): Post {
  return {
    ...item,
    title: normalizeTypography(item.title),
    dek: normalizeTypography(item.dek),
    bodyMarkdown: normalizeTypography(item.bodyMarkdown),
    tags: item.tags.map(normalizeTypography),
    relatedLinks: item.relatedLinks?.map((link) => ({
      ...link,
      label: normalizeTypography(link.label),
    })),
    relations: item.relations.map((relation) => ({
      ...relation,
      toTitle: normalizeTypography(relation.toTitle),
    })),
    coverImage: item.coverImage ? media(item.coverImage) : undefined,
    attachments: mediaList(item.attachments),
  };
}

function publication(item: Publication): Publication {
  return {
    ...item,
    title: normalizeTypography(item.title),
    authors: item.authors.map(normalizeTypography),
    venue: normalizeTypography(item.venue),
    abstract: normalizeTypography(item.abstract),
    plainSummary: normalizeTypography(item.plainSummary),
    attachments: mediaList(item.attachments),
  };
}

function timelineEntry(item: TimelineEntry): TimelineEntry {
  return {
    ...item,
    title: normalizeTypography(item.title),
    organization: normalizeTypography(item.organization),
    role: normalizeTypography(item.role),
    summary: normalizeTypography(item.summary),
    place: normalizeMaybe(item.place),
    highlights: item.highlights?.map(normalizeTypography),
  };
}

function skill(item: Skill): Skill {
  return {
    ...item,
    title: normalizeTypography(item.title),
    context: normalizeTypography(item.context),
    category: normalizeMaybe(item.category),
  };
}

/** Wraps a ContentService so every value it returns is normalised. */
export function withNormalizedTypography(
  service: ContentService,
): ContentService {
  return {
    getFeaturedProjects: async (limit) =>
      (await service.getFeaturedProjects(limit)).map(project),
    getProjects: async () => (await service.getProjects()).map(project),
    getProject: async (slug) => {
      const found = await service.getProject(slug);
      return found ? project(found) : null;
    },
    getTimelineProjects: async () =>
      (await service.getTimelineProjects()).map(project),

    getPublications: async () =>
      (await service.getPublications()).map(publication),
    getPublication: async (slug) => {
      const found = await service.getPublication(slug);
      return found ? publication(found) : null;
    },

    getFeaturedPosts: async (limit) =>
      (await service.getFeaturedPosts(limit)).map(post),
    getPosts: async () => (await service.getPosts()).map(post),
    getLatestPosts: async (limit) =>
      (await service.getLatestPosts(limit)).map(post),
    getPost: async (slug) => {
      const found = await service.getPost(slug);
      return found ? post(found) : null;
    },

    getTimeline: async () => (await service.getTimeline()).map(timelineEntry),
    getSkills: async () => (await service.getSkills()).map(skill),
    getCurrentSkills: async () =>
      (await service.getCurrentSkills()).map(skill),
  };
}
