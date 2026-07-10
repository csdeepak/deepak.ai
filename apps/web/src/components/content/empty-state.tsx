import { cn } from "@/lib/utils";

/**
 * EmptyState — the honesty engine, made visible (LAW-008, docs/24 §Honesty).
 * An empty shelf beats a fabricated one: index pages render this designed,
 * unashamed empty state instead of hiding or faking content. It is a
 * legitimate resting state, not an error — quiet, hairline-framed, calm.
 */
export function EmptyState({
  title,
  body,
  className,
}: {
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center theme-surface",
        className,
      )}
    >
      <p className="text-body font-medium text-muted">{title}</p>
      {body && (
        <p className="mx-auto mt-3 max-w-[52ch] text-small text-faint">{body}</p>
      )}
    </div>
  );
}
