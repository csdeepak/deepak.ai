"use client";

import { useEffect } from "react";
import { pointerRef } from "../shared/refs";

/**
 * Pointer Bridge (docs/22 §6): pointer position → normalized ref,
 * read by the parallax head in useFrame. Touch input is ignored —
 * parallax is desktop-only (docs/17 §4); no gyro, ever.
 */
export function usePointerBridge(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, [enabled]);
}
