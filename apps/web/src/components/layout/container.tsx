import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type ContainerWidth = "reading" | "content" | "wide" | "narrow";

const widthClass: Record<ContainerWidth, string> = {
  reading: "max-w-reading",
  content: "max-w-content",
  wide: "max-w-wide",
  narrow: "max-w-narrow",
};

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Container width per docs/15 §2.3. Defaults to `content` (1200). */
  width?: ContainerWidth;
}

/** Centered content container with responsive viewport margins. */
export function Container({
  width = "content",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-12 md:px-16",
        widthClass[width],
        className,
      )}
      {...props}
    />
  );
}
