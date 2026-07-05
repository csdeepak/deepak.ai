import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge, Tag } from "@/components/ui/badge";
import type { Project } from "@/types/content";

/**
 * ProjectCard — Card-family content variant (docs/15 §6; docs/13
 * primitive). Whole card = one link into the graph; shared-element
 * source for detail transitions (Sprint 1). Scaffold: structure and
 * anatomy are final, visual treatment is hi-fi's job.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card interactive className="relative">
      <h3 className="text-h4 font-semibold">
        <Link
          href={`/projects/${project.slug}`}
          className="after:absolute after:inset-0"
        >
          {project.title}
        </Link>
      </h3>
      <p className="mt-2 text-body text-muted">{project.problem}</p>
      <div className="mt-4 flex items-center gap-2 text-micro text-faint">
        <span className="font-mono tabular">{project.year}</span>
        {project.projectStatus === "archived" && (
          <Badge tone="neutral">archived</Badge>
        )}
        {project.tags.slice(0, 3).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Card>
  );
}
