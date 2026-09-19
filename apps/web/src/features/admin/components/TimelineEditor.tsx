"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  saveTimelineEntry,
  publishTimelineEntry,
  unpublishTimelineEntry,
  archiveTimelineEntry,
  type TimelineFormState,
} from "@/features/admin/actions/timeline";
import { ContentPublishBar } from "./ContentPublishBar";
import type { ContentStatus } from "@/types/content";

export interface TimelineEditorData {
  id: string;
  slug: string;
  title: string;
  question: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string | null;
  summary: string;
  place: string;
  highlights: string[];
  verified: boolean;
  status: ContentStatus;
}

const initial: TimelineFormState = { error: null };

/**
 * The experience entry editor.
 *
 * `question` is kept as a first-class field rather than hidden, because
 * LAW-003 gates publishing on it and the publish bar reads the live value —
 * a field you cannot see but that blocks publishing is the kind of thing that
 * reads as a broken button.
 *
 * `highlights` is a textarea, one per line, rather than a StringListEditor:
 * these are written in a burst while the job is fresh in mind, and a
 * add-row-click-per-item widget fights that.
 */
export function TimelineEditor({ data }: { data: TimelineEditorData }) {
  const [state, formAction, pending] = useActionState(saveTimelineEntry, initial);

  // Mirrored locally so the publish bar sees edits before they are saved.
  const [question, setQuestion] = useState(data.question);
  const [isCurrent, setIsCurrent] = useState(data.endDate === null);

  return (
    <div className="flex min-h-svh flex-col">
      <form action={formAction} className="flex-1 space-y-8 px-6 py-8">
        <input type="hidden" name="id" value={data.id} />

        {state.error && (
          <p role="alert" className="text-small text-danger">
            {state.error}
          </p>
        )}

        <section className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Role"
            name="role"
            defaultValue={data.role}
            error={state.fieldErrors?.role}
            required
          />
          <Field
            label="Organization"
            name="organization"
            defaultValue={data.organization}
            error={state.fieldErrors?.organization}
            required
          />
          <Field
            label="Start date"
            name="startDate"
            type="date"
            defaultValue={data.startDate}
            error={state.fieldErrors?.startDate}
            required
          />
          <div>
            <label
              htmlFor="endDate"
              className="block text-small font-medium text-ink"
            >
              End date
            </label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={data.endDate ?? ""}
              disabled={isCurrent}
              className="mt-2"
            />
            {state.fieldErrors?.endDate && (
              <p className="mt-1 text-micro text-danger">
                {state.fieldErrors.endDate}
              </p>
            )}
            <label className="mt-2 flex items-center gap-2 text-small text-muted">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(event) => setIsCurrent(event.target.checked)}
              />
              {/* An absent end date IS the "current" state in the schema —
                  this checkbox just makes that legible instead of asking the
                  owner to know that leaving a field blank means something. */}
              Current — still here
            </label>
          </div>
          <Field
            label="Place"
            name="place"
            defaultValue={data.place}
            hint="City-level only."
          />
          <Field
            label="Slug"
            name="slug"
            defaultValue={data.slug}
            hint="Permanent once published — changing it breaks existing links."
          />
        </section>

        <Field
          label="Title"
          name="title"
          defaultValue={data.title}
          error={state.fieldErrors?.title}
          hint="How this entry is listed. Defaults to “Role at Organization”."
          required
        />

        <div>
          <label
            htmlFor="question"
            className="block text-small font-medium text-ink"
          >
            The question that created it
          </label>
          <p className="mt-1 text-micro text-faint">
            Required before publishing (LAW-003). What were you actually trying
            to find out or build here?
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

        <div>
          <label
            htmlFor="summary"
            className="block text-small font-medium text-ink"
          >
            Summary
          </label>
          <p className="mt-1 text-micro text-faint">
            One line: what this produced. Not a job description.
          </p>
          <Textarea
            id="summary"
            name="summary"
            rows={2}
            defaultValue={data.summary}
            className="mt-2"
          />
        </div>

        <div>
          <label
            htmlFor="highlights"
            className="block text-small font-medium text-ink"
          >
            Highlights
          </label>
          <p className="mt-1 text-micro text-faint">
            One per line. Prefer the evidenced detail over the adjective.
          </p>
          <Textarea
            id="highlights"
            name="highlights"
            rows={5}
            defaultValue={data.highlights.join("\n")}
            className="mt-2 font-mono text-small"
          />
        </div>

        <label className="flex items-center gap-2 text-small text-muted">
          <input
            type="checkbox"
            name="verified"
            value="true"
            defaultChecked={data.verified}
          />
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
        publishAction={publishTimelineEntry}
        unpublish={unpublishTimelineEntry}
        archive={archiveTimelineEntry}
        noun="entry"
      />
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  hint,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-small font-medium text-ink">
        {label}
        {required && <span className="ml-1 text-faint">*</span>}
      </label>
      {hint && <p className="mt-1 text-micro text-faint">{hint}</p>}
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="mt-2"
      />
      {error && <p className="mt-1 text-micro text-danger">{error}</p>}
    </div>
  );
}
