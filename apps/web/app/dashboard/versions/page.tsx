import { getDb } from "@/db/client.ts";
import { organizations, agentVersions, testSuiteRuns } from "@/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { publish, rollback } from "@/lib/versions.ts";
import { runLiveSuite } from "@/lib/suite_live.ts";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DEMO_ORG = "demo_demo-salon-01";

async function orgId() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, DEMO_ORG)).limit(1))[0];
  if (!org) throw new Error("org-not-found");
  return { db, id: org.id };
}

async function runSuiteAction(formData: FormData) {
  "use server";
  const scope = String(formData.get("scope") ?? "quick");
  const ids = scope === "all" ? undefined : ["hours", "price"];
  await runLiveSuite(DEMO_ORG, ids, 3);
  revalidatePath("/dashboard/versions");
}

type V = { id: string; orgId: string; status: "draft" | "tested" | "live" | "archived"; readinessScore?: number; rollbackFrom?: string };

async function loadVersions(db: NonNullable<ReturnType<typeof getDb>>, orgId: string): Promise<V[]> {
  return (await db.select().from(agentVersions).where(eq(agentVersions.orgId, orgId))).map((v) => ({
    id: v.id, orgId: v.orgId, status: v.status as V["status"],
    readinessScore: v.readinessScore ?? undefined, rollbackFrom: v.rollbackFrom ?? undefined,
  }));
}

async function publishAction(formData: FormData) {
  "use server";
  const { db, id } = await orgId();
  const { versions, warning } = publish(await loadVersions(db, id), id, String(formData.get("versionId")));
  for (const v of versions) {
    await db.update(agentVersions).set({ status: v.status, rollbackFrom: v.rollbackFrom ?? null }).where(eq(agentVersions.id, v.id));
  }
  if (warning) console.warn(warning);
  revalidatePath("/dashboard/versions");
}

async function rollbackAction() {
  "use server";
  const { db, id } = await orgId();
  const { versions } = rollback(await loadVersions(db, id), id);
  for (const v of versions) {
    await db.update(agentVersions).set({ status: v.status, rollbackFrom: v.rollbackFrom ?? null }).where(eq(agentVersions.id, v.id));
  }
  revalidatePath("/dashboard/versions");
}

export default async function Versions() {
  const db = getDb();
  let vers: { id: string; status: string; readinessScore: number | null; rollbackFrom: string | null }[] = [];
  let runs: { id: string; score: number | null; createdAt: Date | null }[] = [];
  if (db) {
    const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, DEMO_ORG)).limit(1))[0];
    if (org) {
      vers = await db.select({ id: agentVersions.id, status: agentVersions.status, readinessScore: agentVersions.readinessScore, rollbackFrom: agentVersions.rollbackFrom })
        .from(agentVersions).where(eq(agentVersions.orgId, org.id));
      runs = await db.select({ id: testSuiteRuns.id, score: testSuiteRuns.score, createdAt: testSuiteRuns.createdAt })
        .from(testSuiteRuns).orderBy(desc(testSuiteRuns.createdAt)).limit(5);
    }
  }
  const live = vers.find((v) => v.status === "live");
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px", lineHeight: 1.6 }}>
      <p><a href="/dashboard">← Irányítópult</a></p>
      <h1>Tesztcsomag és verziók</h1>
      <p style={{ color: "#3E5157", fontSize: 14 }}>
        Gyors futtatás: 2 forgatókönyv × 3 kör valódi Meta-modellekkel.
        A teljes 10-es csomag időtúllépésbe futhat a szerverless limiten.
      </p>
      <form action={runSuiteAction} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input type="hidden" name="scope" value="quick" />
        <button type="submit" style={btn}>Tesztcsomag futtatása</button>
      </form>
      <form action={runSuiteAction} style={{ marginBottom: 24 }}>
        <input type="hidden" name="scope" value="all" />
        <button type="submit" style={btnGhost}>Teljes csomag (10 forgatókönyv)</button>
      </form>
      <h2 style={{ fontSize: 20 }}>Legutóbbi futtatások</h2>
      {runs.length === 0 && <p>Nincs futtatás.</p>}
      {runs.map((r) => (
        <p key={r.id}>Pontszám: <strong>{r.score ?? "—"}</strong> · {r.createdAt?.toISOString().slice(0, 16).replace("T", " ")}</p>
      ))}
      <h2 style={{ fontSize: 20 }}>Verziók</h2>
      {vers.map((v) => (
        <div key={v.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 13 }}>{v.id.slice(0, 8)}</span>
          <span>{v.status}{v.readinessScore != null ? ` · ${v.readinessScore}` : ""}</span>
          {v.status !== "live" && (
            <form action={publishAction}>
              <input type="hidden" name="versionId" value={v.id} />
              <button type="submit" style={btnGhost}>Élesít</button>
            </form>
          )}
        </div>
      ))}
      {live?.rollbackFrom !== undefined && (
        <form action={rollbackAction} style={{ marginTop: 12 }}>
          <button type="submit" style={btnGhost}>Visszaállítás az előző élőre</button>
        </form>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  background: "#0C1C20", color: "#fff", border: "none",
  borderRadius: 6, padding: "10px 20px", cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  background: "transparent", color: "#0C1C20", border: "1px solid #0C1C20",
  borderRadius: 6, padding: "10px 20px", cursor: "pointer",
};
