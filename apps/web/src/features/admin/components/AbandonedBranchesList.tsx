"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Branch {
  tried: string;
  whyAbandoned: string;
  learned: string;
}

interface Props {
  initial: Branch[];
  onChange: (branches: Branch[]) => void;
}

const empty: Branch = { tried: "", whyAbandoned: "", learned: "" };

export function AbandonedBranchesList({ initial, onChange }: Props) {
  const [branches, setBranches] = useState<Branch[]>(initial);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Branch>(empty);

  function commit(updated: Branch[]) {
    setBranches(updated);
    onChange(updated);
  }

  function handleAdd() {
    if (!draft.tried.trim()) return;
    commit([...branches, draft]);
    setDraft(empty);
    setAdding(false);
  }

  function handleRemove(i: number) {
    commit(branches.filter((_, idx) => idx !== i));
  }

  function handleEdit(i: number, field: keyof Branch, value: string) {
    commit(branches.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));
  }

  return (
    <div className="flex flex-col gap-3">
      {branches.map((b, i) => (
        <div
          key={i}
          className="rounded-md border border-border bg-recessed p-3 text-small"
        >
          <Field
            label="What I tried"
            value={b.tried}
            onChange={(v) => handleEdit(i, "tried", v)}
          />
          <Field
            label="Why I abandoned it"
            value={b.whyAbandoned}
            onChange={(v) => handleEdit(i, "whyAbandoned", v)}
          />
          <Field
            label="What it taught"
            value={b.learned}
            onChange={(v) => handleEdit(i, "learned", v)}
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="mt-1 text-micro text-danger hover:underline"
          >
            Remove
          </button>
        </div>
      ))}

      {adding ? (
        <div className="rounded-md border border-border bg-recessed p-3 text-small">
          <Field
            label="What I tried"
            value={draft.tried}
            onChange={(v) => setDraft((d) => ({ ...d, tried: v }))}
            autoFocus
          />
          <Field
            label="Why I abandoned it"
            value={draft.whyAbandoned}
            onChange={(v) => setDraft((d) => ({ ...d, whyAbandoned: v }))}
          />
          <Field
            label="What it taught"
            value={draft.learned}
            onChange={(v) => setDraft((d) => ({ ...d, learned: v }))}
          />
          <div className="mt-2 flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
              Add branch
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setAdding(false); setDraft(empty); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setAdding(true)}
          className="self-start text-muted"
        >
          + Add abandoned branch
        </Button>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="mb-2 flex flex-col gap-1">
      <span className="text-micro text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        rows={2}
        className="w-full rounded border border-border bg-surface px-2 py-1.5 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}
