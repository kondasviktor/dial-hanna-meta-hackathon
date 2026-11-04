/** Shared softphone turn helpers (knowledge + prompt). */

import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs, knowledgeGaps } from "@/db/schema.ts";
import { resolveCallOrg } from "@/lib/org.ts";
import { renderBusinessKnowledge } from "@/lib/business_knowledge.ts";
import type { CallTurn } from "@/lib/call_memory.ts";

/** Turns sent to Spark (keep short for latency). */
export const LLM_HISTORY_TURNS = 8;

export async function loadKnowledge(orgId?: string | null, toE164?: string | null): Promise<{
  knowledge: string;
  orgId: string | null;
  businessName: string;
}> {
  const org = await resolveCallOrg({ orgId, toE164 });
  if (!org) {
    return {
      knowledge: "No organization configured.",
      orgId: null,
      businessName: "the business",
    };
  }
  const db = getDb();
  if (!db) {
    return {
      knowledge: "No business knowledge loaded yet.",
      orgId: org.id,
      businessName: org.name,
    };
  }
  const prof = (
    await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1)
  )[0];
  const allFaqs = await db.select().from(faqs).where(eq(faqs.orgId, org.id));
  const profile = (prof?.profile ?? null) as Parameters<typeof renderBusinessKnowledge>[0];
  let knowledge = renderBusinessKnowledge(profile, allFaqs, { fallbackName: org.name });
  // Cap knowledge size — large product lists burn Spark latency.
  if (knowledge.length > 3500) knowledge = `${knowledge.slice(0, 3500)}\n…`;
  const businessName =
    (profile && typeof profile === "object" && "name" in profile && profile?.name?.trim()) ||
    org.name;
  return { knowledge, orgId: org.id, businessName };
}

export function softphoneSystemPrompt(
  businessName: string,
  replyLang: string,
  knowledge: string,
): string {
  return `You are Hanna, AI phone receptionist for ${businessName}. Reply in ${replyLang}. Max 2 short sentences (except order read-back). Never say "Dial Hanna".
Answer the caller's LATEST utterance first. Use earlier turns only as context — do not answer an older topic if they corrected you.
If they ask your name: you are Hanna, the AI receptionist for ${businessName}.
Use knowledge only — do not invent facts. Do not dump hours unless they asked about hours/open/closed.
Memory: never re-ask product, size, pickup, name, or phone already given. Ask only the next missing order slot.
Orders need: product(+size), pickup day/time in hours, name, phone → then read back once.
If truly unknown (not in knowledge): note it for the owner and ask name+phone if missing.
Knowledge:
${knowledge}`;
}

export function historyForLlm(turns: CallTurn[]): CallTurn[] {
  return turns.slice(-LLM_HISTORY_TURNS);
}

/** Persist an open knowledge gap when Hanna cannot answer from KB. */
export async function maybeLogKnowledgeGap(opts: {
  orgId: string;
  callId: string | null;
  question: string;
  spoken: string;
}): Promise<void> {
  const q = opts.question.trim();
  if (!q || q.length < 8) return;
  const s = opts.spoken.toLowerCase();
  const looksLikeGap =
    /note (it|that)|pass (it|this) (on|along)|owner|don'?t (have|know)|not sure|knowledge|callback|call you back|leave a message|írok|jegyz|tulajdonos|nem tudom|nem szerepel/i.test(
      s,
    );
  if (!looksLikeGap) return;
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(knowledgeGaps).values({
      orgId: opts.orgId,
      callId: opts.callId,
      question: q.slice(0, 500),
      context: opts.spoken.slice(0, 500),
      status: "open",
    });
  } catch (e) {
    console.error("log-knowledge-gap", e);
  }
}
