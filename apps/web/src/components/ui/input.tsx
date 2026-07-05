import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * Input — docs/15 §6: recessed surface + hairline, radius.sm, 16px+
 * text (mobile zoom). Labels are always visible above the field —
 * placeholder-as-label is banned (DSVL Law 11); compose with a
 * <label> in Form patterns.
 */
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-sm border border-border bg-recessed px-3 text-body text-ink placeholder:text-faint disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-sm border border-border bg-recessed px-3 py-2 text-body text-ink placeholder:text-faint disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
