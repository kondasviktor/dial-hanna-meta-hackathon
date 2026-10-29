// Resolve the signed-in Clerk org → Neon organization row.

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { organizations } from "@/db/schema.ts";
import { isAdminEmail } from "@/lib/admin.ts";
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
  if (!row) {
    const id = await provisionOrganization(db, { id: orgId, name: "Vállalkozás" });
    row = (await db.select().from(organizations).where(eq(organizations.id, id)).limit(1))[0];
  }
  return {
    clerkOrgId: orgId,
    orgUuid: row?.id ?? null,
    name: row?.name ?? null,
    plan: row?.plan ?? null,
  };
}
