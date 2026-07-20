/**
 * Site content — the landing's editable copy and data seeds.
 * Temporary home until the CMS/data layer lands (docs/09); shape
 * mirrors what the admin will manage.
 *
 * NO FAKE DATA: collection arrays start empty and their landing
 * sections self-hide (graceful absence). Copy fields below are
 * structural drafts — every TODO(copy) must pass the R4 release
 * protocol (10-second + read-aloud tests, specs/landing.md §6.5).
 */
import type {
  Post,
  Project,
  Publication,
  Skill,
  TimelineEntry,
} from "@/types/content";

export const siteContent = {
  name: "Deepak",

  /**
   * Hero identity line (docs/24 Part 6 — the LCP text node). Owner-ratified.
   * The single source of truth for the Arrival <h1>. Empty → the heading
   * self-hides (graceful absence).
   */
  identitySentence: "Deepak learns and enjoy building intelligent systems..",

  /**
   * Supporting line beneath the hero identity line (docs/24 Part 6).
   * Owner-ratified. Empty → the line self-hides (graceful absence).
   */
  identitySupport:
    "An adaptive mind working across agentic AI, memory, and software engineering — documenting not just what I build, but how I think, learn, and evolve.",

  /**
   * Current focus line (hero item 3). Sourced from Skills(current)
   * once the CMS lands; null hides the line entirely (spec §2.1).
   * Stamp renders only while fresh ≤30d (R5) — enforced in the Hero.
   */
  currentFocus: {
    phrase:
      "Building AI automation with agentic systems — exploring how agents plan, act, and adapt across real workflows.",
    updatedAt: "2026-07-11",
  } as { phrase: string; updatedAt: string } | null,

  /** TODO(asset): real CV file in /public; null hides the CTA. */
  cvUrl: null as string | null,

  /** Real contact email; null hides the direct block. */
  contactEmail: "csdeepak2005@gmail.com" as string | null,

  /** What's-welcome sentence for the Collaborate close. */
  contactSentence:
    "Working toward full-time AI engineering — open to roles, collaborations, and good questions.",

  outbound: {
    github: "https://github.com/csdeepak" as string | null,
    /** No Scholar profile yet — self-hides everywhere (LAW-008). */
    scholar: null as string | null,
    linkedin:
      "https://www.linkedin.com/in/c-s-deepak-b1b41228b" as string | null,
    x: "https://x.com/CSDeepak08" as string | null,
    instagram: "https://www.instagram.com/deep_in.ai/" as string | null,
  },
} as const;

/**
 * Mission (landing Screen 2). Honest, owner-editable narrative — NOT
 * fabricated evidence. The identity/mission copy still passes the R4
 * read-aloud + 10-second tests before public launch (specs/landing.md).
 */
export const mission = {
  kicker: "The mission",
  statement:
    "The strongest AI engineers won't just ship models — they'll understand them. I'm building toward both: production systems that work, and the research that explains why.",
  pillars: [
    { label: "Build", body: "Production AI systems — agentic, multimodal, real." },
    { label: "Research", body: "The work behind the work, written down and published." },
    { label: "Explain", body: "Models you can inspect, trust, and reason about." },
  ],
} as const;

/**
 * Domains (landing Screen 3 — Evidence). These are real focus areas,
 * not projects: the territory the work lives in. Each note describes
 * the field, never a fabricated result.
 */
export const domains: ReadonlyArray<{ name: string; note: string }> = [
  { name: "Agentic AI", note: "systems that plan, act, and use tools" },
  { name: "Multi-Agent Systems", note: "many models coordinating toward a goal" },
  { name: "Large Language Models", note: "language as a reasoning surface" },
  { name: "Deep Learning", note: "the architectures underneath" },
  { name: "Computer Vision", note: "teaching systems to see" },
  { name: "Explainable AI", note: "making models legible and trustworthy" },
];

/** Research highlight (S3). Null hides the section. */
export const researchHighlight = null as {
  themeName: string;
  question: string;
  publicationCount: number;
  venueCount: number;
  yearSpan: string;
} | null;

