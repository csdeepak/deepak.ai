/**
 * Content guard — LAW-003 at the content layer.
 *
 * `ck_published_has_question` on `content_items` rejects any PUBLISHED row
 * whose `question` is empty, for every content type. That constraint lives in
 * the database, so nothing catches a violation until an ingest runs against a
 * real Postgres — which is exactly how D-070 happened: the first publication
 * ingest against Neon aborted mid-run, after 21 projects had already been
 * written, because `question` was hardcoded to "".
 *
 * A failure that only appears against production, halfway through a write, is
 * the kind worth catching in CI. This asserts the same rule over content/site.ts
 * so the ingest cannot be surprised by it again.
 *
 *   npm run check:content --workspace=web
 */

import { projects, publications, timeline, skills } from "../content/site";

interface Checkable {
  slug: string;
  status: string;
  question?: string;
}

const GROUPS: Array<[string, Checkable[]]> = [
  ["project", projects],
  ["publication", publications],
  ["timeline_entry", timeline],
  ["skill", skills],
];

let failures = 0;
let checked = 0;

console.log("\nLAW-003 — every published item answers the question that created it");

for (const [label, items] of GROUPS) {
  const published = items.filter((item) => item.status === "published");
  if (published.length === 0) {
    console.log(`  SKIP  ${label}: nothing published`);
    continue;
  }
  const missing = published.filter((item) => !item.question?.trim());
  checked += published.length;

  if (missing.length === 0) {
    console.log(`  PASS  ${label}: ${published.length} published, all have a question`);
  } else {
    failures += missing.length;
    console.error(
      `  FAIL  ${label}: ${missing.length} published without a question — ` +
        `ck_published_has_question will reject these on ingest: ` +
        missing.map((item) => item.slug).join(", "),
    );
  }
}

// Slugs are route segments and the ingest's conflict target; a duplicate would
// make two items silently overwrite each other.
const allSlugs = GROUPS.flatMap(([, items]) => items.map((item) => item.slug));
const dupes = allSlugs.filter((slug, i) => allSlugs.indexOf(slug) !== i);
if (dupes.length > 0) {
  failures += dupes.length;
  console.error(`  FAIL  duplicate slugs across content types: ${[...new Set(dupes)].join(", ")}`);
} else {
  console.log(`  PASS  all ${allSlugs.length} slugs are unique`);
}

console.log(`\n${checked} published item(s) checked, ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
