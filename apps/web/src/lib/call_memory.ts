/** In-call conversation memory keyed by Twilio CallSid (Neon-backed). */

import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { calls } from "@/db/schema.ts";

export type CallTurn = { role: "user" | "assistant"; content: string };

const MAX_TURNS = 12;

function asTurns(raw: unknown): CallTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: CallTurn[] = [];
  for (const t of raw) {
    if (!t || typeof t !== "object") continue;
    const role = (t as { role?: string }).role;
    const content = String((t as { content?: string }).content ?? "").trim();
    if ((role === "user" || role === "assistant") && content) {
      out.push({ role, content });
    }
  }
  return out.slice(-MAX_TURNS);
}

/** Load or create an open call row for this Twilio CallSid. */
export async function ensureCallSession(opts: {
  callSid: string;
  orgId: string;
  fromE164?: string | null;
  toE164?: string | null;
  language: string;
  channel?: string;
}): Promise<{ callId: string; turns: CallTurn[] } | null> {
  const db = getDb();
  if (!db || !opts.callSid.trim() || !opts.orgId) return null;

  const sid = opts.callSid.trim();
  const existing = (
    await db.select().from(calls).where(eq(calls.externalId, sid)).limit(1)
  )[0];

  if (existing && !existing.endedAt) {
    return { callId: existing.id, turns: asTurns(existing.transcript) };
  }

  if (existing?.endedAt) {
    // Rare CallSid reuse — start a fresh open session by clearing end + transcript.
    await db
      .update(calls)
      .set({
        endedAt: null,
        durationS: null,
        transcript: [],
        language: opts.language,
        orgId: opts.orgId,
        fromE164: opts.fromE164 ?? existing.fromE164,
        toE164: opts.toE164 ?? existing.toE164,
      })
      .where(eq(calls.id, existing.id));
    return { callId: existing.id, turns: [] };
  }

  const inserted = await db
    .insert(calls)
    .values({
      orgId: opts.orgId,
      channel: opts.channel ?? "phone",
      fromE164: opts.fromE164 ?? null,
      toE164: opts.toE164 ?? null,
      externalId: sid,
      language: opts.language,
      transcript: [],
    })
    .returning({ id: calls.id });

  return { callId: inserted[0]!.id, turns: [] };
}

export async function saveCallTurns(callId: string, turns: CallTurn[]): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(calls)
    .set({ transcript: turns.slice(-MAX_TURNS) })
    .where(and(eq(calls.id, callId), isNull(calls.endedAt)));
}

/** End the call and wipe transcript text (privacy). */
export async function endCallSession(callId: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await db
    .update(calls)
    .set({
      endedAt: new Date(),
      transcript: null,
    })
    .where(eq(calls.id, callId));
}
