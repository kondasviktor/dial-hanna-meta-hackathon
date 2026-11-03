import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { bookings, knowledgeGaps, businessProfiles } from "@/db/schema.ts";
import { bookingIdempotencyKey } from "@/lib/security.ts";
import { verifyVoiceRequest } from "@/lib/voice_auth.ts";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  const body = await req.text();
  const url = new URL(req.url);
  const path = `/api/voice/tools/${name}`;
  const v = verifyVoiceRequest(req, "POST", path, body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.reason }, { status: 401 });

  let args: Record<string, unknown> = {};
  try {
    args = body ? JSON.parse(body) : {};
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "db-unavailable" }, { status: 503 });

  const orgId = String(args.org_id ?? args.orgId ?? "");
  const callId = String(args.call_id ?? args.callId ?? "");

  if (name === "get_hours" || name === "lookup_hours") {
    const prof = orgId
      ? (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1))[0]
      : null;
    const hours = (prof?.profile as { hours?: unknown })?.hours ?? [];
    return NextResponse.json({ ok: true, hours });
  }

  if (name === "check_availability") {
    // Hackathon: always offer a slot 24h ahead at :30.
    const start = new Date(Date.now() + 86_400_000);
    start.setMinutes(30, 0, 0);
    const end = new Date(start.getTime() + 60 * 60_000);
    return NextResponse.json({
      ok: true,
      slots: [{ start: start.toISOString(), end: end.toISOString() }],
    });
  }

  if (name === "book_appointment") {
    if (!orgId || !callId) return NextResponse.json({ ok: false, error: "org-call-required" }, { status: 400 });
    const slotStart = String(args.slot_start ?? args.slotStart ?? "");
    const serviceId = String(args.service_id ?? args.serviceId ?? "default");
    const key = bookingIdempotencyKey(callId, slotStart || "na", serviceId, 1);
    const existing = (await db.select().from(bookings).where(eq(bookings.idempotencyKey, key)).limit(1))[0];
    if (existing) return NextResponse.json({ ok: true, booking_id: existing.id, duplicate: true });
    const inserted = await db.insert(bookings).values({
      orgId,
      callId,
      idempotencyKey: key,
      serviceId,
      slotStart: slotStart ? new Date(slotStart) : null,
      slotEnd: args.slot_end ? new Date(String(args.slot_end)) : null,
      callerName: String(args.caller_name ?? args.callerName ?? "") || null,
      callerPhone: String(args.caller_phone ?? args.callerPhone ?? "") || null,
      status: "confirmed",
    }).returning({ id: bookings.id });
    return NextResponse.json({
      ok: true,
      booking_id: inserted[0]?.id,
      note: "Calendar OAuth optional; booking stored in Dial Hanna.",
    });
  }

  if (name === "take_message" || name === "log_message") {
    return NextResponse.json({
      ok: true,
      message: {
        name: args.caller_name ?? args.name ?? null,
        phone: args.caller_phone ?? args.phone ?? null,
        text: args.message ?? args.text ?? "",
      },
    });
  }

  if (name === "take_order") {
    if (!orgId || !callId) {
      return NextResponse.json({ ok: false, error: "org-call-required" }, { status: 400 });
    }
    const product = String(args.product ?? args.item ?? args.service ?? "").trim();
    const size = String(args.size ?? args.quantity ?? "").trim();
    const pickup = String(args.pickup_time ?? args.pickup ?? args.when ?? "").trim();
    const callerName = String(args.caller_name ?? args.callerName ?? args.name ?? "").trim();
    const callerPhone = String(args.caller_phone ?? args.callerPhone ?? args.phone ?? "").trim();
    const notes = String(args.notes ?? args.message ?? "").trim();
    const summary = [product, size, pickup, notes].filter(Boolean).join(" · ") || "order";
    const key = bookingIdempotencyKey(callId, pickup || "na", product || "order", 1);
    const existing = (await db.select().from(bookings).where(eq(bookings.idempotencyKey, key)).limit(1))[0];
    if (existing) {
      return NextResponse.json({ ok: true, order_id: existing.id, duplicate: true, summary });
    }
    const inserted = await db.insert(bookings).values({
      orgId,
      callId,
      idempotencyKey: key,
      serviceId: product || "order",
      slotStart: null,
      slotEnd: null,
      callerName: callerName || null,
      callerPhone: callerPhone || null,
      status: "confirmed",
    }).returning({ id: bookings.id });
    return NextResponse.json({
      ok: true,
      order_id: inserted[0]?.id,
      summary,
      note: "Order recorded for the shop to confirm price and pickup.",
    });
  }

  if (name === "log_knowledge_gap") {
    if (!orgId) return NextResponse.json({ ok: false, error: "org-required" }, { status: 400 });
    const q = String(args.question ?? "").trim();
    if (!q) return NextResponse.json({ ok: false, error: "question-required" }, { status: 400 });
    const inserted = await db.insert(knowledgeGaps).values({
      orgId,
      callId: callId || null,
      question: q,
      context: String(args.context ?? "") || null,
      status: "open",
    }).returning({ id: knowledgeGaps.id });
    return NextResponse.json({ ok: true, gap_id: inserted[0]?.id });
  }

  return NextResponse.json({ ok: false, error: `unknown-tool:${name}` }, { status: 404 });
}
