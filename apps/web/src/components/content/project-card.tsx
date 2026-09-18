import Link from "next/link";
import { Tag } from "@/components/ui/badge";
import type { Project } from "@/types/content";

/**
 * ProjectCard — Instrument card (docs/DESIGN_SYSTEM §5). One title, a
 * scannable summary, the stack, and a quiet meta row. An accent-gradient
 * underline sweeps in on hover. No imagery in the tile — imagery lives on
 * the detail page (one idea per card). The whole card is a single link into
 * the graph (shared-element source).
 *
 * Why the clamp exists: `problem` is a full paragraph on most projects —
 * measured live, the six cards on /projects ran 567–1027 characters and
 * 424–729px tall, which is not a card, it is an article. A recruiter
 * skimming the Work index could not compare six projects without reading
 * roughly 4,000 words. Three lines is enough to decide whether to open it;
 * the full text is one click away on the detail page, unabridged.
 *
 * Why tags render here now: `tags` was already populated on every project
 * and shown only on the detail page, so the index — the page whose entire
 * job is comparison — was the one place you could not see what anything was
 * built with.
 */

/** Enough to signal the stack, few enough to stay one line on a narrow card. */
const MAX_VISIBLE_TAGS = 4;

export function ProjectCard({ project }: { project: Project }) {
  // `role` ("Solo", "Lead, team of 4") is a credit, not a summary — it was
  // standing in for the description whenever it happened to be set, which
  // made some cards read as one word. The problem statement is the summary;
  // role belongs in the meta row with the other facts.
  const summary = project.problem;
  const visibleTags = project.tags.slice(0, MAX_VISIBLE_TAGS);
  const overflowTagCount = project.tags.length - visibleTags.length;

  return (
    <div className="group relative flex h-full flex-col rounded-md border border-border bg-surface p-6 transition-colors duration-(--duration-hover) hover:border-border-emphasis theme-surface">
      <h3 className="text-card-title font-display font-semibold text-ink">
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0"
        >
          <span className="gradient-underline-hover">{project.title}</span>
        </Link>
      </h3>

      {summary && (
        <p className="mt-3 line-clamp-3 text-body text-muted">{summary}</p>
      )}

      {visibleTags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <li key={tag}>
              <Tag>{tag}</Tag>
            </li>
          ))}
          {overflowTagCount > 0 && (
            <li>
              {/* A real count, never a decorative "…" — the number is the
                  honest signal that more stack is listed on the detail page. */}
              <Tag className="text-faint">+{overflowTagCount}</Tag>
            </li>
          )}
        </ul>
      )}

      {/* mt-auto pins the meta row to the bottom so a grid of cards with
          different summary lengths still aligns along one baseline. */}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-micro text-faint">
        <span className="font-mono tabular">{project.year}</span>
        {project.role && (
          <>
            <span aria-hidden>·</span>
            <span>{project.role}</span>
          </>
        )}
        {project.projectStatus === "active" && (
          <>
            <span aria-hidden>·</span>
            <span className="font-mono uppercase tracking-[0.14em] text-grad-1">
              active
            </span>
          </>
        )}
      </div>
    </div>
  );
}
