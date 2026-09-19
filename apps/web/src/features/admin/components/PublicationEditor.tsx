"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  savePublication,
  publishPublication,
  unpublishPublication,
  archivePublication,
  type PublicationFormState,
} from "@/features/admin/actions/publications";
import { ContentPublishBar } from "./ContentPublishBar";
import { AdminField } from "./AdminField";
import type { ContentStatus } from "@/types/content";

export interface PublicationEditorData {
  id: string;
  slug: string;
  title: string;
  question: string;
  authors: string[];
  venue: string;
  year: number;
  abstract: string;
  plainSummary: string;
  pubStatus: string;
  pubDate: string | null;
  pdfUrl: string | null;
  arxivUrl: string | null;
  doi: string | null;
  bibtex: string | null;
  verified: boolean;
  status: ContentStatus;
}

const initial: PublicationFormState = { error: null };

export function PublicationEditor({ data }: { data: PublicationEditorData }) {
  const [state, formAction, pending] = useActionState(savePublication, initial);
  const [question, setQuestion] = useState(data.question);

  return (
    <div className="flex min-h-svh flex-col">
      <form action={formAction} className="flex-1 space-y-8 px-6 py-8">
        <input type="hidden" name="id" value={data.id} />

        {state.error && (
          <p role="alert" className="text-small text-danger">
            {state.error}
          </p>
        )}

        <AdminField
          label="Title"
          name="title"
          defaultValue={data.title}
          error={state.fieldErrors?.title}
          required
        />

        <section className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Authors"
            name="authors"
            defaultValue={data.authors.join(", ")}
            hint="Comma-separated, in publication order."
          />
          <AdminField label="Venue" name="venue" defaultValue={data.venue} />
          <AdminField
            label="Year"
            name="year"
            type="number"
            defaultValue={String(data.year)}
            error={state.fieldErrors?.year}
            required
          />
          <div>
            <label htmlFor="pubStatus" className="block text-small font-medium text-ink">
              Status
            </label>
            <p className="mt-1 text-micro text-faint">
              Preprint and under-review are honest states, not lesser ones.
            </p>
            <select
              id="pubStatus"
              name="pubStatus"
              defaultValue={data.pubStatus}
              className="mt-2 h-10 w-full rounded-sm border border-border bg-recessed px-3 text-body text-ink"
            >
              <option value="published">Published</option>
              <option value="preprint">Preprint</option>
              <option value="under-review">Under review</option>
            </select>
          </div>
          <AdminField
            label="Exact date"
            name="pubDate"
            type="date"
            defaultValue={data.pubDate ?? ""}
            hint="Optional — overrides the year when shown."
          />
          <AdminField
            label="Slug"
            name="slug"
            defaultValue={data.slug}
            hint="Permanent once published."
          />
        </section>

        <div>
          <label htmlFor="question" className="block text-small font-medium text-ink">
            The question that created it
          </label>
          <p className="mt-1 text-micro text-faint">
            Required before publishing (LAW-003).
          </p>
          <Textarea
            id="question"
            name="question"
            rows={2}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            className="mt-2"
          />
        </div>

        <AdminField
          label="Plain summary"
          name="plainSummary"
          defaultValue={data.plainSummary}
          hint="The researcher→engineer bridge: what this means to someone who won't read the abstract."
          textarea
          rows={3}
        />
        <AdminField
          label="Abstract"
          name="abstract"
          defaultValue={data.abstract}
          textarea
          rows={6}
        />

        <section className="grid gap-5 sm:grid-cols-2">
          <AdminField label="PDF URL" name="pdfUrl" defaultValue={data.pdfUrl ?? ""} />
          <AdminField label="arXiv URL" name="arxivUrl" defaultValue={data.arxivUrl ?? ""} />
          <AdminField label="DOI" name="doi" defaultValue={data.doi ?? ""} />
        </section>

        <AdminField
          label="BibTeX"
          name="bibtex"
          defaultValue={data.bibtex ?? ""}
          hint="Pasted verbatim — researchers copy this directly."
          textarea
          rows={6}
          mono
        />

        <label className="flex items-center gap-2 text-small text-muted">
          <input type="checkbox" name="verified" value="true" defaultChecked={data.verified} />
          Verified — the facts here have been checked
        </label>

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </form>

      <ContentPublishBar
        id={data.id}
        status={data.status}
        question={question}
        publishAction={publishPublication}
        unpublish={unpublishPublication}
        archive={archivePublication}
        noun="paper"
      />
    </div>
  );
}
