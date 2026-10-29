// Drizzle schema — Master Spec §8 (hackathon tables).
// Requires: drizzle-orm + postgres driver + Neon DATABASE_URL.
// Not runnable until `npm install` + Neon provisioned; pure source for now.

import {
  pgTable, text, integer, timestamp, jsonb, uuid,
  uniqueIndex, boolean,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  plan: text("plan").notNull().default("trial"),
  trialPlan: text("trial_plan"), // essential | pro | business — picked at signup
  trialStartedAt: timestamp("trial_started_at"), // 14-day window starts here
  timezone: text("timezone").notNull().default("Europe/Budapest"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessProfiles = pgTable("business_profiles", {
  orgId: uuid("org_id").notNull(),
  profile: jsonb("profile").notNull(), // §7.3 business object
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeSources = pgTable("knowledge_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  type: text("type").notNull(), // url | voice_note | doc | manual
  uri: text("uri"),
  rawText: text("raw_text"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  qHu: text("q_hu").notNull(),
  aHu: text("a_hu").notNull(),
  qEn: text("q_en"),
  aEn: text("a_en"),
  origin: text("origin").notNull().default("manual"), // import | gap | manual
  status: text("status").notNull().default("draft"), // draft | approved | rejected
});

export const playbookSettings = pgTable("playbook_settings", {
  orgId: uuid("org_id").notNull(),
  playbook: text("playbook").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  config: jsonb("config"),
});

export const agentVersions = pgTable("agent_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  status: text("status").notNull().default("draft"), // draft | tested | live | archived
  config: jsonb("config").notNull(), // full snapshot: profile, FAQs, playbooks, rules, voice, keywords
  promptHash: text("prompt_hash"),
  greetingAudioUrl: text("greeting_audio_url"),
  readinessScore: integer("readiness_score"),
  publishedAt: timestamp("published_at"),
  rollbackFrom: uuid("rollback_from"),
});

export const phoneNumbers = pgTable("phone_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  e164: text("e164").notNull().unique(),
  provider: text("provider"),
  providerRef: text("provider_ref"),
  status: text("status").notNull().default("pending"),
  forwardingVerifiedAt: timestamp("forwarding_verified_at"),
});

export const calls = pgTable("calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  agentVersionId: uuid("agent_version_id"),
  channel: text("channel").notNull(), // phone | browser
  fromE164: text("from_e164"),
  toE164: text("to_e164"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationS: integer("duration_s"),
  language: text("language"),
  transcript: jsonb("transcript"),
  toolCalls: jsonb("tool_calls"),
  timings: jsonb("timings"),
  recordingUrl: text("recording_url"),
});

export const callOutcomes = pgTable("call_outcomes", {
  callId: uuid("call_id").primaryKey(),
  intent: text("intent"),
  outcome: text("outcome"),
  nextAction: jsonb("next_action"),
  ownerStatus: text("owner_status").notNull().default("open"),
  sentiment: text("sentiment"),
  confidence: integer("confidence"),
});

export const knowledgeGaps = pgTable("knowledge_gaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  callId: uuid("call_id"),
  question: text("question").notNull(),
  context: text("context"),
  status: text("status").notNull().default("open"), // open | answered | approved | rejected
  approvedFaqId: uuid("approved_faq_id"),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  callId: uuid("call_id"),
  idempotencyKey: text("idempotency_key").notNull(),
  serviceId: text("service_id"),
  slotStart: timestamp("slot_start"),
  slotEnd: timestamp("slot_end"),
  callerName: text("caller_name"),
  callerPhone: text("caller_phone"),
  googleEventId: text("google_event_id"),
  status: text("status").notNull().default("confirmed"),
}, (t) => [uniqueIndex("bookings_idem_uniq").on(t.idempotencyKey)]);

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull(),
  phone: text("phone").notNull(),
  name: text("name"),
  lastCallAt: timestamp("last_call_at"),
});

export const integrations = pgTable("integrations", {
  orgId: uuid("org_id").primaryKey(),
  provider: text("provider").notNull().default("google"),
  tokens: text("tokens"), // encrypted AES-GCM with ENCRYPTION_KEY
  calendarId: text("calendar_id"),
  status: text("status").notNull().default("pending"),
});

export const testSuiteRuns = pgTable("test_suite_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentVersionId: uuid("agent_version_id").notNull(),
  scenarios: jsonb("scenarios").notNull(),
  results: jsonb("results"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usageLedger = pgTable("usage_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  callId: uuid("call_id"),
  component: text("component").notNull(), // stt | llm | tts | telephony | extract
  units: text("units"),
  unitType: text("unit_type"),
  costUsd: text("cost_usd"),
});

/** Public waitlist — no account, no trial, until Stripe opens after the hackathon. */
export const waitlist = pgTable("waitlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  locale: text("locale").notNull().default("hu"), // hu | en
  planInterest: text("plan_interest"), // essential | pro | business | null
  createdAt: timestamp("created_at").defaultNow(),
});
