import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Webhook } from "svix";
import { getDb } from "../src/db/client.ts";
import { organizations } from "../src/db/schema.ts";
import { eq } from "drizzle-orm";
import {
  isSupportedClerkEvent,
  provisionOrganization,
  deleteOrganizationData,
} from "../src/lib/clerk_webhook.ts";

test("clerk event allowlist: org lifecycle in, user events out", () => {
  assert.equal(isSupportedClerkEvent("organization.created"), true);
  assert.equal(isSupportedClerkEvent("organization.updated"), true);
  assert.equal(isSupportedClerkEvent("organization.deleted"), true);
  assert.equal(isSupportedClerkEvent("user.created"), false);
  assert.equal(isSupportedClerkEvent("user.deleted"), false);
  assert.equal(isSupportedClerkEvent("organizationMembership.created"), false);
});

test("svix signature verifies with the configured signing secret", (t) => {
  const secret = process.env.CLERK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    t.skip("no signing secret set");
    return;
  }
  const wh = new Webhook(secret);
  const id = "msg_test123";
  const ts = String(Math.floor(Date.now() / 1000));
  const payload = JSON.stringify({ type: "organization.created", data: { id: "org_probe", name: "Probe" } });
  // Sign per the Svix spec: v1,base64(HMAC_SHA256(key, "id.timestamp.payload")).
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const sig = createHmac("sha256", key).update(`${id}.${ts}.${payload}`).digest("base64");
  const headers = { "svix-id": id, "svix-timestamp": ts, "svix-signature": `v1,${sig}` };
  // svix v2 verify() returns undefined on success and throws on failure;
  // the payload is read via JSON.parse after verification (as the route does).
  assert.equal(wh.verify(payload, headers), undefined);
  assert.equal((JSON.parse(payload) as { type: string }).type, "organization.created");
  assert.throws(() => wh.verify(payload + "x", headers));
});

test("neon: provision then delete a probe org", async (t) => {
  const db = getDb();
  if (!db) {
    t.skip("DATABASE_URL unset");
    return;
  }
  const probe = `org_probe_${Date.now()}`;
  try {
    const id = await provisionOrganization(db, { id: probe, name: "Webhook Próba" });
    assert.ok(id);
    const row = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, probe)).limit(1))[0];
    assert.equal(row?.name, "Webhook Próba");
    assert.equal(row?.plan, "trial");
    // Provision is idempotent (Clerk may retry delivery).
    const id2 = await provisionOrganization(db, { id: probe, name: "Webhook Próba" });
    assert.equal(id2, id);
  } finally {
    await deleteOrganizationData(db, probe);
  }
  const gone = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.clerkOrgId, probe));
  assert.equal(gone.length, 0);
});
