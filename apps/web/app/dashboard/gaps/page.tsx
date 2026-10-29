import { redirect } from "next/navigation";
import { getDb } from "@/db/client.ts";
import { knowledgeGaps, faqs, organizations } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import { buildFaqDraft } from "@/lib/gaps.ts";
import { revalidatePath } from "next/cache";
import GapsList from "./list";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";

async function answerGap(formData: FormData) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const gapId = String(formData.get("gapId") ?? "");
  const answer = String(formData.get("answer") ?? "");
  const gap = (await db.select().from(knowledgeGaps).where(eq(knowledgeGaps.id, gapId)).limit(1))[0];
  if (!gap) throw new Error("gap-not-found");
  const draft = buildFaqDraft(gap.question, answer);
  const inserted = await db.insert(faqs).values({
    orgId: gap.orgId, qHu: draft.qHu, aHu: draft.aHu,
    qEn: draft.qEn, aEn: draft.aEn, origin: "gap", status: "approved",
  }).returning({ id: faqs.id });
  await db.update(knowledgeGaps).set({
    status: "approved",
    approvedFaqId: inserted[0].id,
  }).where(eq(knowledgeGaps.id, gapId));
  revalidatePath("/dashboard/gaps");
  revalidatePath("/dashboard/kb");
}

export default async function Gaps() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const orgRes = await resolveOrgId();
  const db = getDb();
  let gaps: { id: string; question: string; context: string | null; status: string }[] = [];
  if (db && orgRes.clerkOrgId) {
    const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgRes.clerkOrgId)).limit(1))[0];
    if (org) {
      gaps = (await db.select().from(knowledgeGaps).where(eq(knowledgeGaps.orgId, org.id))).map((g) => ({
        id: g.id, question: g.question, context: g.context, status: g.status,
      }));
    }
  }
  return <GapsList gaps={gaps} answerGap={answerGap} />;
}

export const dynamic = "force-dynamic";
