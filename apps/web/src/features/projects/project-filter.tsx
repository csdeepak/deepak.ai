"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tag filter for the Work index.
 *
 * ## Why it filters the DOM instead of re-rendering a list
 *
 * The obvious implementation passes the projects array into a client component
 * and filters it in state. That would serialise every project — including the
 * full `problem` paragraph the card clamps — into the RSC payload, so each one
 * ships twice: once as server-rendered HTML and again as props. For nine
 * projects with paragraph-length descriptions that roughly doubles the page's
 * transfer to buy a filter.
 *
 * Instead the cards stay server-rendered and this component toggles `hidden`
 * on the list items it is given by ref. Nothing about a project crosses the
 * boundary; the only state is which tag is selected.
 *
 * ## No-JS behaviour
 *
 * Without JavaScript the chips never render and every card is visible, which
 * is the correct unfiltered state rather than a broken control. The cards are
 * in the HTML either way, so search engines and a reader with JS disabled see
 * the complete list.
 */
export function ProjectFilter({
  tags,
  /** id of the <ul> whose <li> children carry `data-project-tags`. */
  listId,
}: {
  tags: string[];
  listId: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState<number | null>(null);
  const listRef = useRef<HTMLElement | null>(null);

  const apply = useCallback(
    (tag: string | null) => {
      const list =
        listRef.current ?? (listRef.current = document.getElementById(listId));
      if (!list) return;

      let shown = 0;
      for (const item of Array.from(list.children)) {
        if (!(item instanceof HTMLElement)) continue;
        const itemTags = (item.dataset.projectTags ?? "").split("|");
        const matches = tag === null || itemTags.includes(tag);
        item.hidden = !matches;
        if (matches) shown += 1;
      }
      setVisible(shown);
    },
    [listId],
  );

  // Re-apply when the selection changes. Also runs on mount with `null`, which
  // is a no-op on a list that starts fully visible — but it means the filter
  // cannot desync from the DOM if the list is ever re-rendered.
  useEffect(() => {
    apply(active);
  }, [active, apply]);

  if (tags.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-micro uppercase tracking-[0.14em] text-faint">
          Filter
        </span>

        <FilterChip
          label="All"
          selected={active === null}
          onSelect={() => setActive(null)}
        />
        {tags.map((tag) => (
          <FilterChip
            key={tag}
            label={tag}
            selected={active === tag}
            onSelect={() => setActive(active === tag ? null : tag)}
          />
        ))}
      </div>

      {/* Announced, not just shown — a filter that silently removes cards is
          disorienting to a screen-reader user who cannot see the grid shrink. */}
      <p aria-live="polite" className="mt-3 text-small text-faint">
        {active === null
          ? null
          : `${visible ?? 0} project${visible === 1 ? "" : "s"} tagged ${active}`}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-small",
        "transition-colors duration-(--duration-fast)",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "border-accent bg-accent text-on-accent"
          : "border-border text-muted hover:border-border-emphasis hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
