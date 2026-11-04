// Resolve the signed-in Clerk org → Neon organization row.

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import {
  agentVersions,
  businessProfiles,
  organizations,
  phoneNumbers,
} from "@/db/schema.ts";
import { isAdminEmail } from "@/lib/admin.ts";
import { isPlaceholderOrgName, orgNameToStore } from "@/lib/org_name.ts";
import { provisionOrganization } from "@/lib/clerk_webhook.ts";

export async function requireAdmin() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress
    ?? user?.emailAddresses?.[0]?.emailAddress
    ?? null;
  if (!isAdminEmail(email)) {
    return { ok: false as const, email };
  }
  const { orgId } = await auth();
  return { ok: true as const, email, orgId: orgId ?? null, user };
}

export async function resolveOrgId(): Promise<{
  clerkOrgId: string | null;
  orgUuid: string | null;
  name: string | null;
  plan: string | null;
}> {
  const { orgId } = await auth();
  if (!orgId) return { clerkOrgId: null, orgUuid: null, name: null, plan: null };
  const db = getDb();
  if (!db) return { clerkOrgId: orgId, orgUuid: null, name: null, plan: null };
  let row = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgId)).limit(1))[0];
  // Source of truth for the display name is Clerk — the owner named the org
  // there ("Carlo's Bakery"). Used for inline provisioning + healing rows
  // that were provisioned earlier with a language-specific placeholder.
  let clerkName: string | null = null;
  try {
    const client = await clerkClient();
    const clerkOrg = await client.organizations.getOrganization({ organizationId: orgId });
    clerkName = clerkOrg.name?.trim() || null;
  } catch (e) {
    console.error("clerk-org-name", e);
  }
  if (!row) {
    const id = await provisionOrganization(db, { id: orgId, name: orgNameToStore(clerkName) });
    row = (await db.select().from(organizations).where(eq(organizations.id, id)).limit(1))[0];
  } else if (clerkName && isPlaceholderOrgName(row.name)) {
    await db.update(organizations).set({ name: clerkName }).where(eq(organizations.id, row.id));
    row = { ...row, name: clerkName };
  }
  return {
    clerkOrgId: orgId,
    orgUuid: row?.id ?? null,
    name: row?.name ?? null,
    plan: row?.plan ?? null,
  };
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Resolve which Neon org a Twilio/voice call should load knowledge for. */
export async function resolveCallOrg(opts?: {
  orgId?: string | null;
  toE164?: string | null;
}): Promise<typeof organizations.$inferSelect | null> {
  const db = getDb();
  if (!db) return null;

  const explicit = opts?.orgId?.trim();
  if (explicit && UUID_RE.test(explicit)) {
    const row = (
      await db.select().from(organizations).where(eq(organizations.id, explicit)).limit(1)
    )[0];
    if (row) return row;
  }

  const to = opts?.toE164?.trim();
  if (to && to.startsWith("+")) {
    const phone = (
      await db.select().from(phoneNumbers).where(eq(phoneNumbers.e164, to)).limit(1)
    )[0];
    if (phone) {
      const row = (
        await db.select().from(organizations).where(eq(organizations.id, phone.orgId)).limit(1)
      )[0];
      if (row) return row;
    }
  }

  const live = (
    await db.select().from(agentVersions).where(eq(agentVersions.status, "live")).limit(1)
  )[0];
  if (live) {
    const row = (
      await db.select().from(organizations).where(eq(organizations.id, live.orgId)).limit(1)
    )[0];
    if (row) return row;
  }

  // Prefer an org that actually has an imported business profile (not an empty shell).
  const withProfile = (
    await db
      .select({ org: organizations })
      .from(organizations)
      .innerJoin(businessProfiles, eq(businessProfiles.orgId, organizations.id))
      .orderBy(desc(businessProfiles.updatedAt))
      .limit(1)
  )[0];
  if (withProfile?.org) return withProfile.org;

  return (await db.select().from(organizations).limit(1))[0] ?? null;
}
