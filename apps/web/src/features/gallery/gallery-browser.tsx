"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryPhoto } from "../../../content/gallery";

/**
 * Gallery browser (D-056) — grid plus detail view.
 *
 * Motion decisions, all on the design system's own tokens:
 *
 *  · Grid → detail uses a shared-element zoom via the View Transitions API,
 *    so the tile you clicked *becomes* the detail image. That is motion
 *    carrying meaning ("this is the same object"), not decoration.
 *  · Metadata is sequenced AFTER the image settles rather than arriving with
 *    it. Simultaneous arrival is the clearest amateur tell; a beat of delay
 *    creates hierarchy.
 *  · Next/previous slide directionally on --ease-arc, the energy easing, so
 *    the motion tells you where you moved in the sequence.
 *
 * Everything degrades: without View Transitions the detail view simply opens,
 * and under reduced motion nothing animates at all.
 */

type Direction = 1 | -1;

function startViewTransition(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || typeof doc.startViewTransition !== "function") {
    update();
    return;
  }
  doc.startViewTransition(update);
}

export function GalleryBrowser({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction>(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  /** The grid button that opened the detail view, so focus can return to it. */
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const open = useCallback(
    (id: string) => {
      const index = photos.findIndex((p) => p.id === id);
      if (index < 0) return;
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      startViewTransition(() => setOpenIndex(index));
    },
    [photos],
  );

  const close = useCallback(() => {
    startViewTransition(() => setOpenIndex(null));
    // Send focus back where it came from, so keyboard users are not dumped
    // at the top of the document.
    returnFocusRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta: Direction) => {
      setDirection(delta);
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + photos.length) % photos.length;
      });
    },
    [photos.length],
  );

  // Deep link: /gallery#g03 opens that photo directly. Mount-only — re-running
  // this on every render would fight the visitor's own navigation.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) open(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (!["Escape", "ArrowRight", "ArrowLeft"].includes(event.key)) return;
      // Without this the arrows also scroll the page behind the overlay and
      // Escape can bubble to other handlers.
      event.preventDefault();

      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Move focus into the dialog: required for a modal, and it stops key
    // presses being delivered to the grid button underneath.
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, step]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      {/* One continuous cluster. No date headers while scrolling — dates belong
       * to the photo, and appear when you select one. */}
      <div className="gallery-cluster">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            id={photo.id}
            type="button"
            onClick={() => open(photo.id)}
            style={{
              ["--ar" as string]: photo.aspectRatio.toFixed(3),
              ["--size" as string]: photo.size,
              ["--tilt" as string]: `${photo.tilt}deg`,
              ["--depth" as string]: photo.depth,
              ["--i" as string]: index % 12,
            }}
            className="gallery-photo focus-ring"
            aria-label={photo.caption || photo.alt || `Open photo ${photo.id}`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              // See gallery-strip: an accurate sizes hint stops the optimiser
              // upscaling the 900px source to 3840px.
              sizes="(max-width: 48rem) 50vw, 33vw"
              style={
                openIndex === null
                  ? { viewTransitionName: `photo-${photo.id}` }
                  : undefined
              }
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="fixed inset-0 z-(--z-overlay) flex flex-col bg-canvas/97 outline-none backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || "Photo detail"}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="font-mono text-micro text-faint">
              {openIndex! + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              className="rounded-md p-2 text-faint transition-colors duration-(--duration-fast) hover:bg-surface hover:text-ink"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute left-2 z-10 rounded-full border border-border bg-surface/80 p-2 text-muted backdrop-blur transition-colors hover:text-ink md:left-6"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>

            <Image
              key={active.id}
              src={active.fullSrc}
              alt={active.alt}
              width={active.width}
              height={active.height}
              placeholder="blur"
              blurDataURL={active.blurDataURL}
              sizes="100vw"
              className={cn(
                "max-h-full w-auto max-w-full rounded-md object-contain",
                direction === 1 ? "gallery-enter-right" : "gallery-enter-left",
              )}
              style={{ viewTransitionName: `photo-${active.id}` }}
              priority
            />

            <button
              type="button"
              onClick={() => step(1)}
              className="absolute right-2 z-10 rounded-full border border-border bg-surface/80 p-2 text-muted backdrop-blur transition-colors hover:text-ink md:right-6"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>

          {/* Metadata arrives AFTER the image settles — sequencing creates hierarchy. */}
          <div className="gallery-meta px-5 py-6 md:px-10">
            <div className="mx-auto max-w-3xl">
              {active.caption ? (
                <p className="text-body text-ink">{active.caption}</p>
              ) : (
                <p className="text-body text-faint">No caption yet.</p>
              )}

              {active.info && (
                <p className="mt-2 text-small text-muted">{active.info}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-micro text-muted">
                {active.date && <span>{active.date}</span>}
                {active.time && <span>{active.time}</span>}
                {active.place && <span>{active.place}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
