import { Fragment } from "react";

/**
 * Renders `backtick` spans in a plain-text field as real <code> (D-071).
 *
 * Project prose is plain text, not markdown, but it is written by an engineer
 * and names commands the way engineers do — HandCode's opens "An agent runs
 * `git commit`." Rendered raw, the backticks showed as literal characters in
 * the first line of the landing's first card. This handles exactly that one
 * convention and nothing else: an unmatched backtick stays a backtick, and no
 * other markdown is interpreted, so it can never turn prose into markup.
 */
export function InlineCode({ text }: { text: string }) {
  const parts = text.split(/`([^`\n]+)`/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="font-mono text-[0.9em] text-ink">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
