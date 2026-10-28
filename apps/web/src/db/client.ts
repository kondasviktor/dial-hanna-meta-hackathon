// Postgres client (Neon). Best practice for Next.js on Vercel: the
// Neon serverless HTTP driver (@neondatabase/serverless + drizzle neon-http)
// — no long-lived connections from serverless functions. The client is lazy:
// import-time never throws; /api/db-ping reports {ok:false} when
// DATABASE_URL is unset so build/prerender stays green.

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return drizzle(neon(url));
}

export async function dbPing(): Promise<
  { ok: true; now: string } | { ok: false; reason: string }
> {
  const db = getDb();
  if (!db) return { ok: false, reason: "DATABASE_URL-unset" };
  try {
    const result = await db.execute<{ now: string }>(sql`select now() as now`);
    const now = result.rows?.[0]?.now ?? "unknown";
    return { ok: true, now: String(now) };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200) };
  }
}
