ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "trial_plan" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "trial_started_at" timestamp;
