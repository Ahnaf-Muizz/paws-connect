import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "./schema";
import { seed } from "./seed";

try {
  process.loadEnvFile(".env.local");
} catch {}

// Runs before `next build`: pages are prerendered from the database at build time,
// so the tables must exist first. Seeding is a no-op once any user exists.
const url = process.env.DATABASE_URL;
if (!url) {
  console.log("DATABASE_URL is not set; skipping migrations (the app will use the in-memory demo database).");
  process.exit(0);
}

const db = drizzle(neon(url), { schema });
await migrate(db, { migrationsFolder: "drizzle" });
console.log("Migrations applied.");
await seed(db);
console.log("Database ready.");
