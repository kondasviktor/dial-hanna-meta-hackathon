// Post-call outcome extraction shared by voice paths.
// Twilio Gather calls this after hangup; the Fly/Pipecat path calls it from
// /api/voice/calls/:id/complete with a signed body. Transcript stays in
// memory only; only the structured summary is stored.

import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { callOutcomes, knowledgeGaps } from "@/db/schema.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { outcomeSystemPrompt, validateOutcome, type CallOutcome } from "@/lib/outcomes.ts";

export async function finalizeCallOutcome(
  callId: string,
  orgId: string | null,
  transcriptLines: string[],
): Promise<{ outcome: string | null }> {
  const transcriptText = transcriptLines.join("\n").slice(0, 12_000);
  let outcome: CallOutcome | null = null;
  try {
    const raw = await chat({
      model: MODELS.live,
      reasoningEffort: "low",
      json: true,
      // Reasoning tokens eat this budget (DEVIATIONS #4): one probe burned
      // ~800 reasoning tokens on a 3-line transcript, so keep wide headroom.
      maxTokens: 2000,
      messages: [
        { role: "system", content: outcomeSystemPrompt() },
        { role: "user", content: transcriptText || "(empty transcript)" },
      ],
    });
    const parsed = JSON.parse(raw) as CallOutcome;
    const check = validateOutcome(parsed);
    if (check.ok) {
      outcome = parsed;
    } else {
      // Shape only (no transcript text): why did the dashboard miss a row?
      console.error("outcome-invalid", check.errors);
    }
  } catch (e) {
    console.error("outcome-extract", e);
  }

  if (!outcome) return { outcome: null };

  const db = getDb();
  if (!db) return { outcome: null };
  const existing = (await db.select().from(callOutcomes).where(eq(callOutcomes.callId, callId)).limit(1))[0];
  const row = {
    intent: outcome.intent,
    outcome: outcome.outcome,
    nextAction: outcome.next_action,
    ownerStatus: outcome.next_action?.type === "none" ? "done" : "open",
    sentiment: null,
    confidence: Math.round((outcome.confidence ?? 0) * 100),
  };
  if (existing) {
    await db.update(callOutcomes).set(row).where(eq(callOutcomes.callId, callId));
  } else {
    await db.insert(callOutcomes).values({ callId, ...row });
  }
  if (orgId) {
    for (const q of outcome.knowledge_gap_questions ?? []) {
      if (!q?.trim()) continue;
      await db.insert(knowledgeGaps).values({
        orgId,
        callId,
        question: q.trim(),
        status: "open",
      });
    }
  }
  return { outcome: outcome.outcome };
}
