"use client";

import { Plus, X } from "lucide-react";

/**
 * A structured add/remove-row editor for a list of strings (D-048 — no
 * comma-string hacks for the new list fields). Controlled: the parent owns the
 * array and serializes it into a hidden input for the Server Action.
 */
export function StringListEditor({
  items,
  onChange,
  placeholder,
  addLabel = "Add",
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}) {
  function update(i: number, value: string) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="h-9 flex-1 rounded border border-border bg-surface px-2.5 text-small text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove"
            className="grid size-9 place-items-center rounded border border-border text-faint hover:text-danger"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 self-start text-small text-muted hover:text-ink"
      >
        <Plus className="size-4" aria-hidden />
        {addLabel}
      </button>
    </div>
  );
}
