// Applies drizzle/*.sql migrations through the Neon HTTP driver
// (drizzle-kit push needs raw TCP, unavailable in some sandboxes).
// Usage: set -a; . ../../.env; node scripts/migrate.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "drizzle");
const db = drizzle(neon(process.env.DATABASE_URL));
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  const stmts = readFileSync(join(dir, f), "utf8")
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const s of stmts) {
    await db.execute(sql.raw(s));
  }
  console.log(`applied ${f} (${stmts.length} statements)`);
}
