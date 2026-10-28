// Seeds fictional demo calls + outcomes (+ gaps, bookings) from seed/demo_calls.json.
// Usage: set -a; . ../../.env; node scripts/seed_calls.mjs
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const query = neon(process.env.DATABASE_URL);
const data = JSON.parse(readFileSync(join(root, "seed", "demo_calls.json"), "utf8"));

for (const c of data.calls) {
  const orgs = await query`select id from organizations where clerk_org_id = ${"demo_" + c.tenant}`;
  if (!orgs[0]) {
    console.log(`skip: tenant ${c.tenant} not seeded (run seed.mjs first)`);
    continue;
  }
  const orgId = orgs[0].id;
  const started = new Date(Date.now() - c.startedAgoMin * 60000).toISOString();
  const ended = new Date(new Date(started).getTime() + c.durationS * 1000).toISOString();
  const ver = await query`select id from agent_versions where org_id = ${orgId} limit 1`;
  const calls = await query`insert into calls (org_id, agent_version_id, channel, from_e164, started_at, ended_at, duration_s, language, transcript, tool_calls, timings) values (${orgId}, ${ver[0]?.id ?? null}, ${c.channel}, ${c.from}, ${started}, ${ended}, ${c.durationS}, ${c.language}, ${JSON.stringify(c.transcript)}, '[]', '{}') returning id`;
  const callId = calls[0].id;
  const o = c.outcome;
  await query`insert into call_outcomes (call_id, intent, outcome, next_action, sentiment, confidence) values (${callId}, ${o.intent}, ${o.outcome}, ${JSON.stringify(o.next_action)}, ${o.sentiment}, ${Math.round(o.confidence * 100)})`;
  if (c.booking) {
    const b = c.booking;
    await query`insert into bookings (org_id, call_id, idempotency_key, service_id, slot_start, slot_end, caller_name, caller_phone, status) values (${orgId}, ${callId}, ${"demo-" + callId}, ${b.service_id}, ${b.slot_start}, ${b.slot_end}, ${b.caller_name}, ${b.caller_phone}, 'confirmed')`;
  }
  if (c.gap) {
    await query`insert into knowledge_gaps (org_id, call_id, question, context, status) values (${orgId}, ${callId}, ${c.gap.question}, ${c.gap.context}, 'open')`;
  }
  console.log(`seeded call ${callId} (${c.tenant}, ${o.intent} → ${o.outcome})`);
}
