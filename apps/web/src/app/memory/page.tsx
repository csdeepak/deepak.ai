import type { Metadata } from "next";
import { LivingMemory } from "@/features/memory/experience";
import { asmosMemory } from "../../../content/asmos";

/**
 * /memory — the Living Memory vertical slice (docs/26). One complete
 * experience: arrival → the graph is navigation → recall a memory (it
 * reconstructs) → Dex (grounded) → exit, with the 90-second brief always
 * reachable. Rendered outside the (site) chrome group — immersive, its
 * own header and main.
 */
export const metadata: Metadata = {
  title: "ASMOS — a memory, reconstructed",
  description:
    "Explore the Living Memory: a research memory reconstructed from the question it began with to the work it became.",
};

export default function MemoryPage() {
  return <LivingMemory memory={asmosMemory} />;
}
