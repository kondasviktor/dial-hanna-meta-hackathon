import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { businessProfiles, organizations } from "@/db/schema.ts";

type Profile = { hannaEnabled?: boolean; [k: string]: unknown };

/** Whether Hanna should answer inbound calls for this org (default: on). */
export async function getHannaEnabled(orgUuid: string | null): Promise<boolean> {
  if (process.env.HANNA_ANSWERING === "0") return false;
  if (!orgUuid) return true;
  const db = getDb();
  if (!db) return true;
  const row = (
    await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgUuid)).limit(1)
  )[0];
  if (!row) return true;
  const profile = (row.profile ?? {}) as Profile;
  return profile.hannaEnabled !== false;
}

export async function setHannaEnabled(orgUuid: string, enabled: boolean): Promise<void> {
  const db = getDb();
  if (!db) return;
  const row = (
    await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgUuid)).limit(1)
  )[0];
  if (row) {
    const profile = { ...(row.profile as Profile), hannaEnabled: enabled };
    await db
      .update(businessProfiles)
      .set({ profile, updatedAt: new Date() })
      .where(eq(businessProfiles.orgId, orgUuid));
    return;
  }
  await db.insert(businessProfiles).values({
    orgId: orgUuid,
    profile: { hannaEnabled: enabled },
  });
}

/** Demo / single-tenant: first org or env override. Used by Twilio/Telnyx webhooks (no Clerk session). */
export async function getGlobalHannaEnabled(): Promise<boolean> {
  if (process.env.HANNA_ANSWERING === "0") return false;
  const db = getDb();
  if (!db) return true;
  const org = (await db.select().from(organizations).limit(1))[0];
  if (!org) return true;
  return getHannaEnabled(org.id);
}
