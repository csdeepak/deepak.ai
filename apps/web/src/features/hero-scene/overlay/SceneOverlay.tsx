"use client";

import { useHeroStore } from "../shared/hero-store";
import { FocusProxies } from "./FocusProxies";

/**
 * Scene Overlay (docs/22 §3, §12): the DOM layer above the canvas.
 * All captions exist in document order regardless of act (the "whole
 * tour audible" guarantee); the current act's caption is the one
 * visually emphasized. Copy here is STRUCTURAL PLACEHOLDER — real
 * captions are data-driven (true counts) and land with content.
 */
const ACT_CAPTIONS = [
  "", // Act I — the hero identity (DOM) already carries this beat
  "Placeholder: constellation caption (real counts land with content)",
  "Placeholder: workbench caption (current focus, R5 rule)",
  "Placeholder: introduction caption (Dex, v1.5)",
  "", // Act V — handoff; the page below takes over
] as const;

export function SceneOverlay() {
  const act = useHeroStore((s) => s.act);
  const hoveredNode = useHeroStore((s) => s.hoveredNode);

  return (
    <div className="pointer-events-none absolute inset-0">
      <FocusProxies />

      {/* Act captions — all in DOM, current one shown */}
      <div className="absolute bottom-10 left-6 max-w-sm sm:left-12 md:left-16">
        {ACT_CAPTIONS.map((caption, i) =>
          caption ? (
            <p
              key={i}
              className={
                i === act
                  ? "text-small text-muted"
                  : "sr-only" /* present for AT, visually act-gated */
              }
            >
              {caption}
            </p>
          ) : null,
        )}
      </div>

      {/* Hover label — DOM, never in-canvas (text law) */}
      {hoveredNode && (
        <p
          aria-live="polite"
          className="absolute right-6 top-24 font-mono text-micro text-faint sm:right-12"
        >
          {hoveredNode}
        </p>
      )}
    </div>
  );
}
