import path from "node:path";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type DB = NeonHttpDatabase<typeof schema>;

declare global {
  var __pawsDb: Promise<DB> | undefined;
}

async function createNeon(url: string): Promise<DB> {
  const { neon } = await import("@neondatabase/serverless");
  const { drizzle } = await import("drizzle-orm/neon-http");
  return drizzle(neon(url), { schema });
}

/**
 * Without DATABASE_URL (local development before Neon is connected) the app runs on an
 * in-memory PGlite Postgres that is migrated and seeded on first use. It resets when the
 * process restarts, so it is for demos only. Production on Vercel always uses Neon.
 */
async function createLocal(): Promise<DB> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  const { seed } = await import("./seed");
  await seed(db as unknown as DB);
  return db as unknown as DB;
}

export function getDb(): Promise<DB> {
  if (!globalThis.__pawsDb) {
    const url = process.env.DATABASE_URL;
    globalThis.__pawsDb = (url ? createNeon(url) : createLocal()).catch((err) => {
      globalThis.__pawsDb = undefined;
      throw err;
    });
  }
  return globalThis.__pawsDb;
}

export const isLocalDb = () => !process.env.DATABASE_URL;

export { schema };
