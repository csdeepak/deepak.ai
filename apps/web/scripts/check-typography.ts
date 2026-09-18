/**
 * Typography normalization guard.
 *
 * Locks in that Unicode pseudo-bold — the "𝗳𝗮𝗸𝗲 𝗯𝗼𝗹𝗱" pasted in with social
 * posts — is mapped back to real ASCII before it reaches a public page, and
 * that ordinary text is left completely alone.
 *
 * It matters because the alternative is silent: pseudo-bold renders fine to a
 * sighted reader, so a regression here looks like nothing at all while screen
 * readers read the text out character-by-character, search engines fail to
 * match the words, and in-page search stops finding them.
 *
 * Plain tsx script, no test runner — matches scripts/check-dex-matcher.ts.
 *
 *   npm run check:typography --workspace=web
 *
 * The "should change" fixtures are real strings copied from the live
 * production landing page on 2026-09-18, not invented examples.
 */

import { normalizeTypography } from "../src/lib/text";
import { withNormalizedTypography } from "../src/services/normalize";
import type { ContentService } from "../src/services/content";
import type { Post, Project } from "../src/types/content";

interface Case {
  readonly label: string;
  readonly input: string;
  readonly expected: string;
}

const CASES: readonly Case[] = [
  // ── Real production strings that must be repaired ────────────────────────
  {
    label: "sans-bold sentence (post title)",
    input: "I 𝗯𝘂𝗶𝗹𝘁 𝗮𝗻 𝗔𝗜 𝗶𝗻𝘁𝗼 𝗺𝘆 𝗼𝘄𝗻 𝗽𝗼𝗿𝘁𝗳𝗼𝗹𝗶𝗼 so you don't have to read a resume",
    expected: "I built an AI into my own portfolio so you don't have to read a resume",
  },
  {
    label: "sans-bold across two sentences",
    input: "𝗞𝗲𝗲𝗽 𝘁𝗵𝗲 𝗶𝗻𝘁𝗲𝗿𝗳𝗮𝗰𝗲 𝘀𝘁𝗮𝗯𝗹𝗲. 𝗖𝗵𝗮𝗻𝗴𝗲 𝘁𝗵𝗲 𝗺𝗼𝗱𝗲𝗹 𝗯𝗲𝗵𝗶𝗻𝗱 𝗶𝘁.",
    expected: "Keep the interface stable. Change the model behind it.",
  },
  {
    label: "bold-italic serif",
    input: "Attended a 𝘾𝙡𝙖𝙪𝙙𝙚 𝙬𝙤𝙧𝙠𝙨𝙝𝙤𝙥 last week",
    expected: "Attended a Claude workshop last week",
  },
  {
    label: "bold-italic with internal capitals",
    input: "I decided to 𝙧𝙚𝙙𝙚𝙨𝙞𝙜𝙣 𝙢𝙮 𝙂𝙞𝙩𝙃𝙪𝙗 𝙥𝙧𝙤𝙛𝙞𝙡𝙚.",
    expected: "I decided to redesign my GitHub profile.",
  },
  {
    label: "styled digit at start",
    input: "𝟴 𝗔𝗜 𝘁𝗼𝗼𝗹𝘀 that genuinely 𝗯𝗼𝗼𝘀𝘁𝘀 𝗽𝗿𝗼𝗱𝘂𝗰𝘁𝗶𝘃𝗶𝘁𝘆",
    expected: "8 AI tools that genuinely boosts productivity",
  },
  {
    label: "letterlike hole (italic h is U+210E, not in the math block)",
    input: "\u{1D465} + \u210E",
    expected: "x + h",
  },

  // ── Ordinary text that must survive byte-identical ───────────────────────
  {
    label: "project title with em dash",
    input: "ASMOS — Multi-Agent Memory Management System",
    expected: "ASMOS — Multi-Agent Memory Management System",
  },
  {
    label: "figures, percent signs and en dashes",
    input: "22% token reduction, roughly 18–26% by question",
    expected: "22% token reduction, roughly 18–26% by question",
  },
  {
    label: "accents, CJK, emoji and angle brackets",
    input: "café · naïve · 日本語 · 🚀 · <script>",
    expected: "café · naïve · 日本語 · 🚀 · <script>",
  },
  {
    label: "slug-shaped text",
    input: "turb-detr",
    expected: "turb-detr",
  },
  { label: "empty string", input: "", expected: "" },
];

let failures = 0;

for (const testCase of CASES) {
  const actual = normalizeTypography(testCase.input);
  if (actual === testCase.expected) {
    console.log(`  PASS  ${testCase.label}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${testCase.label}`);
    console.error(`        input:    ${testCase.input}`);
    console.error(`        expected: ${testCase.expected}`);
    console.error(`        actual:   ${actual}`);
  }
}

