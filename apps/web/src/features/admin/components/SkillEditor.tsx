"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import {
  saveSkill,
  publishSkill,
  unpublishSkill,
  archiveSkill,
  type SkillFormState,
} from "@/features/admin/actions/skills";
import { ContentPublishBar } from "./ContentPublishBar";
import { AdminField } from "./AdminField";
import type { ContentStatus } from "@/types/content";

export interface SkillEditorData {
  id: string;
  slug: string;
  title: string;
  question: string;
  context: string;
  category: string;
  current: boolean;
  sinceYear: number | null;
  verified: boolean;
  status: ContentStatus;
}

const initial: SkillFormState = { error: null };

export function SkillEditor({ data }: { data: SkillEditorData }) {
  const [state, formAction, pending] = useActionState(saveSkill, initial);
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

        <p className="max-w-[64ch] rounded-md border border-border bg-surface p-4 text-small text-muted">
          Entering a skill here <strong className="text-ink">enriches</strong> it
          on <code className="font-mono text-micro">/skills</code> rather than
          replacing anything. Skills already derived from your project tags keep
          appearing with their evidence links whether or not they exist here —
          this adds the context, category and Currently/Previously split that the
          derived list cannot know.
        </p>

        <AdminField
          label="Skill"
          name="title"
          defaultValue={data.title}
          error={state.fieldErrors?.title}
          hint="Match the spelling used in project tags so the two merge cleanly."
          required
        />

        <section className="grid gap-5 sm:grid-cols-2">
          <AdminField
            label="Category"
            name="category"
            defaultValue={data.category}
            hint="e.g. Languages, ML, Infrastructure."
          />
          <AdminField
            label="Since year"
            name="sinceYear"
            type="number"
            defaultValue={data.sinceYear ? String(data.sinceYear) : ""}
            hint="Optional."
          />
          <AdminField
            label="Slug"
            name="slug"
            defaultValue={data.slug}
            hint="Permanent once published."
          />
        </section>

        <AdminField
          label="Context"
          name="context"
          defaultValue={data.context}
          hint="One line: what you're actually using it for. Concrete beats adjective."
          textarea
          rows={2}
        />

        <div>
          <label htmlFor="question" className="block text-small font-medium text-ink">
            The question that created it
          </label>
          <p className="mt-1 text-micro text-faint">
            Required before publishing (LAW-003). What did learning this let you build?
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

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-small text-muted">
            <input
              type="checkbox"
              name="current"
              value="true"
              defaultChecked={data.current}
            />
            Currently using this — unchecked moves it to Previously
          </label>
          <label className="flex items-center gap-2 text-small text-muted">
            <input
              type="checkbox"
              name="verified"
              value="true"
              defaultChecked={data.verified}
            />
            Verified — the facts here have been checked
          </label>
        </div>

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save draft"}
        </Button>
      </form>

      <ContentPublishBar
        id={data.id}
        status={data.status}
        question={question}
        publishAction={publishSkill}
        unpublish={unpublishSkill}
        archive={archiveSkill}
        noun="skill"
      />
    </div>
  );
}
