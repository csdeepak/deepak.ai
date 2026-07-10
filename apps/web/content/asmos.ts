/**
 * ⚠ DRAFT SCAFFOLD — the ASMOS memory.
 *
 * This proves the RECONSTRUCTION FORMAT for the vertical slice. The
 * thinking-shape is representative; it must be REPLACED with Deepak's
 * real ASMOS content before any deploy. Per the honesty spine (docs/26
 * §9): NO metric, benchmark, result, or publication here is fabricated —
 * Results and Publication render as honest in-progress states, not
 * invented outcomes. Swapping in the real memory is a content edit only.
 */
import type { Memory, MemoryEdge, MemoryNode } from "@/features/memory/types";

export const asmosMemory: Memory = {
  id: "asmos",
  title: "ASMOS",
  kind: "Memory · Research",
  oneLine:
    "A structured memory architecture that lets agents remember with the shape of what they learned — not just a pile of vectors.",
  gist: {
    problem:
      "Agents forget. Flat vector stores retrieve fragments but lose the structure — the why, the order, the connections — that made knowledge useful.",
    approach:
      "A graph-structured, self-organising memory: episodes consolidate into semantic structure over time, and recall reconstructs context, not just chunks.",
    status: "In active development — architecture stable, evaluation in progress, manuscript in preparation.",
    role: "Sole researcher and engineer — design, implementation, and evaluation.",
    formed: "2025",
    links: [],
  },
  stages: [
    {
      kind: "question",
      label: "The question",
      state: "settled",
      body: [
        "Why do capable agents still feel amnesiac? Give a model a vector store and it can fetch a relevant paragraph — but it has forgotten how that paragraph connected to everything else it once knew.",
        "The question that started ASMOS: what would it take for an agent to remember the way a researcher remembers — by association, by structure, by the trail that led there?",
      ],
    },
    {
      kind: "hypothesis",
      label: "The hypothesis",
      state: "settled",
      body: [
        "Memory should not be a flat index of embeddings. It should be a graph that mirrors the structure of what was learned: episodes linked to the concepts they touched, concepts linked to each other, consolidated over time.",
        "If recall reconstructs the surrounding structure — not just the nearest chunk — then an agent's answers should carry the context that makes them trustworthy.",
      ],
    },
    {
      kind: "research",
      label: "What it built on",
      state: "settled",
      body: [
        "Retrieval-augmented generation, associative and episodic memory models from cognitive science, and knowledge-graph construction. The gap: most agent memory is retrieval without structure, and most knowledge graphs are static, not continuously formed from experience.",
      ],
    },
    {
      kind: "experiments",
      label: "The experiments",
      state: "in-progress",
      body: [
        "A sequence of probes comparing how well different memory structures preserve the usefulness of knowledge over long horizons and repeated recall.",
      ],
      items: [
        {
          title: "Flat vector recall (baseline)",
          note: "Nearest-neighbour retrieval over episode embeddings.",
          outcome: "partial",
        },
        {
          title: "Graph-structured consolidation",
          note: "Episodes consolidated into a semantic graph; recall traverses associations.",
          outcome: "partial",
        },
        {
          title: "Reconstruction-on-recall",
          note: "Recall reassembles surrounding context rather than returning isolated chunks.",
          outcome: "partial",
        },
      ],
    },
    {
      kind: "failures",
      label: "Abandoned branches",
      state: "settled",
      body: [
        "The dead ends are kept on purpose — they are where the design actually happened.",
      ],
      items: [
        {
          title: "Bigger context window instead of memory",
          note: "Just stuff everything in the prompt. Broke on cost and on long horizons; recency drowned structure. Abandoned.",
          outcome: "failed",
        },
        {
          title: "Pure vector store, no structure",
          note: "Retrieved relevant text but lost the connections that made it meaningful — the exact failure ASMOS exists to fix.",
          outcome: "failed",
        },
        {
          title: "Eager summarisation of old memories",
          note: "Compressing the past too early destroyed the detail later reasoning needed. Replaced by lazy, recall-driven consolidation.",
          outcome: "failed",
        },
      ],
    },
    {
      kind: "iterations",
      label: "How it evolved",
      state: "settled",
      body: [
        "Each dead end pushed the design one step: from 'store more' to 'store structure', from 'summarise early' to 'consolidate on recall', from 'retrieve chunks' to 'reconstruct context'. ASMOS is the accumulation of those corrections.",
      ],
    },
    {
      kind: "architecture",
      label: "The architecture",
      state: "settled",
      body: [
        "Three layers: an episodic store of raw experience; a semantic graph that consolidates episodes into linked concepts; and a recall process that, given a cue, traverses the graph to reconstruct the relevant context before the agent answers.",
        "Consolidation is lazy and recall-driven — structure forms where it is actually used, so the memory grows the way attention moves through it.",
      ],
    },
    {
      kind: "results",
      label: "Where it stands",
      state: "in-progress",
      body: [
        "Evaluation is in progress. Early signals are promising on long-horizon recall and on preserving the context that flat retrieval loses — but the numbers are not yet final, so they are not claimed here. This section will crystallise when the evaluation is complete.",
      ],
    },
    {
      kind: "publication",
      label: "The paper",
      state: "in-progress",
      body: [
        "A manuscript is in preparation. No venue or date is claimed until it is real — an empty shelf is more honest than a fabricated citation.",
      ],
    },
    {
      kind: "future",
      label: "What's next",
      state: "settled",
      body: [
        "Explainable recall — surfacing why a memory was retrieved. Continual consolidation across sessions. And, fittingly, using ASMOS as the memory behind Dex on this very site — the research running the product that documents it.",
      ],
    },
  ],
  dex: [
    {
      cue: "What problem does ASMOS solve?",
      answer:
        "Agents forget. Flat vector stores retrieve fragments but lose the structure that made knowledge useful — the connections, the order, the why. ASMOS gives memory that structure.",
      source: "question",
    },
    {
      cue: "How is it different from a normal vector database?",
      answer:
        "A vector store returns the nearest chunk. ASMOS consolidates episodes into a semantic graph and reconstructs the surrounding context on recall — so answers carry the connections that make them trustworthy, not just isolated text.",
      source: "architecture",
    },
    {
      cue: "What didn't work?",
      answer:
        "Three abandoned branches: a bigger context window instead of memory (broke on cost and long horizons), a pure vector store with no structure (lost the connections), and eager summarisation of old memories (destroyed detail later reasoning needed).",
      source: "failures",
    },
    {
      cue: "Is it published?",
      answer:
        "Not yet. A manuscript is in preparation, and evaluation is still in progress — so no venue, date, or metric is claimed. When it's real, it will appear here.",
      source: "publication",
    },
    {
      cue: "What's next for ASMOS?",
      answer:
        "Explainable recall (why a memory was retrieved), continual consolidation across sessions, and using ASMOS as the memory behind Dex on this site.",
      source: "future",
    },
  ],
  draft: true,
};

