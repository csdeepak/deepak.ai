import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env.local first (Next.js convention for local secrets), then .env as
// fallback. This makes `npm run db:migrate` and `db:generate` work regardless
// of how the shell environment is set up (WSL, Windows, CI).
config({ path: ".env.local" });
config();

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
