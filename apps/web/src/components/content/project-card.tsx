import Link from "next/link";
import type { Project } from "@/types/content";

/**
 * ProjectCard — Instrument card (docs/DESIGN_SYSTEM §5). One title, one
 * role/one-liner, an accent-gradient underline that sweeps in on hover. No
 * imagery in the tile — imagery lives on the detail page (one idea per card).
 * The whole card is a single link into the graph (shared-element source).
 */
export function ProjectCard({ project }: { project: Project }) {
  const line = project.role ?? project.problem;

  return (
    <div className="group relative rounded-md border border-border bg-surface p-6 transition-colors duration-(--duration-hover) hover:border-border-emphasis theme-surface">
      <h3 className="text-card-title font-display font-semibold text-ink">
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0"
        >
          <span className="gradient-underline-hover">{project.title}</span>
        </Link>
      </h3>
      {line && <p className="mt-2 text-body text-muted">{line}</p>}
      <div className="mt-4 flex items-center gap-3 text-micro text-faint">
        <span className="font-mono tabular">{project.year}</span>
        {project.projectStatus === "active" && (
          <span className="font-mono uppercase tracking-[0.14em] text-grad-1">
            active
          </span>
        )}
      </div>
    </div>
  );
}
