/**
 * Profile drift guard — the site against the owner's canonical profile (D-071).
 *
 * The resume system at PESU/resume keeps one TOML profile as the source of
 * truth for every resume. When a figure is corrected there, the old one is
 * kept as a `blocked_terms` entry so it can never be shipped again; its
 * `claimcheck.py` fails any resume that carries one.
 *
 * Nothing did the same for this site, and it drifted. Measured 2026-10-10:
 * Dex was still saying "502 tests" for HandCode three weeks after the profile
 * retired the figure, the Dental AI outcomes carried a retired parameter
 * count, and Dex described a face-recognition factor on the Smart Door Lock
 * that the profile marks do-not-ship (the committed firmware's face step is a
 * timed placeholder). LAW-006: one fabricated answer poisons the system — and
 * a retired claim, repeated confidently, is a fabricated answer.
 *
 * This applies the resume system's own rule to the site's public content: the
 * same blocked terms, read through the resume system's own `profile_lib`, and
 * matched the way `claimcheck.py` matches them (whole word, case-insensitive).
 *
 * LOCAL ONLY, by design. The profile is private (it holds a phone number, the
 * university SRN and unresolved notes), so it is never copied into this repo
 * and CI cannot see it. Where the profile is absent this prints SKIP and exits
 * 0 — absence is the normal state on CI, not an error. Run it before shipping
 * a content change:
 *
 *   npm run check:profile --workspace=web
 *
 * RESUME_DIR overrides the default location (~/PESU/resume). Needs Python
 * 3.11+, which the resume system already requires.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const CONTENT_DIR = path.resolve(__dirname, "../content");
// Public PDFs (the CV) are content a recruiter reads too.
const PUBLIC_DIR = path.resolve(__dirname, "../public");
// Machine-written image metadata — numbers in it are dimensions, not claims.
const SKIP_FILES = new Set(["manifest.generated.json"]);

const resumeDir = process.env.RESUME_DIR ?? path.join(homedir(), "PESU", "resume");
const libDir = path.join(resumeDir, "scripts");

if (!existsSync(path.join(libDir, "profile_lib.py"))) {
  console.log(
    `\nSKIP  check:profile — no canonical profile at ${resumeDir}.\n` +
      "      Expected on CI (the profile is private and never in this repo).\n" +
      "      Locally, set RESUME_DIR to the resume system's root.",
  );
  process.exit(0);
}

// Ask the resume system itself, so "what is blocked" can never diverge from
// what its claimcheck enforces.
const PY = `
import glob, json, os, sys
sys.path.insert(0, sys.argv[1])
from profile_lib import Profile, norm_url
p = Profile()
pdfs = {}
try:
    import pypdf
    for f in sorted(glob.glob(os.path.join(sys.argv[2], "*.pdf"))):
        pdfs[os.path.basename(f)] = " ".join(pg.extract_text() or "" for pg in pypdf.PdfReader(f).pages)
except ImportError:
    pdfs = None
print(json.dumps({
    "pdfs": pdfs,
    "blocked": [[t, src] for t, src in p.blocked_terms()],
    "projects": [
        {"id": k, "title": v.get("title", k), "repo": norm_url(v["repo"]) if v.get("repo") else None,
         "status": v.get("status"), "verified": str(v.get("last_verified", ""))}
        for k, v in sorted(p.projects().items())
    ],
}))
`;

function readProfile(): {
  pdfs: Record<string, string> | null;
  blocked: Array<[string, string]>;
  projects: Array<{ id: string; title: string; repo: string | null; status: string; verified: string }>;
} {
  for (const python of ["python", "python3"]) {
    const run = spawnSync(python, ["-c", PY, libDir, PUBLIC_DIR], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    if (run.error) continue; // interpreter not on PATH; try the next name
    if (run.status !== 0) {
      // The profile exists but could not be read. That is a real failure: a
      // guard that quietly passes when it cannot see its input is the
      // fail-closed-hides-misconfiguration trap CLAUDE.md warns about.
      console.error(`\nFAIL  check:profile — the profile at ${resumeDir} did not load:\n${run.stderr}`);
      process.exit(1);
    }
    return JSON.parse(run.stdout);
  }
  console.error("\nFAIL  check:profile — the profile exists but no Python 3.11+ interpreter was found.");
  process.exit(1);
}

function contentFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return contentFiles(full);
    if (SKIP_FILES.has(name) || !/\.(ts|json|md)$/.test(name)) return [];
    return [full];
  });
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Comment lines in the .ts content files are notes to maintainers, never shown
// to a visitor — and the case-insensitive match would otherwise read the verb
// "render" in a comment as the retired hosting provider "Render".
const isComment = (file: string, line: string) =>
  file.endsWith(".ts") && /^\s*(\/\/|\/\*|\*)/.test(line);

const profile = readProfile();
const files = contentFiles(CONTENT_DIR).map((file) => ({
  file: path.relative(path.resolve(__dirname, ".."), file).replace(/\\/g, "/"),
  lines: readFileSync(file, "utf8").split("\n"),
}));

console.log(`\nRetired figures — ${profile.blocked.length} blocked term(s) from ${resumeDir}`);

let failures = 0;
for (const [term, source] of profile.blocked) {
  // claimcheck.py: (?<!\w)term(?!\w), case-insensitive.
  const re = new RegExp(`(?<!\\w)${escapeRe(term)}(?!\\w)`, "i");
  for (const { file, lines } of files) {
    lines.forEach((line, i) => {
      if (isComment(file, line)) return;
      const hit = re.exec(line);
      if (!hit) return;
      failures += 1;
      const from = Math.max(0, hit.index - 50);
      const excerpt = line.slice(from, hit.index + term.length + 50).trim();
      console.error(`  FAIL  "${term}" (retired by ${source}) at ${file}:${i + 1}\n        …${excerpt}…`);
    });
  }
}
if (failures === 0) {
  console.log(`  PASS  none of them appears in ${files.length} content file(s)`);
}

// The public PDFs. Text extraction drops some inter-word spaces ("502 tests"
// comes out as "502 testsincluding"), so a term ending in a letter matches
// without the trailing word boundary. Terms ending in a digit keep it, so a
// retired "444" still cannot match inside "4440".
if (profile.pdfs === null) {
  console.log("\n  SKIP  public PDFs — pypdf is not installed for this Python");
} else {
  for (const [name, text] of Object.entries(profile.pdfs)) {
    const hits = profile.blocked.filter(([term]) => {
      const tail = /[A-Za-z]$/.test(term) ? "" : "(?!\\w)";
      return new RegExp(`(?<!\\w)${escapeRe(term)}${tail}`, "i").test(text);
    });
    if (hits.length === 0) {
      console.log(`  PASS  public/${name}`);
      continue;
    }
    failures += hits.length;
    for (const [term, source] of hits) {
      console.error(`  FAIL  "${term}" (retired by ${source}) in public/${name}`);
    }
    console.error(
      `        public/${name} is a build of the resume system: regenerate it there,\n` +
        "        then copy the new PDF over this one.",
    );
  }
}

// Informational, never failing: profile projects whose repository the site
// never links. Whether each belongs on the site is an owner decision (LAW-003
// needs its question first), so this is a worklist, not a gate.
const siteText = files.map(({ lines }) => lines.join("\n")).join("\n").toLowerCase();
const absent = profile.projects.filter(
  (project) => project.repo && !siteText.includes(project.repo.toLowerCase()),
);
if (absent.length > 0) {
  console.log(`\nOn the profile, not linked from the site (worklist, not a failure):`);
  for (const project of absent) {
    console.log(`  NOTE  ${project.id} — ${project.title} [${project.status}, verified ${project.verified}]`);
  }
}

console.log(`\n${failures} retired figure(s) found`);
process.exit(failures === 0 ? 0 : 1);
