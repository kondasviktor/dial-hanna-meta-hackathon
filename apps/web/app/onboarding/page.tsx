import { getDb } from "@/db/client.ts";
import { organizations, businessProfiles, faqs } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const DEMO_ORG = "demo_demo-salon-01";
const REQUIRED = ["hours", "services", "booking_rules"] as const;

async function setFaqStatus(formData: FormData) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const id = String(formData.get("faqId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "approved" && status !== "rejected") throw new Error("bad-status");
  await db.update(faqs).set({ status }).where(eq(faqs.id, id));
  revalidatePath("/onboarding");
}

export default async function Onboarding() {
  const db = getDb();
  let items: { id: string; qHu: string; aHu: string; origin: string; status: string }[] = [];
  let missing: string[] = [...REQUIRED];
  let bizName = "";
  if (db) {
    const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, DEMO_ORG)).limit(1))[0];
    if (org) {
      const prof = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1))[0];
      const b = (prof?.profile ?? {}) as { name?: string; hours?: unknown[]; services?: unknown[] };
      bizName = b.name ?? "";
      missing = REQUIRED.filter((r) => {
        if (r === "hours") return !(Array.isArray(b.hours) && b.hours.length > 0);
        if (r === "services") return !(Array.isArray(b.services) && b.services.length > 0);
        return true; // booking_rules live in playbooks until the wizard writes them
      });
      items = (await db.select().from(faqs).where(eq(faqs.orgId, org.id))).map((f) => ({
        id: f.id, qHu: f.qHu, aHu: f.aHu, origin: f.origin, status: f.status,
      }));
    }
  }
  const badge = (origin: string) =>
    origin === "import" ? "tény" : origin === "gap" ? "tanult" : "kézi";
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px", lineHeight: 1.6 }}>
      <p><a href="/dashboard">← Irányítópult</a></p>
      <h1>Tudás átnézése{bizName ? ` · ${bizName}` : ""}</h1>
      <p style={{ color: "#3E5157", fontSize: 14 }}>
        Importált elemek: tény (forrásból), tanult (tudásrésből), kézi. Csak a jóváhagyott
        kerül élőbe. Következtetés sose megy ki jóváhagyás nélkül.
      </p>
      {missing.length > 0 && (
        <div style={{ background: "#0E2A30", color: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <strong>Hiányzik:</strong> {missing.join(", ")}
        </div>
      )}
      {items.length === 0 && <p>Nincs átnézendő elem.</p>}
      {items.map((f) => (
        <div key={f.id} style={{ borderTop: "1px solid #D8DDD6", padding: "12px 0" }}>
          <p style={{ margin: 0 }}>
            <span className="mono" style={{ fontSize: 12, background: "#0C1C20", color: "#FFB62E", borderRadius: 4, padding: "2px 8px" }}>
              {badge(f.origin)}
            </span>{" "}
            <span style={{ fontSize: 13, color: "#3E5157" }}>{f.status}</span>
          </p>
          <p style={{ margin: "8px 0 4px" }}><strong>{f.qHu}</strong></p>
          <p style={{ margin: "0 0 8px" }}>{f.aHu}</p>
          {f.status === "draft" && (
            <div style={{ display: "flex", gap: 8 }}>
              <form action={setFaqStatus}>
                <input type="hidden" name="faqId" value={f.id} />
                <input type="hidden" name="status" value="approved" />
                <button type="submit" style={btn}>Jóváhagy</button>
              </form>
              <form action={setFaqStatus}>
                <input type="hidden" name="faqId" value={f.id} />
                <input type="hidden" name="status" value="rejected" />
                <button type="submit" style={btnGhost}>Elvet</button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#0C1C20", color: "#fff", border: "none",
  borderRadius: 6, padding: "8px 16px", cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  background: "transparent", color: "#0C1C20", border: "1px solid #0C1C20",
  borderRadius: 6, padding: "8px 16px", cursor: "pointer",
};