/**
 * Projects — all 18 are status:"draft" until the owner writes a question
 * (LAW-003) and flips status to "published". Draft projects are invisible
 * on /projects (filtered in local-content.ts) and generate no public
 * detail routes (generateStaticParams only includes published).
 *
 * Field mapping (documented — not silent schema invention):
 *   brief.context → problem  (both are one-line project descriptions)
 *   brief.stack   → tags     (tags: string[] is the existing home for tech)
 *
 * Dental AI date: stored as 2026-05 (end date, per brief); the range
 * "2025-10 → 2026-05" is noted in the problem field.
 */
export const projects: Project[] = [
  {
    type: "project",
    slug: "incrementor-app",
    title: "Incrementor App",
    status: "draft",
    publishedAt: "2023-09-01",
    updatedAt: "2023-09-01",
    relations: [],
    question: "",
    problem: "App development course project, PESU I/O.",
    year: 2023,
    projectStatus: "archived",
    tags: ["Android Studio", "Dart"],
    featured: false,
  },
  {
    type: "project",
    slug: "bmi-calculator",
    title: "BMI Calculator",
    status: "draft",
    publishedAt: "2023-10-01",
    updatedAt: "2023-10-01",
    relations: [],
    question: "",
    problem: "App development course project, PESU I/O.",
    year: 2023,
    projectStatus: "archived",
    tags: ["Android Studio", "Dart"],
    featured: false,
  },
  {
    type: "project",
    slug: "weather-app",
    title: "Weather App",
    status: "draft",
    publishedAt: "2023-10-01",
    updatedAt: "2023-10-01",
    relations: [],
    question: "",
    problem: "App development course project, PESU I/O.",
    year: 2023,
    projectStatus: "archived",
    tags: ["Android Studio", "Dart"],
    featured: false,
    repoUrl: "https://github.com/csdeepak/weaher_app",
  },
  {
    type: "project",
    slug: "flight-booking-app",
    title: "Flight Booking App",
    status: "draft",
    publishedAt: "2023-11-01",
    updatedAt: "2023-11-01",
    relations: [],
    question: "",
    problem: "App development course project, PESU I/O.",
    year: 2023,
    projectStatus: "archived",
    tags: ["Android Studio", "Dart"],
    featured: false,
    repoUrl: "https://github.com/csdeepak/Flightbooking_app",
  },
  {
    type: "project",
    slug: "amplify",
    title: "Amplify",
    status: "draft",
    publishedAt: "2024-10-01",
    updatedAt: "2024-10-01",
    relations: [],
    question: "",
    problem: "A smart music web app (Spotify-style).",
    year: 2024,
    projectStatus: "archived",
    tags: ["HTML", "Tailwind CSS", "JavaScript", "React", "Node.js"],
    featured: false,
    repoUrl: "https://github.com/csdeepak/Amplify",
  },
  {
    type: "project",
    slug: "smart-door-lock",
    title: "Smart Door Lock System",
    status: "draft",
    publishedAt: "2025-03-01",
    updatedAt: "2025-03-01",
    relations: [],
    question: "",
    problem: "IoT three-sensor access control system.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Arduino", "ESP32", "RFID"],
    featured: false,
    repoUrl: "https://github.com/csdeepak/smart_door_lock",
  },
  {
    type: "project",
    slug: "gym-management-system",
    title: "Gym Management System",
    status: "draft",
    publishedAt: "2025-10-01",
    updatedAt: "2025-10-01",
    relations: [],
    question: "",
    problem: "DBMS & OS course project.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Java", "HTML", "CSS", "JavaScript"],
    featured: false,
    repoUrl: "https://github.com/GUNADEEP19/GYM-MANAGEMENT-SYSTEM",
  },
  {
    type: "project",
    slug: "sediment-particle-size-prediction",
    title: "Sediment Particle Size Prediction",
    status: "draft",
    publishedAt: "2025-10-01",
    updatedAt: "2025-10-01",
    relations: [],
    question: "",
    problem: "ML course mini-project.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Python", "scikit-learn", "Jupyter"],
    featured: false,
    repoUrl: "https://github.com/csdeepak/ML_mini_project",
  },
  {
    type: "project",
    slug: "recipe-ingredient-optimizer",
    title: "Recipe Ingredient Optimizer (RIO)",
    status: "draft",
    publishedAt: "2025-11-01",
    updatedAt: "2025-11-01",
    relations: [],
    question: "",
    problem: "SDLC-focused course project, built end-to-end SDE-style.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Python"],
    featured: false,
    repoUrl:
      "https://github.com/pestechnology/PESU_RR_CSE_C_P38_Recipe_Ingredient_Optimizer_RIO",
  },
  {
    type: "project",
    slug: "ml-hangman",
    title: "Machine Learning Hangman",
    status: "draft",
    publishedAt: "2025-11-01",
    updatedAt: "2025-11-01",
    relations: [],
    question: "",
    problem:
      "An intelligent Hangman assistant that guesses letters with maximum efficiency.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Python", "ML"],
    featured: false,
    repoUrl: "https://github.com/dhritij27/Machine_Learning_Hangman_Game",
  },
  {
    type: "project",
    slug: "humanizer",
    title: "Humanizer",
    status: "draft",
    publishedAt: "2025-12-01",
    updatedAt: "2025-12-01",
    relations: [],
    question: "",
    problem: "A Claude skill that humanizes research content from Markdown.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Python", "Claude", "Markdown"],
    featured: false,
    repoUrl: "https://github.com/csdeepak/Humanizer_tii",
  },
  {
    type: "project",
    slug: "sahayai-club-website",
    title: "SahayAI Club Website",
    status: "draft",
    publishedAt: "2025-12-01",
    updatedAt: "2025-12-01",
    relations: [],
    question: "",
    problem: "Official website for the SahayAI Club, deployed on Vercel.",
    year: 2025,
    projectStatus: "archived",
    tags: ["Next.js", "Vercel"],
    featured: false,
    repoUrl: "https://github.com/SahayAI-PESU/sahayai-website",
  },
  {
    type: "project",
    slug: "pesu-vault",
    title: "PESU Vault",
    status: "published",
    publishedAt: "2026-01-01",
    updatedAt: "2026-07-12",
    relations: [],
    question:
      "Why am I clicking through the same portal every week — can the whole thing be automated end to end?",
    problem:
      "The project started from personal frustration: students repeatedly log into the university portal to download lecture notes, assignments, and course material. I automated the entire workflow — authentication, course navigation, and content download — so all course resources can be retrieved with minimal manual effort. The real work was reliability, not scraping: authenticated sessions, dynamic navigation, multiple courses, changing page structures, and file downloads all had to work consistently under normal student usage, not just against an assumed static page.",
    year: 2026,
    projectStatus: "archived",
    tags: ["Python", "FastAPI", "Playwright"],
    featured: true,
    repoUrl: "https://github.com/csdeepak/Pesu_academy_content_downloader",
  },
  {
    type: "project",
    slug: "turb-detr",
    title:
      "Turb-DETR — Turbidity-Aware Real-Time Transformer Detector for Underwater Plastic Debris",
    status: "published",
    publishedAt: "2026-02-01",
    updatedAt: "2026-07-12",
    relations: [],
    question:
      "Detectors trained on clean images fail in murky water — can a transformer be made turbidity-aware and still run in real time?",
    problem:
      "Plastic debris accumulates precisely where visibility is worst, yet most underwater detectors are trained and tested on relatively clean images — which gives an unrealistic estimate of field performance. Working with an RT-DETR-based pipeline, I evaluated how detection generalizes under increasing turbidity, suspended particles, and varying illumination rather than on clean benchmarks alone. The priority was deployment realism: robustness under unseen turbidity levels, while preserving real-time inference speed, mattered more than maximizing benchmark accuracy.",
    year: 2026,
    projectStatus: "archived",
    tags: ["Python", "scikit-learn", "Jupyter"],
    featured: true,
    repoUrl: "https://github.com/csdeepak/turb-detr-underwater-detection",
  },
  {
    type: "project",
    slug: "docksmith-engine",
    title: "Docksmith Engine",
    status: "published",
    publishedAt: "2026-03-01",
    updatedAt: "2026-07-12",
    relations: [],
    question:
      "What is a container, really — could I rebuild image layers, caching, and isolation from scratch?",
    problem:
      "I built Docksmith to understand what Docker does internally rather than just using Docker commands. It rebuilds the essential container runtime in Go: parsing a Docksmithfile, layered filesystem concepts, deterministic image caching, and chroot-based process isolation — the core workflow of image → layer resolution → filesystem setup → isolation → execution. The goal was never to replace Docker but to learn which parts of a container runtime are fundamental and which are convenience features layered on top. It left me with a much deeper understanding of Linux namespaces, filesystem layering, and runtime architecture.",
    year: 2026,
    projectStatus: "archived",
    tags: ["Go"],
    featured: true,
    repoUrl: "https://github.com/GUNADEEP19/docksmith-engine",
  },
  {
    type: "project",
    slug: "shortcutscore",
    title: "ShortcutScore",
    status: "published",
    publishedAt: "2026-04-01",
    updatedAt: "2026-07-12",
    relations: [],
    question:
      "Can shortcut learning be measured with a score, instead of discovered by accident?",
    problem:
      "A model can score high accuracy while exploiting spurious correlations in its dataset instead of learning the intended concept — and this usually surfaces only after deployment or through manual inspection. ShortcutScore makes shortcut reliance quantitative. The model is evaluated under controlled dataset shifts where shortcut features are removed or changed while the true semantic information remains: a large performance drop indicates shortcut reliance, stability indicates more robust representations. Results across the test conditions combine into a single interpretable score, so different architectures and training methods can be compared on how dependent they are on shortcuts — not just how accurate they look.",
    year: 2026,
    projectStatus: "archived",
    tags: ["Python", "scikit-learn", "Jupyter"],
    featured: true,
    repoUrl: "https://github.com/csdeepak/tdl-project",
  },
  {
    type: "project",
    slug: "dental-ai-pipeline",
    title: "Dental AI Pipeline — Automated OPG Analysis",
    status: "published",
    publishedAt: "2026-05-01",
    updatedAt: "2026-07-12",
    relations: [],
    question:
      "Can a model read a panoramic dental X-ray well enough to flag caries and bone loss a dentist would trust?",
    problem:
      "Panoramic OPG X-rays are among the messiest medical images: all teeth in one frame, overlapping structures, restorations, anatomical variation, and inconsistent image quality. Instead of treating the whole image as one prediction task, we decomposed it into stages — tooth detection, tooth-level cropping, disease-specific analysis for caries and periodontal bone loss, severity estimation, and structured report generation — which made the system more interpretable and far easier to debug. The system is a clinical decision-support tool, not a replacement for dentists: it highlights suspicious teeth that deserve closer examination, aiming at efficiency and consistency during screening.",
    year: 2026,
    projectStatus: "active",
    tags: ["Python", "PyTorch"],
    featured: true,
    repoUrl:
      "https://github.com/csdeepak/An-Intelligent-Dental-Assisting-System-for-Dentists-in-Cavity-and-Periodontal-Disease-Detection",
  },
  {
    type: "project",
    slug: "asmos",
    title: "ASMOS — Multi-Agent Memory Management System",
    status: "published",
    publishedAt: "2026-06-01",
    updatedAt: "2026-07-12",
    relations: [],
    question:
      "How should multiple AI agents share one memory without corrupting each other's context?",
    problem:
      "Most multi-agent systems choose between two bad options: give every agent an isolated memory, which prevents collaboration, or let all agents write into one shared history, which quickly becomes noisy, redundant, and inconsistent. ASMOS treats memory as a knowledge system instead of a chat history. An agent creates a semantic checkpoint only when it produces meaningful knowledge — a verified fact, a decision, an assumption, an observation — with metadata for topic, evidence, confidence, verification status, source agent, and relationships to earlier checkpoints. Agents share knowledge rather than conversations, and each retrieves only the checkpoints relevant to its current task. Memory is utility-driven rather than permanent: the memory manager continuously evaluates checkpoints on relevance, confidence, verification, and retrieval frequency, retaining what serves future reasoning and letting temporary detail expire. The aim is memory that stays scalable, explainable, and reusable as the number of agents grows.",
    year: 2026,
    projectStatus: "active",
    tags: ["Python"],
    featured: true,
    repoUrl: "https://github.com/csdeepak/ASMOS",
  },
];
export const publications: Publication[] = [];
export const posts: Post[] = [];
export const timeline: TimelineEntry[] = [];
export const skills: Skill[] = [];
