/**
 * ASMOS — owner-ratified memory (G3 cleared 2026-07-21).
 *
 * Content derives exclusively from the owner's ratified text (session
 * 2026-07-21). Fields left as "" (formed) are empty because the
 * ratified text did not supply them; brief.tsx filters empty gist rows
 * so they self-hide rather than render blank (LAW-008).
 * "our evaluation runs" in the text leaves role attribution slightly
 * ambiguous; "Researcher and engineer" is the minimal safe derivation.
 */
import type { Memory, MemoryEdge, MemoryNode } from "@/features/memory/types";

export const asmosMemory: Memory = {
  id: "asmos",
  title: "ASMOS",
  kind: "Memory · Research",
  oneLine:
    "A multi-agent orchestration system that routes subtasks by topic ownership — confirmed to cut context tokens by roughly 24% per query.",
  gist: {
    problem:
      "Multi-agent systems compared answers across multiple APIs but none actually orchestrated the work or routed it by ownership.",
    approach:
      "Break the target task into subtasks and route each one to the agent that owned that topic, then combine the results.",
    status:
      "Evaluation done — ownership-based routing confirmed; context tokens cut by roughly 24% per query.",
    role: "Researcher and engineer",
    formed: "", // owner to fill — not in ratified text
    links: [],
  },
  stages: [
    {
      kind: "question",
      label: "The question",
      state: "settled",
      body: [
        "The multi-agent systems I was studying only compared answers across multiple APIs — none of them actually orchestrated the work or routed it by ownership.",
      ],
    },
    {
      kind: "experiments",
      label: "The experiment",
      state: "settled",
      body: [
        "I tried breaking the target task into subtasks and routing each one to the agent that owned that topic, then combining the results.",
      ],
      items: [
        {
          title: "Ownership-based routing",
          note: "Each subtask routed to the agent that owned that topic; results combined at the end.",
          outcome: "worked",
        },
      ],
    },
    {
      kind: "results",
      label: "What it showed",
      state: "settled",
      body: [
        "Ownership-based routing genuinely works — and it cut context tokens by about 24% per query in our evaluation runs.",
      ],
    },
  ],
  dex: [
    {
      cue: "What is ASMOS?",
      answer:
        "A multi-agent orchestration system that routes subtasks by ownership — each subtask goes to the agent that owns that topic, then the results are combined. In evaluation it cut context tokens by about 24% per query.",
      source: "results",
    },
    {
      cue: "What insight started ASMOS?",
      answer:
        "Realising that the multi-agent systems being studied only compared answers across multiple APIs — none of them actually orchestrated the work or routed it by ownership.",
      source: "question",
    },
    {
      cue: "What did the evaluation show?",
      answer:
        "Ownership-based routing genuinely works — confirmed in evaluation runs, cutting context tokens by about 24% per query.",
      source: "results",
    },
  ],
  draft: false,
};

/**
 * The semantic memory graph for the /memory slice. ASMOS is the one
 * fully-formed, reconstructable memory. The others are real projects
 * shown as honest "unformed" nodes (docs/26 §9) — not yet documented
 * as memories, never faked into detail.
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
