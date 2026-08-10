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
    "A research-grade multi-agent memory prototype that routes questions by verified topic ownership, cutting prompt tokens by about 22% in evaluation.",
  gist: {
    problem:
      "Multi-agent systems compared answers across multiple APIs but none actually orchestrated the work or routed it by ownership.",
    approach:
      "Create verified checkpoints, score topic ownership, route each question to the agent that owns that topic, and load only that agent's relevant memory.",
    status:
      "Working prototype with routing, scoring, memory, 400+ passing tests, Docker support, and experiments showing about 22% token reduction across Stack Overflow Q&A tasks.",
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
        "I tried creating verified checkpoints from answered questions, using those checkpoints to score topic ownership, and routing each new question to the agent with the strongest proven track record.",
        "The owner score combines 60% trust, based on verified correctness, and 40% contribution share, based on how much of the correct work on that topic came from that agent.",
      ],
      items: [
        {
          title: "Ownership-based routing",
          note: "Each question routed to the owner agent for that topic; if no clear owner exists, the system falls back to broader memory search.",
          outcome: "worked",
        },
      ],
    },
    {
      kind: "results",
      label: "What it showed",
      state: "settled",
      body: [
        "Ownership-based routing genuinely works. The final careful re-test showed about 22% token reduction, with question-level results roughly ranging from 18-26%.",
        "The comparison used the actual text sent to the AI under the old load-everything approach and under ASMOS's load-only-the-owner-memory approach, counted with a real tokenizer across 50 questions and 10 random-seed reruns.",
      ],
    },
  ],
  dex: [
    {
      cue: "What is ASMOS?",
      answer:
        "A research-grade multi-agent memory prototype that learns which agent owns each topic from verified checkpoints, routes new questions to that owner, and loads only the relevant memory. In evaluation it cut prompt tokens by about 22%.",
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
        "Ownership-based routing genuinely works. A larger careful re-test showed about 22% token reduction, with question-level results roughly ranging from 18-26%.",
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
