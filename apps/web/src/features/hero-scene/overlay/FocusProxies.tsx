"use client";

import { useHeroStore } from "../shared/hero-store";
import { PLACEHOLDER_NODES } from "../shared/constants";

/**
 * Focus Proxies (docs/22 §12): one real DOM button per interactive
 * scene object, positioned from anchors computed at rail rest-points.
 * Keyboard users get full traversal + the guided camera (focus drives
 * the rail's aim). The canvas itself is aria-hidden decoration.
 */
export function FocusProxies() {
  const anchors = useHeroStore((s) => s.anchors);
  const setFocusedNode = useHeroStore((s) => s.setFocusedNode);
  const focusedNode = useHeroStore((s) => s.focusedNode);

  return (
    <nav aria-label="Scene objects" className="absolute inset-0">
      {PLACEHOLDER_NODES.map((node) => {
        const anchor = anchors[node.id];
        if (!anchor?.visible) return null;
        return (
          <button
            key={node.id}
            type="button"
            aria-label={node.label}
            aria-pressed={focusedNode === node.id}
            onFocus={() => setFocusedNode(node.id)}
            onClick={() => setFocusedNode(node.id)}
            className="pointer-events-auto absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ left: anchor.x, top: anchor.y }}
          />
        );
      })}
    </nav>
  );
}
