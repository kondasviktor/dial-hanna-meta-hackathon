CREATE TABLE IF NOT EXISTS "agent_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"config" jsonb NOT NULL,
	"prompt_hash" text,
	"greeting_audio_url" text,
	"readiness_score" integer,
	"published_at" timestamp,
	"rollback_from" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"call_id" uuid,
	"idempotency_key" text NOT NULL,
	"service_id" text,
	"slot_start" timestamp,
	"slot_end" timestamp,
	"caller_name" text,
	"caller_phone" text,
	"google_event_id" text,
	"status" text DEFAULT 'confirmed' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "business_profiles" (
	"org_id" uuid NOT NULL,
	"profile" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "call_outcomes" (
	"call_id" uuid PRIMARY KEY NOT NULL,
	"intent" text,
	"outcome" text,
	"next_action" jsonb,
	"owner_status" text DEFAULT 'open' NOT NULL,
	"sentiment" text,
	"confidence" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"agent_version_id" uuid,
	"channel" text NOT NULL,
	"from_e164" text,
	"to_e164" text,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"duration_s" integer,
	"language" text,
	"transcript" jsonb,
	"tool_calls" jsonb,
	"timings" jsonb,
	"recording_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"phone" text NOT NULL,
	"name" text,
	"last_call_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"q_hu" text NOT NULL,
	"a_hu" text NOT NULL,
	"q_en" text,
	"a_en" text,
	"origin" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integrations" (
	"org_id" uuid PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'google' NOT NULL,
	"tokens" text,
	"calendar_id" text,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_gaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"call_id" uuid,
	"question" text NOT NULL,
	"context" text,
	"status" text DEFAULT 'open' NOT NULL,
	"approved_faq_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "knowledge_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"type" text NOT NULL,
	"uri" text,
	"raw_text" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"plan" text DEFAULT 'trial' NOT NULL,
	"timezone" text DEFAULT 'Europe/Budapest' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_clerk_org_id_unique" UNIQUE("clerk_org_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "phone_numbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"e164" text NOT NULL,
	"provider" text,
	"provider_ref" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"forwarding_verified_at" timestamp,
	CONSTRAINT "phone_numbers_e164_unique" UNIQUE("e164")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "playbook_settings" (
	"org_id" uuid NOT NULL,
	"playbook" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"config" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "test_suite_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"scenarios" jsonb NOT NULL,
	"results" jsonb,
	"score" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usage_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" uuid,
	"component" text NOT NULL,
	"units" text,
	"unit_type" text,
	"cost_usd" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookings_idem_uniq" ON "bookings" USING btree ("idempotency_key");