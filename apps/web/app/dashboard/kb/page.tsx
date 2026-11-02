import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs, knowledgeGaps, organizations } from "@/db/schema.ts";
import { buildFaqDraft } from "@/lib/gaps.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import ImportForm from "../../onboarding/import-form";

export const dynamic = "force-dynamic";

const MISSING_LABELS: Record<string, string> = {
  hours: "nyitvatartás",
  services: "szolgáltatások",
};

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
    orgId: gap.orgId,
    qHu: draft.qHu,
    aHu: draft.aHu,
    qEn: draft.qEn,
    aEn: draft.aEn,
    origin: "gap",
    status: "approved",
  }).returning({ id: faqs.id });
  await db.update(knowledgeGaps).set({
    status: "approved",
    approvedFaqId: inserted[0].id,
  }).where(eq(knowledgeGaps.id, gapId));
  revalidatePath("/dashboard/kb");
  revalidatePath("/dashboard/gaps");
  revalidatePath("/dashboard");
}

async function setFaqStatus(formData: FormData) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const id = String(formData.get("faqId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "approved" && status !== "rejected") throw new Error("bad-status");
  await db.update(faqs).set({ status }).where(eq(faqs.id, id));
  revalidatePath("/dashboard/kb");
  revalidatePath("/onboarding");
}

async function addManualFaq(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  if (!admin.ok) throw new Error("forbidden");
  const orgRes = await resolveOrgId();
  if (!orgRes.orgUuid) throw new Error("org-required");
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const q = String(formData.get("q") ?? "").trim();
  const a = String(formData.get("a") ?? "").trim();
  if (!q || !a) throw new Error("q-a-required");
  await db.insert(faqs).values({
    orgId: orgRes.orgUuid,
    qHu: q,
    aHu: a,
    origin: "manual",
    status: "draft",
  });
  revalidatePath("/dashboard/kb");
}

export default async function KnowledgeBasePage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const orgRes = await resolveOrgId();
  if (!orgRes.clerkOrgId) redirect("/create-org");

  const db = getDb();
  let rows: { id: string; qHu: string; aHu: string; status: string; origin: string }[] = [];
  let gaps: { id: string; question: string; context: string | null; status: string }[] = [];
  let missing: string[] = [];
  let bizName = "";

  if (db) {
    const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgRes.clerkOrgId)).limit(1))[0];
    if (org) {
      const prof = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1))[0];
      const b = (prof?.profile ?? {}) as { name?: string; hours?: unknown[]; services?: unknown[] };
      bizName = b.name ?? org.name ?? "";
      if (!(Array.isArray(b.hours) && b.hours.length > 0)) missing.push("hours");
      if (!(Array.isArray(b.services) && b.services.length > 0)) missing.push("services");

      rows = (await db.select().from(faqs).where(eq(faqs.orgId, org.id))).map((f) => ({
        id: f.id, qHu: f.qHu, aHu: f.aHu, status: f.status, origin: f.origin,
      }));
      gaps = (await db.select().from(knowledgeGaps).where(eq(knowledgeGaps.orgId, org.id))).map((g) => ({
        id: g.id, question: g.question, context: g.context, status: g.status,
      }));
    }
  }

  const openGaps = gaps.filter((g) => g.status === "open");
  const badge = (origin: string) =>
    origin === "import" ? "import" : origin === "gap" ? "pótlás" : "kézi";

  return (
    <div>
      <h1 className="dash-title">Tudás{bizName ? ` · ${bizName}` : ""}</h1>
      <p className="muted">
        Weboldal vagy Facebook Page beillesztése, hiányzó válaszok pótlása, és a jóváhagyott tudás.
      </p>

      <div className="dash-card">
        <h2>Import</h2>
        <p className="muted small" style={{ marginBottom: 12 }}>
          Illeszd be a weboldal vagy Facebook Page címét — készül belőle 5 kérdés–válasz vázlat.
          Nincs oldalad? Írd be kézzel lent. Csak a jóváhagyott válasz megy élőbe.
        </p>
        <ImportForm />
        {missing.length > 0 && (
          <p className="muted small" style={{ marginTop: 12 }}>
            <strong>Hiányzik a profilból:</strong>{" "}
            {missing.map((m) => MISSING_LABELS[m] ?? m).join(", ")}
          </p>
        )}
      </div>

      <div className="dash-card gap-callout">
        <h2>Pótolandó válaszok{openGaps.length > 0 ? ` · ${openGaps.length}` : ""}</h2>
        <p className="muted small">
          Amit Hanna nem tudott: írd meg egy mondatban, és legközelebb már válaszol.
        </p>
        {openGaps.length === 0 && <p className="muted">Nincs nyitott kérdés.</p>}
        {openGaps.map((g) => (
          <div key={g.id} style={{ borderTop: "1px solid #e8c87a", padding: "12px 0" }}>
            <strong>{g.question}</strong>
            {g.context && <div className="muted small">{g.context}</div>}
            <form action={answerGap} style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="hidden" name="gapId" value={g.id} />
              <input name="answer" required placeholder="Válasz egy mondatban…" style={{ flex: 1, minWidth: 180, padding: 8 }} />
              <button type="submit" className="btn btn-primary btn-sm">Mentés</button>
            </form>
          </div>
        ))}
      </div>

      <div className="dash-card">
        <h2>Kézi kérdés és válasz</h2>
        <form action={addManualFaq} style={{ display: "grid", gap: 8 }}>
          <input name="q" required placeholder="Kérdés" style={input} />
          <textarea name="a" required placeholder="Válasz" rows={3} style={input} />
          <button type="submit" className="btn btn-primary btn-sm" style={{ justifySelf: "start" }}>
            Hozzáadás
          </button>
        </form>
      </div>

      <h2 className="dash-title" style={{ fontSize: 22, marginTop: 8 }}>Kérdések és válaszok</h2>
      {rows.length === 0 && <p className="muted">Még üres.</p>}
      {rows.map((f) => (
        <div key={f.id} className="dash-card" style={{ marginBottom: 12 }}>
          <p className="muted small">{badge(f.origin)} · {f.status}</p>
          <p><strong>{f.qHu}</strong></p>
          <p>{f.aHu}</p>
          {f.status === "draft" && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <form action={setFaqStatus}>
                <input type="hidden" name="faqId" value={f.id} />
                <input type="hidden" name="status" value="approved" />
                <button type="submit" className="btn btn-primary btn-sm">Jóváhagy</button>
              </form>
              <form action={setFaqStatus}>
                <input type="hidden" name="faqId" value={f.id} />
                <input type="hidden" name="status" value="rejected" />
                <button type="submit" className="btn btn-outline btn-sm">Elvet</button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const input = {
  border: "1px solid #D8DDD6",
  borderRadius: 8,
  padding: "10px 12px",
  font: "inherit",
} as const;
