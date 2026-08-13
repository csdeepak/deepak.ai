import { marked } from "marked";

/**
 * Server-only markdown → HTML. `marked` passes raw HTML in the source
 * through unsanitized (standard CommonMark behaviour) — acceptable here
 * because `bodyMarkdown` is owner-authored through admin, never untrusted
 * user input. Never import this from a `"use client"` file — it must stay
 * out of the public bundle.
 */
export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}
