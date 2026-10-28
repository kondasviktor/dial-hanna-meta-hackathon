// Seeds fictional demo tenants from seed/*.json into Neon.
// Usage: set -a; . ../../.env; node scripts/seed.mjs
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const query = neon(process.env.DATABASE_URL);
const files = readdirSync(join(root, "seed")).filter((f) => f.endsWith(".json")).sort();

for (const f of files) {
  const t = JSON.parse(readFileSync(join(root, "seed", f), "utf8"));
  const clerkOrgId = `demo_${t.tenant}`;
  const orgs = await query`select id from organizations where clerk_org_id = ${clerkOrgId}`;
  let orgId = orgs[0]?.id;
  if (!orgId) {
    const r = await query`insert into organizations (clerk_org_id, name, plan) values (${clerkOrgId}, ${t.business.name}, 'trial') returning id`;
    orgId = r[0].id;
  }
  await query`delete from business_profiles where org_id = ${orgId}`;
  await query`insert into business_profiles (org_id, profile) values (${orgId}, ${JSON.stringify(t.business)})`;
  await query`delete from faqs where org_id = ${orgId}`;
  for (const faq of t.faqs) {
    await query`insert into faqs (org_id, q_hu, a_hu, q_en, a_en, origin, status) values (${orgId}, ${faq.q_hu}, ${faq.a_hu}, ${faq.q_en}, ${faq.a_en}, 'import', 'approved')`;
  }
  await query`delete from playbook_settings where org_id = ${orgId}`;
  for (const p of t.playbooks) {
    await query`insert into playbook_settings (org_id, playbook, enabled) values (${orgId}, ${p}, true)`;
  }
  await query`delete from agent_versions where org_id = ${orgId}`;
  await query`insert into agent_versions (org_id, status, config) values (${orgId}, 'draft', ${JSON.stringify({ profile: t.business, faqs: t.faqs, playbooks: t.playbooks, rules: t.rules, keywords: t.keywords })})`;
  console.log(`seeded ${t.tenant} (${t.business.name})`);
}
