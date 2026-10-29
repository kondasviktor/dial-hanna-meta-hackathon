import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { waitlist } from "@/db/schema.ts";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { email?: string; locale?: string; plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "bad-email" }, { status: 400 });
  }
  const locale = body.locale === "en" ? "en" : "hu";
  const plan = ["essential", "pro", "business"].includes(String(body.plan ?? ""))
    ? String(body.plan)
    : null;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ ok: false, error: "db-unavailable" }, { status: 503 });
  }
  try {
    const existing = await db.select({ id: waitlist.id }).from(waitlist).where(eq(waitlist.email, email)).limit(1);
    if (existing[0]) {
      await db.update(waitlist).set({ locale, planInterest: plan }).where(eq(waitlist.email, email));
    } else {
      await db.insert(waitlist).values({ email, locale, planInterest: plan });
    }
  } catch (e) {
    console.error("waitlist-insert", e);
    return NextResponse.json({ ok: false, error: "insert-failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
