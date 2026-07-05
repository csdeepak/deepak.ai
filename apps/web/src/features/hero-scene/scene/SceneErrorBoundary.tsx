"use client";

import { Component, type ReactNode } from "react";
import { useHeroStore } from "../shared/hero-store";

/**
 * Scene error boundary (docs/22 §14): the tier ladder as error
 * architecture. Any render/runtime failure inside the canvas resolves
 * to Tier 0 silently — the DOM page was always complete underneath.
 * "The ceiling disappears; the room remains." Errors log to ops;
 * nothing is ever shown.
 */
export class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error) {
    // Ops logging hook (error-tracking tool ratified with docs/10).
    console.error("[hero-scene] canvas failed — resolving to Tier 0", error);
    useHeroStore.getState().failCanvas();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}
