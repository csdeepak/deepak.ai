"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/**
 * Ambient sound toggle — a PLACEHOLDER for the future sound layer
 * (bible §7.6): off by default, preference persisted, physical/mechanical
 * sound not yet wired. It exists now so the seam and the affordance are
 * real; enabling audio later is a change behind this control, not a new
 * surface. Honest label: "coming soon" until the layer ships.
 */
const KEY = "dl-ambient-sound";

export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOn(localStorage.getItem(KEY) === "1");
    setReady(true);
  }, []);

  const toggle = () => {
    setOn((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title="Ambient sound — coming soon"
      className={`inline-flex items-center gap-2 text-faint transition-colors duration-(--duration-fast) hover:text-muted ${
        className ?? ""
      }`}
    >
      {on ? (
        <Volume2 className="size-4" aria-hidden />
      ) : (
        <VolumeX className="size-4" aria-hidden />
      )}
      <span className="font-mono text-micro">
        {ready && on ? "sound on" : "sound"}
      </span>
    </button>
  );
}
