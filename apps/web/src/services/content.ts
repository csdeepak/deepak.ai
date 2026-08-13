import type {
  Post,
  Project,
  Publication,
  Skill,
  TimelineEntry,
} from "@/types/content";

/**
 * Content service interface — the frontend's read contract.
 *
 * INTERFACE ONLY in Sprint 0: no implementation, no fake data (sprint
 * rule). The implementation arrives with the data layer (docs/09,
 * docs/11 §7) and is consumed via this interface so the backing store
 * stays swappable. All reads are build-time/ISR on public routes —
 * no client-side data fetching above the fold (specs/landing.md §8).
 */
export interface ContentService {
  getFeaturedProjects(limit?: number): Promise<Project[]>;
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | null>;
  /** Published projects with a `timelineOrder`, ascending — the landing
   * Timeline section (D-058 Phase E). Distinct from `getTimeline()` below,
   * which is the unrelated career timeline_entries table. */
  getTimelineProjects(): Promise<Project[]>;

  getPublications(): Promise<Publication[]>;
  getPublication(slug: string): Promise<Publication | null>;

  getFeaturedPosts(limit?: number): Promise<Post[]>;
  getPosts(): Promise<Post[]>;
  getLatestPosts(limit?: number): Promise<Post[]>;
  getPost(slug: string): Promise<Post | null>;

  getTimeline(): Promise<TimelineEntry[]>;
  getCurrentSkills(): Promise<Skill[]>;
}
