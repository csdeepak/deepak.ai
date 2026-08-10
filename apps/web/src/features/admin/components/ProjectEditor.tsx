"use client";

import { useActionState, useRef, useState } from "react";
import type { ContentStatus } from "@/types/content";
import { saveProject, type ProjectFormState } from "@/features/admin/actions/projects";
import {
  AbandonedBranchesList,
  type Branch,
} from "@/features/admin/components/AbandonedBranchesList";
import {
  PublishBar,
  StatusBadge,
} from "@/features/admin/components/PublishBar";
import { StringListEditor } from "@/features/admin/components/StringListEditor";
import {
  MediaPicker,
  type MediaSelection,
} from "@/features/admin/components/MediaPicker";
import type { MediaListItem } from "@/features/admin/queries/media";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProjectEditorData {
  id: string;
  slug: string;
  title: string;
  question: string;
  problem: string;
  year: number;
  projectStatus: "active" | "archived";
  featured: boolean;
  repoUrl: string | null;
  tags: string[];
  verified: boolean;
  status: ContentStatus;
  publishedAt: string | null;
  scheduledFor: string | null;
  abandonedBranches: Branch[];
  // Rich metadata (D-048)
  overview: string;
  startDate: string | null;
  endDate: string | null;
  context: string;
  role: string;
  collaborators: string[];
  liveUrl: string | null;
  videoUrl: string | null;
  outcomes: string[];
  skillsLearned: string[];
  media: MediaSelection;
}

const initial: ProjectFormState = { error: null };

