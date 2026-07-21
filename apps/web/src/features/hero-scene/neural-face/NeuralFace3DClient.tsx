"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { decideTier } from "../gate";
import { REGION_VH, BEAT } from "./constants";
import { isHeroFace3D, type HeroFace3D } from "./types";
import { siteContent } from "../../../../content/site";

/**
 * NeuralFace3DClient — the D-052 Track 2 hero region.
 *
 * Fallback ladder (LAW-008, non-negotiable):
 *   1. The poster (`hero-face-poster.webp`) is the LCP element — server-
 *      rendered inside this region (a client component still emits its markup
 *      on the server), visible before any WebGL executes, copy overlaid.
 *   2. The 3D scene mounts client-only via next/dynamic({ ssr:false }), gated
 *      on IntersectionObserver + requestIdleCallback, AFTER first paint.
 *   3. reduced-motion, no WebGL2 / low tier, or context-loss ⇒ the Canvas is
 *      never mounted (or is torn down) and the poster stays as the hero.
 *
 * Scroll: native window scroll over the ~400vh sticky region → `offsetRef`
 * (0..1). No scroll-jack; the sections below keep flowing.
 */

// three/drei/postprocessing/meshline live entirely in this lazy chunk.
const NeuralFace3DScene = dynamic(() => import("./NeuralFace3DScene"), {
  ssr: false,
});

/** The four owner-ratified beat sub-lines (must match arrival.tsx). */
const SUBLINES = [
  "Me, rendered as a network of the work.",
  "Systems, memory, and the questions between them.",
  "Everything here is real, or it isn't shown.",
  "Keep scrolling — the work comes first.",
] as const;

function sublineFor(off: number): string {
  if (off < BEAT.faceEnd) return SUBLINES[0];
  if (off < BEAT.diveEnd) return SUBLINES[1];
  if (off < 0.9) return SUBLINES[2];
  return SUBLINES[3];
}

export default function NeuralFace3DClient() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const offsetRef = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<HeroFace3D | null>(null);
  const [tier, setTier] = useState<0 | 1 | 2>(0);

  // Gate: decide tier, then (if eligible) idle+intersection → fetch → mount.
  useEffect(() => {
    const { tier: t, reducedMotion } = decideTier();
    setTier(t);
    if (reducedMotion || t === 0) return; // poster stays, permanently

    const section = sectionRef.current;
    if (!section) return;

    let started = false;
    const controller = new AbortController();
    const ric: (cb: () => void) => void =
      typeof window.requestIdleCallback === "function"
        ? (cb) => window.requestIdleCallback(cb, { timeout: 1200 })
        : (cb) => window.setTimeout(cb, 200);

    const io = new IntersectionObserver(
      (entries) => {
        if (started || !(entries[0]?.isIntersecting ?? false)) return;
        started = true;
        io.disconnect();
        ric(() => {
          fetch("/hero-face-3d.json", { signal: controller.signal })
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error("404"))))
            .then((json) => {
              if (isHeroFace3D(json)) {
                setData(json);
                setMounted(true);
              }
            })
            .catch(() => {
              /* graceful absence — poster stays */
            });
        });
      },
      { rootMargin: "200px" },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      controller.abort();
    };
  }, []);

  // Native-scroll → offsetRef + direct DOM copy fade (no React re-renders).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    let lastSub = "";
    const tick = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const off = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      offsetRef.current = off;
      if (copyRef.current) {
        copyRef.current.style.opacity = String(
          1 - Math.min(1, off / BEAT.copyFadeOut),
        );
      }
      if (sublineRef.current) {
        const s = sublineFor(off);
        if (s !== lastSub) {
          sublineRef.current.textContent = s;
          lastSub = s;
        }
      }
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${REGION_VH}vh` }}
      className="relative bg-[#0A0B0D]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* (1) Poster — the LCP element. Real render of the real data. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-face-poster.webp"
          srcSet="/hero-face-poster-sm.webp 720w, /hero-face-poster.webp 1440w"
          sizes="100vw"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* (2) The 3D scene mounts over the poster once eligible + idle. */}
        {mounted && data && (
          <NeuralFace3DScene
            data={data}
            tier={tier}
            offsetRef={offsetRef}
            onLost={() => setMounted(false)}
          />
        )}

        {/* (3) Copy overlay — DOM, always present, fades out during the dive. */}
        <Container
          width="content"
          className="pointer-events-none relative z-10 flex h-svh flex-col justify-end pb-[12svh] [&_a]:pointer-events-auto md:pb-[14svh]"
        >
          <div ref={copyRef} className="animate-entrance">
            <p className="font-mono text-micro text-faint">{siteContent.name}</p>
            {siteContent.identitySentence && (
              <h1 className="mt-4 max-w-[18ch] text-hero font-display font-semibold text-ink">
                {siteContent.identitySentence}
              </h1>
            )}
            {siteContent.identitySupport && (
              <p className="mt-5 max-w-[52ch] text-lead text-muted">
                {siteContent.identitySupport}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/projects" className="cta-pill cta-pill--energy">
                See the work
              </Link>
              <Link
                href="/projects/asmos"
                className="text-body text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Read the memory
              </Link>
            </div>
          </div>

          {/* Beat sub-line — fixed slot, updated directly on scroll. */}
          <p
            ref={sublineRef}
            className="mt-8 h-6 max-w-[46ch] text-body text-muted"
          >
            {SUBLINES[0]}
          </p>
        </Container>
      </div>
    </section>
  );
}
