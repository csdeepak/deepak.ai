/**
 * ContentService source selector — CONTENT_SOURCE env var controls which
 * backing implementation is exported.
 *
 *   CONTENT_SOURCE=file (default) → local-content.ts (reads content/site.ts)
 *   CONTENT_SOURCE=db             → db-content.ts (reads PostgreSQL via Drizzle)
 *
 * Both implementations satisfy the same ContentService interface; all callers
 * import { contentService } from '@/services' and are never aware of the
 * backing store. The CTI schema is an implementation detail of db-content.ts
 * and must not surface in page components (D-043 binding condition 1).
 *
 * docs/09 §11 — Runtime posture: file mode is the permanent floor. The build
 * succeeds with no database present when CONTENT_SOURCE is unset or 'file'.
 */

import { localContent } from "./local-content";
import { dbContent } from "./db-content";
import type { ContentService } from "./content";

export const contentService: ContentService =
  process.env.CONTENT_SOURCE === "db" ? dbContent : localContent;
