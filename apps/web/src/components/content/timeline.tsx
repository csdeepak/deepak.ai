import type { TimelineEntry } from "@/types/content";

/**
 * Timeline — the signature list (docs/15 §6): drawn line (aria-hidden)
 * + real <ol> semantics. Scaffold: the SVG draw-in (docs/08 draw-in
 * recipe, GSAP) and one-open accordion land with the timeline sprint.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative border-l border-border pl-6">
      {entries.map((entry) => (
        <li key={entry.slug} className="relative pb-8">
          {/* node dot */}
          <span
            aria-hidden
            className="absolute -left-[1.8125rem] top-1.5 size-2.5 rounded-full border border-border-emphasis bg-canvas"
          />
          <h3 className="text-body font-medium">
            {entry.role} · {entry.organization}
          </h3>
          <p className="font-mono text-micro tabular text-faint">
            {entry.startDate} — {entry.endDate ?? "present"}
          </p>
          <p className="mt-1 text-small text-muted">{entry.summary}</p>
        </li>
      ))}
    </ol>
  );
}
