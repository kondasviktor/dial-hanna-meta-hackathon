import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client.ts";
import { organizations, agentVersions } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import { publish, rollback } from "@/lib/versions.ts";
import { revalidatePath } from "next/cache";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import { runLiveSuite } from "@/lib/suite_live.ts";
import { LOCKED_SCENARIOS } from "@/lib/testsuite.ts";

export const dynamic = "force-dynamic";

async function clerkOrgUuid() {
  const orgRes = await resolveOrgId();
  if (!orgRes.clerkOrgId) throw new Error("org-required");
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgRes.clerkOrgId)).limit(1))[0];
  if (!org) throw new Error("org-not-found");
  return { db, id: org.id, name: org.name, plan: org.plan };
}

type V = { id: string; orgId: string; status: "draft" | "tested" | "live" | "archived"; rollbackFrom?: string };

async function loadVersions(db: NonNullable<ReturnType<typeof getDb>>, orgId: string): Promise<V[]> {
  return (await db.select().from(agentVersions).where(eq(agentVersions.orgId, orgId))).map((v) => ({
    id: v.id, orgId: v.orgId, status: v.status as V["status"],
    rollbackFrom: v.rollbackFrom ?? undefined,
  }));
}

async function publishAction(formData: FormData) {
  "use server";
  const { db, id } = await clerkOrgUuid();
  const { versions, warning } = publish(await loadVersions(db, id), id, String(formData.get("versionId")));
  for (const v of versions) {
    await db.update(agentVersions).set({ status: v.status, rollbackFrom: v.rollbackFrom ?? null }).where(eq(agentVersions.id, v.id));
  }
  if (warning) console.warn(warning);
  revalidatePath("/dashboard/versions");
}

async function rollbackAction() {
  "use server";
  const { db, id } = await clerkOrgUuid();
  const { versions } = rollback(await loadVersions(db, id), id);
  for (const v of versions) {
    await db.update(agentVersions).set({ status: v.status, rollbackFrom: v.rollbackFrom ?? null }).where(eq(agentVersions.id, v.id));
  }
  revalidatePath("/dashboard/versions");
}

async function runSuiteAction() {
  "use server";
  const orgRes = await resolveOrgId();
  if (!orgRes.clerkOrgId) throw new Error("org-required");
  // Five locked scenarios, 2 turns each — demó beat, not a publish gate.
  const ids = LOCKED_SCENARIOS.slice(0, 5).map((s) => s.id);
  await runLiveSuite(orgRes.clerkOrgId, ids, 2);
  revalidatePath("/dashboard/versions");
}

export default async function Versions() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  let vers: { id: string; status: string; rollbackFrom: string | null; readinessScore: number | null }[] = [];
  let orgName = "";
  let orgPlan = "";
  try {
    const { db, id, name, plan } = await clerkOrgUuid();
    orgName = name;
    orgPlan = plan;
    vers = await db.select({
      id: agentVersions.id,
      status: agentVersions.status,
      rollbackFrom: agentVersions.rollbackFrom,
      readinessScore: agentVersions.readinessScore,
    }).from(agentVersions).where(eq(agentVersions.orgId, id));
  } catch {
    vers = [];
  }
  const live = vers.find((v) => v.status === "live");
  return (
    <div className="stub-wrap">
      <p className="dash-date">{orgName || "Vállalkozás"}{orgPlan ? ` · ${orgPlan}` : ""}</p>
      <h1 className="dash-title">Verziók</h1>
      <p className="muted">
        A közzététel azonnali. Rövid szöveges tesztsor (5 forgatókönyv) a demóhoz —
        nem kapu, csak pontszám.
      </p>
      <form action={runSuiteAction} style={{ marginBottom: 16 }}>
        <button type="submit" className="btn btn-outline btn-sm">Rövid tesztsor futtatása</button>
      </form>
      {vers.length === 0 && (
        <p className="muted">Még nincs mentett verzió. Az első élesítés hozza létre a v1-et.</p>
      )}
      {vers.map((v) => (
        <div key={v.id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: 13 }}>{v.id.slice(0, 8)}</span>
          <span>{v.status === "live" ? "Élő" : v.status}</span>
          {v.readinessScore != null && <span className="muted small">pont: {v.readinessScore}</span>}
          {v.status !== "live" && (
            <form action={publishAction}>
              <input type="hidden" name="versionId" value={v.id} />
              <button type="submit" className="btn btn-ghost btn-sm">Közzététel</button>
            </form>
          )}
        </div>
      ))}
      {live?.rollbackFrom && (
        <form action={rollbackAction} style={{ marginTop: 12 }}>
          <button type="submit" className="btn btn-ghost btn-sm">Visszagörgetés az előző élőre</button>
        </form>
      )}
      <p style={{ marginTop: 24 }}>
        <Link href="/dashboard">← Áttekintés</Link>
      </p>
    </div>
  );
}
