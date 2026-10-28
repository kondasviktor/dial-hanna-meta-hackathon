// Knowledge-gap loop (Master Spec §6.12).
// Owner types/speaks one answer → clean FAQ draft (HU+EN) → approve →
// new draft version → quick re-test → publish. Pure shaping here; the
// Spark FAQ-rewrite polish plugs in when the Meta key is present.

export type GapStatus = "open" | "answered" | "approved" | "rejected";

export interface KnowledgeGap {
  id: string;
  orgId: string;
  callId: string;
  question: string;
  context: string;
  timesAsked: number;
  status: GapStatus;
}

export interface FaqDraft {
  qHu: string;
  aHu: string;
  qEn: string;
  aEn: string;
}

// Deterministic draft from owner answer. LLM polish (Spark, low effort)
// refines wording later; the owner always approves before anything goes live.
export function buildFaqDraft(question: string, ownerAnswer: string): FaqDraft {
  const q = question.trim().replace(/\s+/g, " ");
  const a = ownerAnswer.trim().replace(/\s+/g, " ");
  if (!q || !a) throw new Error("empty-gap-answer");
  return {
    qHu: q.endsWith("?") ? q : `${q}?`,
    aHu: a,
    // Placeholders pending translation pass (Spark or owner). Never live until approved.
    qEn: `[EN-TRANSLATION-NEEDED] ${q}`,
    aEn: `[EN-TRANSLATION-NEEDED] ${a}`,
  };
}

export function inboxByFrequency(gaps: KnowledgeGap[]): KnowledgeGap[] {
  return [...gaps]
    .filter((g) => g.status === "open" || g.status === "answered")
    .sort((a, b) => b.timesAsked - a.timesAsked);
}
