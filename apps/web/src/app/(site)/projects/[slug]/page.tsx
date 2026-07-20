import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, FileText } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Badge, Tag } from "@/components/ui/badge";
import { ROUTES, isRouteBuilt } from "@/constants/routes";
import { contentService } from "@/services";
import type { ContentType, Project, Relation } from "@/types/content";

/**
 * /projects/[slug] — the Work detail (Detail archetype, docs/24 Part 10).
 *
 * Structurally carries the cognitive spine (docs/26): the QUESTION that
 * created it (LAW-003, always shown — required field), the ABANDONED
 * BRANCHES (LAW-004, self-hides when empty), and EVIDENCE links (Law 6,
 * self-hides when none). The 90-second fast path (title + question +
 * problem) is unobstructed. Every color is a token; there is no motion.
 *
 * Rich metadata (D-048) — cover, duration, context, role, collaborators,
 * overview, gallery, outcomes, skillsLearned, live/video links, PDF
 * attachments — each renders ONLY when present. A project with none of
 * them renders identically to before the metadata sprint (LAW-008).
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

/** Four-digit year from an ISO date string, or null. */
function fmtYear(iso?: string): string | null {
  if (!iso) return null;
  const y = iso.slice(0, 4);
  return /^\d{4}$/.test(y) ? y : null;
}

/** "2025 – 2026" · "2025 – present" · falls back to the plain year. */
function durationLabel(project: Project): string {
  const start = fmtYear(project.startDate);
  const end = fmtYear(project.endDate);
  if (start && end) return start === end ? start : `${start} – ${end}`;
  if (start && !project.endDate) return `${start} – present`;
  return String(project.year);
}

export async function generateStaticParams() {
  const projects = await contentService.getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await contentService.getProject(slug);
  if (!project) return {};
  return { title: `${project.title} — Work`, description: project.problem };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await contentService.getProject(slug);
  if (!project) notFound();

  const branches = project.abandonedBranches ?? [];
  const evidence = project.relations
    .map((relation) => ({ relation, href: relationHref(relation) }))
    .filter((entry) => entry.href !== null);

  const gallery = project.gallery ?? [];
  const attachments = project.attachments ?? [];
  const outcomes = project.outcomes ?? [];
  const skillsLearned = project.skillsLearned ?? [];
  const collaborators = project.collaborators ?? [];
  const overviewParagraphs = (project.overview ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // The context row (context · role · collaborators) renders only if any exists.
  const hasContextRow =
    Boolean(project.context) ||
    Boolean(project.role) ||
    collaborators.length > 0;

  const hasEvidence =
    evidence.length > 0 ||
    Boolean(project.repoUrl) ||
    Boolean(project.liveUrl) ||
    Boolean(project.videoUrl) ||
    attachments.length > 0;

  return (
    <Section>
      <Container width="reading">
        {/* Cover image (self-hides when absent). */}
        {project.coverImage && (
          <figure className="mb-10 overflow-hidden rounded-lg border border-border">
            <Image
              src={project.coverImage.url}
              alt={project.coverImage.alt}
              width={project.coverImage.width ?? 1280}
              height={project.coverImage.height ?? 720}
              priority
              className="h-auto w-full"
            />
            {project.coverImage.caption && (
              <figcaption className="border-t border-border bg-surface px-4 py-2 text-small text-muted">
                {project.coverImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Fast path: identity of the artifact in one glance (LAW-009). */}
        <header>
          <div className="flex items-center gap-3 text-micro text-faint">
            <Link href={ROUTES.projects} className="hover:text-ink">
              Work
            </Link>
            <span aria-hidden>/</span>
            <span className="font-mono tabular">{durationLabel(project)}</span>
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

          {/* Context row — context · role · collaborators (self-hides). */}
          {hasContextRow && (
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-small">
              {project.context && (
                <div>
                  <dt className="text-faint">Context</dt>
                  <dd className="text-ink">{project.context}</dd>
                </div>
              )}
              {project.role && (
                <div>
                  <dt className="text-faint">Role</dt>
                  <dd className="text-ink">{project.role}</dd>
                </div>
              )}
              {collaborators.length > 0 && (
                <div>
                  <dt className="text-faint">With</dt>
                  <dd className="text-ink">{collaborators.join(", ")}</dd>
                </div>
              )}
            </dl>
          )}

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

        {/* Overview — the decisions & trade-offs body (self-hides when empty). */}
        {overviewParagraphs.length > 0 && (
          <section aria-labelledby="overview-heading" className="mt-16">
            <h2
              id="overview-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              Decisions &amp; trade-offs
            </h2>
            <div className="mt-6 space-y-5 text-reading text-muted">
              {overviewParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        )}

        {/* Gallery (self-hides when empty). */}
        {gallery.length > 0 && (
          <section aria-labelledby="gallery-heading" className="mt-16">
            <h2
              id="gallery-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              Gallery
            </h2>
            <div className="mt-6 space-y-8">
              {gallery.map((asset, i) => (
                <figure
                  key={i}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  <Image
                    src={asset.url}
                    alt={asset.alt}
                    width={asset.width ?? 1280}
                    height={asset.height ?? 720}
                    loading="lazy"
                    className="h-auto w-full"
                  />
                  {asset.caption && (
                    <figcaption className="border-t border-border bg-surface px-4 py-2 text-small text-muted">
                      {asset.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Outcomes (self-hides when empty). */}
        {outcomes.length > 0 && (
          <section aria-labelledby="outcomes-heading" className="mt-16">
            <h2
              id="outcomes-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              Outcomes
            </h2>
            <ul className="mt-6 space-y-2 text-body text-muted">
              {outcomes.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-ink">{line}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* What I learned — skillsLearned (self-hides when empty). */}
        {skillsLearned.length > 0 && (
          <section aria-labelledby="learned-heading" className="mt-16">
            <h2
              id="learned-heading"
              className="font-mono text-micro uppercase tracking-[0.2em] text-faint"
            >
              What I learned
            </h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {skillsLearned.map((skill) => (
                <Tag key={skill}>{skill}</Tag>
              ))}
            </div>
          </section>
        )}

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
                  <ExternalEvidence href={project.repoUrl} label="Source repository" />
                </li>
              )}
              {project.liveUrl && (
                <li>
                  <ExternalEvidence href={project.liveUrl} label="Live demo" />
                </li>
              )}
              {project.videoUrl && (
                <li>
                  <ExternalEvidence href={project.videoUrl} label="Demo video" />
                </li>
              )}
              {attachments.map((pdf, i) => (
                <li key={`pdf-${i}`}>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent underline-offset-4 hover:underline"
                  >
                    <FileText className="size-4" aria-hidden />
                    {pdf.caption || "Document"} (PDF)
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
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

function ExternalEvidence({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-accent underline-offset-4 hover:underline"
    >
      {label}
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}
