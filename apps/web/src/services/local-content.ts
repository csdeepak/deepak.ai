import type { ContentService } from "./content";
import {
  posts,
  projects,
  publications,
  skills,
  timeline,
} from "../../content/site";

/**
 * Local ContentService implementation — reads the typed files in
 * `content/`. Temporary until the PostgreSQL-backed layer (docs/09)
 * replaces it behind the same interface. All consumers stay unchanged
 * at the swap (docs/11 §7 swappability).
 */
export const localContent: ContentService = {
  async getFeaturedProjects(limit = 2) {
    return projects
      .filter((p) => p.featured && p.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  },
  async getProjects() {
    return projects
      .filter((p) => p.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  },
  async getProject(slug) {
    return projects.find((p) => p.slug === slug) ?? null;
  },
  async getPublications() {
    return publications.filter((p) => p.status === "published");
  },
  async getPublication(slug) {
    return publications.find((p) => p.slug === slug) ?? null;
  },
  async getLatestPosts(limit = 3) {
    return posts
      .filter((p) => p.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  },
  async getPost(slug) {
    return posts.find((p) => p.slug === slug) ?? null;
  },
  async getTimeline() {
    return timeline.filter((t) => t.status === "published");
  },
  async getCurrentSkills() {
    return skills.filter((s) => s.current && s.status === "published");
  },
};
