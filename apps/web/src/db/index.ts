/**
 * Drizzle DB client — lazy-initialized singleton.
 *
 * Never imported in file-content mode (CONTENT_SOURCE=file). The client is
 * only instantiated when getDb() is called, so importing this module does
 * not attempt a DB connection at module load time — the build never requires
 * a database (D-045, docs/09 §11).
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Use CONTENT_SOURCE=file for file-backed content (the default)."
    );
  }
  if (!_db) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(pool, { schema });
  }
  return _db;
}
