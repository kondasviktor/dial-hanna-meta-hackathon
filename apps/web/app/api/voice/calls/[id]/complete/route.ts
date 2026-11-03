import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { calls, callOutcomes, knowledgeGaps, usageLedger } from "@/db/schema.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { validateOutcome, type CallOutcome } from "@/lib/outcomes.ts";
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

  const transcriptText = (payload.transcript ?? [])
    .map((t) => `${t.role}: ${t.text}`)
    .join("\n")
    .slice(0, 12_000);

  let outcome: CallOutcome | null = null;
  try {
    const raw = await chat({
      model: MODELS.live,
      reasoningEffort: "low",
      json: true,
      maxTokens: 800,
      messages: [
        {
          role: "system",
          content: `Extract a call outcome JSON: {intent, outcome, next_action:{type,due_by,summary_hu,summary_en}, caller:{name,phone,language}, booking_id, knowledge_gap_questions:[], confidence}. Intent/outcome enums from Dial Hanna. language hu|en. Do not include sentiment.`,
        },
        { role: "user", content: transcriptText || "(empty transcript)" },
      ],
    });
    const parsed = JSON.parse(raw) as CallOutcome;
    if (validateOutcome(parsed).ok) outcome = parsed;
  } catch (e) {
    console.error("outcome-extract", e);
  }

  if (outcome) {
    const existing = (await db.select().from(callOutcomes).where(eq(callOutcomes.callId, id)).limit(1))[0];
    const row = {
      intent: outcome.intent,
      outcome: outcome.outcome,
      nextAction: outcome.next_action,
      ownerStatus: outcome.next_action?.type === "none" ? "done" : "open",
      sentiment: null,
      confidence: Math.round((outcome.confidence ?? 0) * 100),
    };
    if (existing) {
      await db.update(callOutcomes).set(row).where(eq(callOutcomes.callId, id));
    } else {
      await db.insert(callOutcomes).values({ callId: id, ...row });
    }
    for (const q of outcome.knowledge_gap_questions ?? []) {
      if (!q?.trim()) continue;
      await db.insert(knowledgeGaps).values({
        orgId: call.orgId,
        callId: id,
        question: q.trim(),
        status: "open",
      });
    }
  }

  if (payload.duration_s) {
    await db.insert(usageLedger).values({
      callId: id,
      component: "telephony",
      units: String(payload.duration_s),
      unitType: "seconds",
    });
  }

  return NextResponse.json({ ok: true, outcome: outcome?.outcome ?? null });
}
