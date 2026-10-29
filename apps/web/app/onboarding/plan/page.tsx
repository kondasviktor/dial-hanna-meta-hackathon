import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client.ts";
import { organizations } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import { provisionOrganization } from "@/lib/clerk_webhook.ts";
import { TRIAL_DAYS, TRIAL_MINUTES, TRIAL_PLANS, isTrialPlan, type TrialPlan } from "@/lib/trial.ts";

export const dynamic = "force-dynamic";

const PLAN_META: Record<TrialPlan, { name: string; price: string; minutes: string }> = {
  essential: { name: "Essential", price: "19 900 Ft / hó", minutes: "100 AI-perc / hó" },
  pro: { name: "Pro", price: "34 900 Ft / hó", minutes: "250 AI-perc / hó" },
  business: { name: "Business", price: "59 900 Ft / hó", minutes: "500 AI-perc / hó" },
};

async function startTrial(formData: FormData) {
  "use server";
  const { orgId: clerkOrgId } = await auth();
  if (!clerkOrgId) throw new Error("org-required");
  const plan = String(formData.get("plan") ?? "");
  if (!isTrialPlan(plan)) throw new Error("bad-plan");
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  // Webhook normally provisions first; ensure the row if delivery lagged.
  const existing = (await db.select({ id: organizations.id })
    .from(organizations).where(eq(organizations.clerkOrgId, clerkOrgId)).limit(1))[0];
  const id = existing?.id ?? await provisionOrganization(db, { id: clerkOrgId, name: "Névtelen vállalkozás" });
  const started = new Date();
  await db.update(organizations)
    .set({ trialPlan: plan, trialStartedAt: started })
    .where(eq(organizations.id, id));
  revalidatePath("/onboarding/plan");
  redirect("/onboarding");
}

export default async function PlanPage() {
  const { orgId } = await auth();
  if (!orgId) redirect("/create-org");
  const db = getDb();
  let current: { trialPlan: string | null; trialStartedAt: Date | null } | null = null;
  if (db) {
    const row = (await db.select({ trialPlan: organizations.trialPlan, trialStartedAt: organizations.trialStartedAt })
      .from(organizations).where(eq(organizations.clerkOrgId, orgId)).limit(1))[0];
    if (row) current = row;
  }
  if (current?.trialPlan && current.trialStartedAt) {
    redirect("/onboarding");
  }
  return (
    <div className="stub-wrap">
      <h1 className="dash-title">Válassz csomagot — indul a próba</h1>
      <p className="muted">
        {TRIAL_DAYS} nap, bankkártya nélkül, {TRIAL_MINUTES} AI-perccel valódi
        átirányított hívásokra. A próba a választás pillanatában indul.
      </p>
      <form action={startTrial}>
        {TRIAL_PLANS.map((p) => (
          <label key={p} className="plan-pick">
            <input type="radio" name="plan" value={p} defaultChecked={p === "pro"} required />
            <span>
              <strong>{PLAN_META[p].name}</strong> · {PLAN_META[p].price} · {PLAN_META[p].minutes}
            </span>
          </label>
        ))}
        <p style={{ marginTop: 20 }}>
          <button type="submit" className="btn btn-primary">Próba indítása</button>
        </p>
      </form>
    </div>
  );
}
