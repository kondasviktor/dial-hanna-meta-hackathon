import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { calls, usageLedger } from "@/db/schema.ts";
import { finalizeCallOutcome } from "@/lib/finalize_call.ts";
import { verifyVoiceRequest } from "@/lib/voice_auth.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.text();
  const path = `/api/voice/calls/${id}/complete`;
  const v = verifyVoiceRequest(req, "POST", path, body);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.reason }, { status: 401 });

  let payload: {
    transcript?: { role: string; text: string }[];
    tool_calls?: unknown;
    timings?: unknown;
    duration_s?: number;
    language?: string;
  };
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "db-unavailable" }, { status: 503 });

  const call = (await db.select().from(calls).where(eq(calls.id, id)).limit(1))[0];
  if (!call) return NextResponse.json({ ok: false, error: "call-not-found" }, { status: 404 });

  // Transcript is used only in memory to extract the structured summary.
  // We do not store call audio or the transcript text (privacy / Art. 28).
  await db.update(calls).set({
    endedAt: new Date(),
    durationS: payload.duration_s ?? null,
    transcript: null,
    toolCalls: payload.tool_calls ?? null,
    timings: payload.timings ?? null,
    language: payload.language ?? call.language ?? "en",
  }).where(eq(calls.id, id));

  const transcriptLines = (payload.transcript ?? []).map((t) => `${t.role}: ${t.text}`);
  const { outcome } = await finalizeCallOutcome(id, call.orgId, transcriptLines);

  if (payload.duration_s) {
    await db.insert(usageLedger).values({
      callId: id,
      component: "telephony",
      units: String(payload.duration_s),
      unitType: "seconds",
    });
  }

  return NextResponse.json({ ok: true, outcome });
}
