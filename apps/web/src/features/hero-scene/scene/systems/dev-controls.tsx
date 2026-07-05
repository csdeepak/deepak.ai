"use client";

import { Leva, useControls } from "leva";
import { useEffect } from "react";
import { useHeroStore } from "../../shared/hero-store";

/**
 * Dev controls (Leva) — DEVELOPMENT ONLY. The import site in
 * HeroSceneRegion is guarded by a literal NODE_ENV check, so this
 * module (and leva) is dead-code-eliminated from production bundles.
 */
export default function DevControls() {
  const setDebug = useHeroStore((s) => s.setDebug);
  const quality = useHeroStore((s) => s.quality);
  const tier = useHeroStore((s) => s.tier);
  const act = useHeroStore((s) => s.act);

  const values = useControls("hero-scene", {
    keyIntensity: { value: 2.2, min: 0, max: 6, step: 0.1 },
    shedNext: { value: false },
    restore: { value: false },
  });

  useEffect(() => {
    setDebug({ keyIntensity: values.keyIntensity });
  }, [values.keyIntensity, setDebug]);

  useEffect(() => {
    if (values.shedNext) useHeroStore.getState().shedQuality();
  }, [values.shedNext]);
  useEffect(() => {
    if (values.restore) useHeroStore.getState().restoreQuality();
  }, [values.restore]);

  return (
    <>
      <Leva collapsed titleBar={{ title: `hero t${tier} act${act}` }} />
      <div className="pointer-events-none absolute left-6 top-24 z-20 font-mono text-micro text-faint">
        q: {Object.entries(quality)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(" ") || "none"}
      </div>
    </>
  );
}