// Normalising an already-normalised string must be a no-op. Without this,
// a mapping that overlapped ASCII could corrupt text on a second pass —
// and the service layer is not guaranteed to run exactly once forever.
const notIdempotent = CASES.filter((testCase) => {
  const once = normalizeTypography(testCase.input);
  return normalizeTypography(once) !== once;
});

if (notIdempotent.length > 0) {
  failures += notIdempotent.length;
  console.error(
    `  FAIL  not idempotent: ${notIdempotent.map((c) => c.label).join(", ")}`,
  );
} else {
  console.log("  PASS  idempotent across every case");
}

/**
 * The wiring, not just the function. `normalizeTypography` passing its unit
 * cases proves nothing if nobody calls it — the value of this layer is that
 * it sits on the single boundary every public page reads through. A stub
 * service carrying pseudo-bold in every human-readable field goes in; plain
 * ASCII must come out, with machine-readable fields untouched.
 */
// U+1D5EA sans-serif-bold "W" + U+1D622 sans-serif-italic "a" +
// U+1D634 sans-serif-italic "s". Spelled out as escapes because these are
// easy to get wrong by eye — an earlier draft of this fixture used U+1D630,
// which is "o", and the checks below caught it rather than the reverse.
const BOLD_WAS = "\u{1D5EA}\u{1D622}\u{1D634}";

const stubProject: Project = {
  type: "project",
  slug: "shortcutscore",
  title: BOLD_WAS,
  status: "published",
  publishedAt: "2026-01-01",
  updatedAt: "2026-01-02",
  relations: [],
  question: BOLD_WAS,
  problem: BOLD_WAS,
  year: 2026,
  projectStatus: "active",
  tags: [BOLD_WAS],
  featured: true,
  timelineOrder: null,
};

const stubPost: Post = {
  type: "post",
  slug: "a-post",
  title: BOLD_WAS,
  status: "published",
  publishedAt: "2026-01-01",
  updatedAt: "2026-01-02",
  relations: [],
  dek: BOLD_WAS,
  bodyMarkdown: BOLD_WAS,
  readingMinutes: 1,
  tags: [BOLD_WAS],
  featuredOrder: null,
};

const stubService = {
  getFeaturedProjects: async () => [stubProject],
  getProjects: async () => [stubProject],
  getProject: async () => stubProject,
  getTimelineProjects: async () => [stubProject],
  getPublications: async () => [],
  getPublication: async () => null,
  getFeaturedPosts: async () => [stubPost],
  getPosts: async () => [stubPost],
  getLatestPosts: async () => [stubPost],
  getPost: async () => stubPost,
  getTimeline: async () => [],
  getCurrentSkills: async () => [],
} as unknown as ContentService;

async function checkServiceWiring(): Promise<number> {
  const wrapped = withNormalizedTypography(stubService);
  const [project] = await wrapped.getProjects();
  const [post] = await wrapped.getPosts();

  const checks: ReadonlyArray<readonly [string, boolean]> = [
    ["service layer normalises project.title", project?.title === "Was"],
    ["service layer normalises project.problem", project?.problem === "Was"],
    ["service layer normalises project.question", project?.question === "Was"],
    ["service layer normalises project.tags", project?.tags[0] === "Was"],
    ["service layer normalises post.title", post?.title === "Was"],
    ["service layer normalises post.dek", post?.dek === "Was"],
    ["service layer normalises post.bodyMarkdown", post?.bodyMarkdown === "Was"],
    // Slugs are route segments, not prose. Rewriting one would silently 404
    // the page, so the wrapper must leave identifiers exactly alone.
    ["slug is left untouched", project?.slug === "shortcutscore"],
    ["dates are left untouched", project?.publishedAt === "2026-01-01"],
    ["source object is not mutated", stubProject.title === BOLD_WAS],
  ];

  let failed = 0;
  for (const [label, ok] of checks) {
    if (ok) {
      console.log(`  PASS  ${label}`);
    } else {
      failed += 1;
      console.error(`  FAIL  ${label}`);
    }
  }
  return failed;
}

const WIRING_CHECK_COUNT = 10;

// `.then()` rather than top-level await: tsx compiles these scripts to CJS,
// where top-level await is a build error. Keeps the script runnable with a
// bare `tsx <file>`, like the other guards in this folder.
void checkServiceWiring().then((wiringFailures) => {
  failures += wiringFailures;

  const total = CASES.length + 1 + WIRING_CHECK_COUNT;
  console.log(`\n${total - failures}/${total} typography checks pass`);
  process.exit(failures === 0 ? 0 : 1);
});
