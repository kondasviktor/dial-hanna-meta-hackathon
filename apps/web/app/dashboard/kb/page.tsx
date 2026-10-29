import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { faqs, organizations } from "@/db/schema.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const orgRes = await resolveOrgId();
  if (!orgRes.clerkOrgId) redirect("/create-org");
  const db = getDb();
  let rows: { id: string; qHu: string; aHu: string; status: string; origin: string }[] = [];
  if (db) {
    const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgRes.clerkOrgId)).limit(1))[0];
    if (org) {
      rows = (await db.select().from(faqs).where(eq(faqs.orgId, org.id))).map((f) => ({
        id: f.id, qHu: f.qHu, aHu: f.aHu, status: f.status, origin: f.origin,
      }));
    }
  }
  return (
    <div>
      <h1 className="dash-title">Tudásbázis</h1>
      <p className="muted">
        Jóváhagyott kérdések és válaszok. Szerkesztés:{" "}
        <a href="/onboarding">beüzemelés</a>.
      </p>
      {rows.length === 0 && <p className="muted">Még üres.</p>}
      {rows.map((f) => (
        <div key={f.id} className="dash-card" style={{ marginBottom: 12 }}>
          <p className="muted small">{f.origin} · {f.status}</p>
          <p><strong>{f.qHu}</strong></p>
          <p>{f.aHu}</p>
        </div>
      ))}
    </div>
  );
}
