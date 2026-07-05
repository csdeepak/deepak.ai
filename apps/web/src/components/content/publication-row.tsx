import Link from "next/link";
import type { Publication } from "@/types/content";

/**
 * PublicationRow — Row-family variant (docs/15 §6). Publications are
 * rows, not cards (docs/04 §5): dense, scannable, citation-adjacent.
 * Inline actions (copy-cite, PDF) land with the publications sprint.
 */
export function PublicationRow({ publication }: { publication: Publication }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-4">
      <div>
        <h3 className="text-body font-medium">
          <Link href={`/publications/${publication.slug}`}>
            {publication.title}
          </Link>
        </h3>
        <p className="mt-1 text-small text-muted">
          {publication.authors.join(", ")} · {publication.venue}
        </p>
      </div>
      <span className="font-mono text-small tabular text-faint">
        {publication.year}
      </span>
    </div>
  );
}
