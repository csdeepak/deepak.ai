"use client";

import { useActionState } from "react";
import { saveSiteSettings, type SettingsFormState } from "@/features/admin/actions/site-settings";
import { Button } from "@/components/ui/button";

const initial: SettingsFormState = { error: null };

const inputCls =
  "h-9 w-full rounded border border-border bg-surface px-3 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";

interface Props {
  settings: Record<string, unknown>;
}

export function SettingsEditor({ settings }: Props) {
  const [state, action, pending] = useActionState(saveSiteSettings, initial);

  function str(key: string): string {
    const v = settings[key];
    return typeof v === "string" ? v : "";
  }

  function outboundStr(key: string): string {
    const ob = settings["outbound"] as Record<string, string> | undefined;
    return ob?.[key] ?? "";
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {state.error && <p className="text-small text-danger">{state.error}</p>}
      {state.saved && <p className="text-small text-success">Saved.</p>}

      <Section title="Identity">
        <Field label="Identity sentence" name="identitySentence" defaultValue={str("identitySentence")} />
        <Field label="Identity support line" name="identitySupport" defaultValue={str("identitySupport")} />
        <Field label="Current focus" name="currentFocus" defaultValue={str("currentFocus")} />
        <Field label="Current focus updated at" name="currentFocusUpdatedAt" type="date" defaultValue={str("currentFocusUpdatedAt")} />
      </Section>

      <Section title="Mission">
        <Field label="Mission copy" name="mission" defaultValue={str("mission")} textarea />
      </Section>

      <Section title="Contact">
        <Field label="Contact sentence" name="contactSentence" defaultValue={str("contactSentence")} />
        <Field label="Contact email" name="contactEmail" type="email" defaultValue={str("contactEmail")} />
      </Section>

      <Section title="Outbound links">
        <Field label="GitHub URL" name="outbound.github" type="url" defaultValue={outboundStr("github")} />
        <Field label="LinkedIn URL" name="outbound.linkedin" type="url" defaultValue={outboundStr("linkedin")} />
        <Field label="X (Twitter) URL" name="outbound.x" type="url" defaultValue={outboundStr("x")} />
        <Field label="Instagram URL" name="outbound.instagram" type="url" defaultValue={outboundStr("instagram")} />
        <Field label="Google Scholar URL" name="outbound.scholar" type="url" defaultValue={outboundStr("scholar")} />
      </Section>

      <Section title="Documents">
        <Field label="CV URL" name="cvUrl" type="url" defaultValue={str("cvUrl")} />
      </Section>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        <a
          href="/admin/settings/versions"
          className="text-small text-muted hover:text-ink hover:underline"
        >
          Version history →
        </a>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-small font-semibold text-ink">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-small font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          className="w-full resize-y rounded border border-border bg-surface px-3 py-2 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} className={inputCls} />
      )}
    </label>
  );
}