export function ProjectEditor({
  data,
  availableMedia,
}: {
  data: ProjectEditorData;
  availableMedia: MediaListItem[];
}) {
  const [state, action, pending] = useActionState(saveProject, initial);

  // Controlled fields
  const [title, setTitle] = useState(data.title);
  const [slug, setSlug] = useState(data.slug);
  const [question, setQuestion] = useState(data.question);
  const [problem, setProblem] = useState(data.problem);
  const [year, setYear] = useState(String(data.year));
  const [projectStatus, setProjectStatus] = useState(data.projectStatus);
  const [featured, setFeatured] = useState(data.featured);
  const [verified, setVerified] = useState(data.verified);
  const [repoUrl, setRepoUrl] = useState(data.repoUrl ?? "");
  const [tags, setTags] = useState(data.tags.join(", "));
  const [branches, setBranches] = useState<Branch[]>(data.abandonedBranches);
  // Rich metadata
  const [overview, setOverview] = useState(data.overview);
  const [startDate, setStartDate] = useState(data.startDate ?? "");
  const [endDate, setEndDate] = useState(data.endDate ?? "");
  const [context, setContext] = useState(data.context);
  const [role, setRole] = useState(data.role);
  const [collaborators, setCollaborators] = useState<string[]>(data.collaborators);
  const [liveUrl, setLiveUrl] = useState(data.liveUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(data.videoUrl ?? "");
  const [outcomes, setOutcomes] = useState<string[]>(data.outcomes);
  const [skillsLearned, setSkillsLearned] = useState<string[]>(data.skillsLearned);
  const [media, setMedia] = useState<MediaSelection>(data.media);

  const slugWasTouched = useRef(data.slug !== slugify(data.title));

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugWasTouched.current) setSlug(slugify(v));
  }
  function handleSlugChange(v: string) {
    slugWasTouched.current = true;
    setSlug(v);
  }

  // Drop empty strings from list fields before persisting.
  const cleanList = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 0px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <span className="text-small text-muted">Projects /</span>
        <span className="text-small text-ink font-medium">{title || "Untitled"}</span>
        <StatusBadge status={data.status} />
        {state.error && (
          <p role="alert" className="ml-auto text-small text-danger">
            {state.error}
          </p>
        )}
        {!state.error && !pending && (
          <span className="ml-auto text-small text-faint">Saved</span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane — content */}
        <form action={action} className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
          {/* Hidden serialized fields */}
          <input type="hidden" name="id" value={data.id} />
          <input type="hidden" name="abandonedBranches" value={JSON.stringify(branches)} />
          <input type="hidden" name="featured" value={String(featured)} />
          <input type="hidden" name="verified" value={String(verified)} />
          <input type="hidden" name="collaborators" value={JSON.stringify(cleanList(collaborators))} />
          <input type="hidden" name="outcomes" value={JSON.stringify(cleanList(outcomes))} />
          <input type="hidden" name="skillsLearned" value={JSON.stringify(cleanList(skillsLearned))} />
          <input type="hidden" name="media" value={JSON.stringify(media)} />

          {/* ── Basics ── */}
          <GroupHeader>Basics</GroupHeader>
          <FieldGroup label="Title" required>
            <input
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputCls}
              placeholder="Project title"
            />
          </FieldGroup>

          <FieldGroup
            label="Origin question"
            hint={
              data.status === "draft" || data.status === "archived"
                ? "Required to publish"
                : undefined
            }
          >
            <textarea
              name="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className={cn(inputCls, "h-auto resize-y")}
              placeholder="What question caused this to exist?"
            />
          </FieldGroup>

          <FieldGroup label="Problem statement">
            <textarea
              name="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={2}
              className={cn(inputCls, "h-auto resize-y")}
              placeholder="One-line problem this solves"
            />
          </FieldGroup>

          {/* ── Body ── */}
          <GroupHeader>Body</GroupHeader>
          <FieldGroup label="Overview" hint="Markdown · decisions & trade-offs">
            <textarea
              name="overview"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={8}
              className={cn(inputCls, "h-auto resize-y font-mono text-micro")}
              placeholder="The reasoning, the decisions, the trade-offs. Blank lines separate paragraphs."
            />
          </FieldGroup>

          <FieldGroup label="Outcomes" hint="Optional — results / impact">
            <StringListEditor
              items={outcomes}
              onChange={setOutcomes}
              placeholder="A result, honestly stated"
              addLabel="Add outcome"
            />
          </FieldGroup>

          <FieldGroup label="Abandoned branches">
            <AbandonedBranchesList initial={branches} onChange={setBranches} />
          </FieldGroup>

          {/* ── Dates & Context ── */}
          <GroupHeader>Dates &amp; Context</GroupHeader>
          <div className="mb-5 grid grid-cols-2 gap-4">
            <FieldGroup label="Start date" hint="Optional">
              <input
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </FieldGroup>
            <FieldGroup label="End date" hint="Blank = ongoing">
              <input
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Context" hint="Optional — course / org / personal">
            <input
              name="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className={inputCls}
              placeholder="PES coursework · Personal · SahayAI Club"
            />
          </FieldGroup>
          <FieldGroup label="Role" hint="Optional">
            <input
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputCls}
              placeholder="Solo · Lead, team of 4"
            />
          </FieldGroup>
          <FieldGroup label="Collaborators" hint="Optional">
            <StringListEditor
              items={collaborators}
              onChange={setCollaborators}
              placeholder="Name"
              addLabel="Add collaborator"
            />
          </FieldGroup>

          {/* ── Links ── */}
          <GroupHeader>Links</GroupHeader>
          <FieldGroup label="Repository URL" hint="Optional">
            <input
              name="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className={inputCls}
              placeholder="https://github.com/…"
            />
          </FieldGroup>
          <FieldGroup label="Live demo URL" hint="Optional">
            <input
              name="liveUrl"
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </FieldGroup>
          <FieldGroup label="Demo video URL" hint="Optional — link only, no upload">
            <input
              name="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </FieldGroup>

          {/* ── Skills ── */}
          <GroupHeader>Skills</GroupHeader>
          <FieldGroup label="What I learned" hint="Optional — takeaways (distinct from tags)">
            <StringListEditor
              items={skillsLearned}
              onChange={setSkillsLearned}
              placeholder="Something building this taught you"
              addLabel="Add takeaway"
            />
          </FieldGroup>

          {/* ── Media ── */}
          <GroupHeader>Media</GroupHeader>
          <div className="mb-5">
            <MediaPicker available={availableMedia} value={media} onChange={setMedia} />
          </div>

          <div className="mt-4">
            <Button type="submit" variant="secondary" disabled={pending} className="w-full">
              {pending ? "Saving…" : "Save draft"}
            </Button>
          </div>
        </form>

        {/* Right pane — metadata */}
        <aside className="w-72 flex-shrink-0 overflow-y-auto border-l border-border px-5 py-6 text-small">
          <MetaField label="Slug">
            <input
              name="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={cn(inputCls, "font-mono text-micro")}
            />
          </MetaField>

          <MetaField label="Year">
            <input
              name="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              min={1990}
              max={2099}
              className={inputCls}
            />
          </MetaField>

          <MetaField label="Status">
            <select
              name="projectStatus"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value as "active" | "archived")}
              className={inputCls}
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </MetaField>

          <MetaField label="Tags" hint="Technologies · comma-separated">
            <input
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputCls}
              placeholder="Python, PyTorch, systems"
            />
          </MetaField>

          <div className="mb-4 flex flex-col gap-2">
            <Toggle label="Featured" checked={featured} onChange={setFeatured} />
            <Toggle label="Verified" checked={verified} onChange={setVerified} />
          </div>

          {data.publishedAt && (
            <MetaField label="Published">
              <span className="text-muted">
                {new Date(data.publishedAt).toLocaleDateString()}
              </span>
            </MetaField>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <a
              href={`/admin/projects/${data.slug}/versions`}
              className="text-small text-muted hover:text-ink hover:underline"
            >
              Version history →
            </a>
          </div>

          {state.fieldErrors?.title && (
            <p className="mt-2 text-small text-danger">{state.fieldErrors.title}</p>
          )}
        </aside>
      </div>

      {/* Sticky publish bar */}
      <PublishBar
        id={data.id}
        status={data.status}
        question={question}
        scheduledFor={data.scheduledFor}
        slug={data.slug}
      />
    </div>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const inputCls =
  "h-9 w-full rounded border border-border bg-surface px-2.5 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-2 border-b border-border pb-1.5 font-mono text-micro uppercase tracking-[0.18em] text-faint">
      {children}
    </h3>
  );
}

function FieldGroup({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-small font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </span>
        {hint && <span className="text-micro text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function MetaField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-micro font-medium text-muted">{label}</span>
        {hint && <span className="text-micro text-faint">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
      <div
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-(--duration-fast)",
          checked ? "bg-accent" : "bg-border-emphasis",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-(--duration-fast)",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </div>
      <span className="text-small text-ink">{label}</span>
    </label>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
