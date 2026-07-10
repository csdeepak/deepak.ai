import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge, Tag } from "@/components/ui/badge";
import { ROUTES, isRouteBuilt } from "@/constants/routes";
import { localContent } from "@/services/local-content";
import type { ContentType, Relation } from "@/types/content";

/**
 * /projects/[slug] — the Work detail (Detail archetype, docs/24 Part 10).
 *
 * Structurally carries the cognitive spine (docs/26): the QUESTION that
 * created it (LAW-003, always shown — required field), the ABANDONED
 * BRANCHES (LAW-004, self-hides when empty), and EVIDENCE links (Law 6,
 * self-hides when none). The 90-second fast path (title + question +
 * problem) is unobstructed. Every color is a token; there is no motion.
 */

// Fully static (Tier 0 has no server): only slugs from generateStaticParams
// exist; every other path 404s at the static layer, honestly.
export const dynamicParams = false;

type Params = { slug: string };

/** Internal routes an evidence relation can point at (closed set). */
const TYPE_ROUTE: Partial<Record<ContentType, string>> = {
  project: ROUTES.projects,
  publication: ROUTES.publications,
  post: ROUTES.posts,
  timeline_entry: ROUTES.timeline,
  skill: ROUTES.skills,
};

/** A relation is a live evidence link only if its target page exists. */
function relationHref(relation: Relation): string | null {
  const base = TYPE_ROUTE[relation.toType];
  if (!base || !isRouteBuilt(base)) return null;
  return `${base}/${relation.toSlug}`;
}

export async function generateStaticParams() {
  const projects = await localContent.getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await localContent.getProject(slug);
  if (!project) return {};
  return { title: `${project.title} — Work`, description: project.problem };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await localContent.getProject(slug);
  if (!project) notFound();

  const branches = project.abandonedBranches ?? [];
  const evidence = project.relations
    .map((relation) => ({ relation, href: relationHref(relation) }))
    .filter((entry) => entry.href !== null);
  const hasEvidence = evidence.length > 0 || Boolean(project.repoUrl);

  return (
    <Section>
      <Container width="reading">
        {/* Fast path: identity of the artifact in one glance (LAW-009). */}
        <header>
          <div className="flex items-center gap-3 text-micro text-faint">
            <Link href={ROUTES.projects} className="hover:text-ink">
              Work
            </Link>
            <span aria-hidden>/</span>
            <span className="font-mono tabular">{project.year}</span>
            {project.projectStatus === "active" ? (
              <Badge tone="info">active</Badge>
            ) : (
              <Badge tone="neutral">archived</Badge>
            )}
          </div>
          <h1 className="mt-5 text-h1 font-semibold tracking-tight text-ink">
            {project.title}
          </h1>
          <p className="mt-4 text-reading text-muted">{project.problem}</p>
          {project.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </header>

        {/* The question that created it (LAW-003 — always present). */}
        <section aria-labelledby="q-heading" className="mt-14">
          <h2
            id="q-heading"
            className="font-mono text-micro uppercase tracking-[0.2em] text-accent"
          >
            The question that created it
          </h2>
          <p className="mt-4 text-h3 font-medium leading-snug text-ink">
            {project.question}
          </p>
        </section>

        {/* Abandoned branches (LAW-004 — self-hides when empty). */}
        {branches.length > 0 && (
          <section aria-labelledby="branches-heading" className="mt-16">
            <h2
              id="branches-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              Abandoned branches
            </h2>
            <p className="mt-3 max-w-[52ch] text-small text-muted">
              The dead ends are kept on purpose — they are where the design
              actually happened.
            </p>
            <ul className="mt-8 space-y-px overflow-hidden rounded-md border border-border bg-border">
              {branches.map((branch, i) => (
                <li key={i} className="bg-canvas p-6">
                  <p className="text-body font-medium text-ink">
                    {branch.tried}
                  </p>
                  <p className="mt-2 text-small text-muted">
                    <span className="text-faint">Abandoned because </span>
                    {branch.whyAbandoned}
                  </p>
                  <p className="mt-1 text-small text-muted">
                    <span className="text-faint">Learned </span>
                    {branch.learned}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Evidence (Law 6 — self-hides when none; no dead links). */}
        {hasEvidence && (
          <section aria-labelledby="evidence-heading" className="mt-16">
            <h2
              id="evidence-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              Evidence
            </h2>
            <ul className="mt-6 space-y-3 text-body">
              {project.repoUrl && (
                <li>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent underline-offset-4 hover:underline"
                  >
                    Source repository
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </li>
              )}
              {evidence.map(({ relation, href }) => (
                <li key={`${relation.toType}:${relation.toSlug}`}>
                  <Link
                    href={href as string}
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    {relation.toTitle}
                  </Link>
                  <span className="ml-2 text-small text-faint">
                    {relation.kind}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </Section>
  );
}