/**
 * The semantic memory graph for the slice. ASMOS is the one fully-formed,
 * reconstructable memory; the others are REAL but not yet documented —
 * shown as honest "unformed" nodes (docs/26 §9), never faked into detail.
 */
export const memoryNodes: readonly MemoryNode[] = [
  {
    id: "asmos",
    label: "ASMOS",
    kind: "hypothesis",
    state: "active",
    x: 0.5,
    y: 0.5,
    luminance: 1,
    reconstructable: true,
  },
  {
    id: "shortcutscore",
    label: "ShortcutScore",
    kind: "conclusion",
    state: "unformed",
    x: 0.24,
    y: 0.32,
    luminance: 0.3,
    reconstructable: false,
  },
  {
    id: "dental-ai",
    label: "Dental AI",
    kind: "conclusion",
    state: "unformed",
    x: 0.78,
    y: 0.36,
    luminance: 0.3,
    reconstructable: false,
  },
  {
    id: "explainable-recall",
    label: "Explainable recall",
    kind: "hypothesis",
    state: "unformed",
    x: 0.68,
    y: 0.74,
    luminance: 0.22,
    reconstructable: false,
  },
  {
    id: "continual-learning",
    label: "Continual learning",
    kind: "hypothesis",
    state: "unformed",
    x: 0.28,
    y: 0.72,
    luminance: 0.22,
    reconstructable: false,
  },
];

export const memoryEdges: readonly MemoryEdge[] = [
  { from: "asmos", to: "shortcutscore", relation: "grew from" },
  { from: "asmos", to: "dental-ai", relation: "reminded me of" },
  { from: "asmos", to: "explainable-recall", relation: "leads to" },
  { from: "asmos", to: "continual-learning", relation: "leads to" },
  { from: "shortcutscore", to: "continual-learning", relation: "hinted at" },
];
