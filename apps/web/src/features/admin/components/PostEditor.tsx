"use client";

import { useActionState, useRef, useState } from "react";
import type { ContentStatus } from "@/types/content";
import { savePost, type PostFormState } from "@/features/admin/actions/posts";
import { PostPublishBar } from "@/features/admin/components/PostPublishBar";
import { StatusBadge } from "@/features/admin/components/PublishBar";
import type { MediaListItem } from "@/features/admin/queries/media";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PostEditorData {
  id: string;
  slug: string;
  title: string;
  question: string;
  dek: string;
  bodyMarkdown: string;
  readingMinutes: number | null;
  tags: string[];
  featured: boolean;
  verified: boolean;
  status: ContentStatus;
  publishedAt: string | null;
  coverMediaId: string | null;
}

const initial: PostFormState = { error: null };

export function PostEditor({
  data,
  availableImages,
}: {
  data: PostEditorData;
  availableImages: MediaListItem[];
}) {
  const [state, action, pending] = useActionState(savePost, initial);

  const [title, setTitle] = useState(data.title);
  const [slug, setSlug] = useState(data.slug);
  const [question, setQuestion] = useState(data.question);
  const [dek, setDek] = useState(data.dek);
  const [bodyMarkdown, setBodyMarkdown] = useState(data.bodyMarkdown);
  const [readingMinutes, setReadingMinutes] = useState(
    data.readingMinutes === null ? "" : String(data.readingMinutes),
  );
  const [tags, setTags] = useState(data.tags.join(", "));
  const [featured, setFeatured] = useState(data.featured);
  const [verified, setVerified] = useState(data.verified);
  const [coverMediaId, setCoverMediaId] = useState(data.coverMediaId ?? "");

  const slugWasTouched = useRef(data.slug !== slugify(data.title));

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugWasTouched.current) setSlug(slugify(v));
  }
  function handleSlugChange(v: string) {
    slugWasTouched.current = true;
    setSlug(v);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 0px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <span className="text-small text-muted">Posts /</span>
        <span className="text-small text-ink font-medium">{title || "Untitled"}</span>
        <StatusBadge status={data.status} />
        {featured && (
          <span className="rounded bg-accent-weak px-1.5 py-0.5 text-micro font-medium text-ink">
            ★ Featured
          </span>
        )}
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
          <input type="hidden" name="id" value={data.id} />
          <input type="hidden" name="featured" value={String(featured)} />
          <input type="hidden" name="verified" value={String(verified)} />
          <input type="hidden" name="coverMediaId" value={coverMediaId} />
          {/* Metadata fields live visually in the right-hand aside, which sits
              outside this <form> — mirrored here as hidden inputs so they are
              actually part of the submitted FormData. */}
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="readingMinutes" value={readingMinutes} />
          <input type="hidden" name="tags" value={tags} />

          {/* ── Basics ── */}
          <GroupHeader>Basics</GroupHeader>
          <FieldGroup label="Title" required>
            <input
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={inputCls}
              placeholder="Post title"
            />
          </FieldGroup>

          <FieldGroup label="Dek" hint="Optional — one-line subhead">
            <input
              name="dek"
              value={dek}
              onChange={(e) => setDek(e.target.value)}
              className={inputCls}
              placeholder="What this post is really about"
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

          {/* ── Body ── */}
          <GroupHeader>Body</GroupHeader>
          <FieldGroup label="Body" hint="Markdown — rendered on the public post">
            <textarea
              name="bodyMarkdown"
              value={bodyMarkdown}
              onChange={(e) => setBodyMarkdown(e.target.value)}
              rows={16}
              className={cn(inputCls, "h-auto resize-y font-mono text-micro")}
              placeholder="Write the post in markdown."
            />
          </FieldGroup>

          {/* ── Media ── */}
          <GroupHeader>Media</GroupHeader>
          <FieldGroup label="Cover image" hint="Optional">
            <CoverImagePicker
              available={availableImages}
              value={coverMediaId}
              onChange={setCoverMediaId}
            />
          </FieldGroup>

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
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={cn(inputCls, "font-mono text-micro")}
            />
          </MetaField>

          <MetaField label="Reading minutes" hint="Optional">
            <input
              type="number"
              min={1}
              value={readingMinutes}
              onChange={(e) => setReadingMinutes(e.target.value)}
              className={inputCls}
            />
          </MetaField>

          <MetaField label="Tags" hint="Comma-separated">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputCls}
              placeholder="agentic-ai, systems"
            />
          </MetaField>

          <div className="mb-4 flex flex-col gap-2">
            <Toggle
              label="Featured"
              checked={featured}
              onChange={setFeatured}
              hint="Only one post can be featured — setting this un-features any other."
            />
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
              href={`/admin/posts/${data.slug}/versions`}
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
      <PostPublishBar id={data.id} status={data.status} question={question} />
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
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-start gap-3">
      <div
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-(--duration-fast)",
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
      <span className="flex flex-col">
        <span className="text-small text-ink">{label}</span>
        {hint && <span className="text-micro text-faint">{hint}</span>}
      </span>
    </label>
  );
}

function CoverImagePicker({
  available,
  value,
  onChange,
}: {
  available: MediaListItem[];
  value: string;
  onChange: (v: string) => void;
}) {
  const chosen = available.find((m) => m.id === value);

  if (available.length === 0) {
    return (
      <p className="text-small text-faint">
        No images uploaded yet. Add one on the{" "}
        <a href="/admin/media" className="text-accent hover:underline">
          Media
        </a>{" "}
        page.
      </p>
    );
  }

  if (chosen) {
    return (
      <div className="flex items-center gap-3 rounded border border-border bg-surface p-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
        <img src={chosen.url} alt={chosen.alt} className="size-10 shrink-0 rounded object-cover" />
        <span className="flex-1 truncate text-small text-ink">
          {chosen.caption || chosen.alt || chosen.id.slice(0, 8)}
        </span>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-micro text-faint hover:text-danger"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <select
      value=""
      onChange={(e) => e.target.value && onChange(e.target.value)}
      className={inputCls}
    >
      <option value="">Choose a cover image…</option>
      {available.map((m) => (
        <option key={m.id} value={m.id}>
          {m.caption || m.alt || m.id.slice(0, 8)}
        </option>
      ))}
    </select>
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
