"use client";

import { useEffect, useRef } from "react";
import { NeuralFaceRenderer } from "./renderer";
import { isHeroFaceData } from "./types";

/**
 * <NeuralFaceHero /> — the Canvas2D particle-portrait hero (D-050 Track 1).
 *
 * Atmosphere behind the ratified hero copy: a dim constellation of the
 * owner's face with sparse edges, a rare travelling pulse, and pointer
 * parallax. The copy stays the anchor.
 *
 * Contracts:
 *   • SSR-safe — renders a stable empty shell; no browser globals at
 *     module scope or during render (no hydration mismatch).
 *   • Data is FETCHED, never imported — `hero-face.json` never enters the
 *     JS bundle. Missing/failed data ⇒ renders nothing (graceful absence,
 *     LAW-008): the hero copy stands alone, no spinner, no broken chrome.
 *   • `prefers-reduced-motion` ⇒ exactly one static frame, no rAF loop.
 *   • Loop pauses off-viewport (IntersectionObserver) and on hidden tab.
 *   • Decorative: `aria-hidden`.
 */
export function NeuralFaceHero() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let renderer: NeuralFaceRenderer | null = null;
    let inView = true;
    let pageVisible = !document.hidden;
    let reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controller = new AbortController();
    let resizeTimer = 0;
    let disposed = false;
    let staticDrawn = false; // reduced-motion: exactly one static frame

    const applyRunState = () => {
      if (!renderer) return;
      if (reduced) {
        renderer.stop();
        if (!staticDrawn) {
          renderer.renderStatic();
          staticDrawn = true;
        }
        return;
      }
      if (inView && pageVisible) renderer.start();
      else renderer.stop();
    };

    const doResize = () => {
      if (!renderer || !wrapper) return;
      renderer.resize(wrapper.clientWidth, wrapper.clientHeight);
      // Under reduced motion a resize re-draws the single static frame.
      if (reduced) renderer.renderStatic();
    };

    // ── Listeners (all torn down in cleanup) ──────────────────────────
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(doResize, 150);
    };

    const onPointer = (e: PointerEvent) => {
      if (!renderer) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      renderer.setPointer(nx, ny);
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      applyRunState();
    };

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPref = () => {
      reduced = mql.matches;
      applyRunState();
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        applyRunState();
      },
      { rootMargin: "10%" },
    );

    // ── Load the data (fetch only — never bundled) ────────────────────
    fetch("/hero-face.json", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((json) => {
        if (disposed || !isHeroFaceData(json)) return;
        renderer = new NeuralFaceRenderer(canvas);
        renderer.setData(json);
        renderer.resize(wrapper.clientWidth, wrapper.clientHeight);

        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("visibilitychange", onVisibility);
        if (mql.addEventListener) mql.addEventListener("change", onMotionPref);
        if (!reduced) {
          window.addEventListener("pointermove", onPointer, { passive: true });
        }
        io.observe(wrapper);

        applyRunState();
      })
      .catch(() => {
        // Graceful absence: leave the shell empty, hero copy stands alone.
      });

    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      if (mql.removeEventListener)
        mql.removeEventListener("change", onMotionPref);
      io.disconnect();
      renderer?.destroy();
      renderer = null;
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
