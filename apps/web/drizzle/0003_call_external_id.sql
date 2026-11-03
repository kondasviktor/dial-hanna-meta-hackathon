ALTER TABLE "calls" ADD COLUMN IF NOT EXISTS "external_id" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "calls_external_id_uidx" ON "calls" ("external_id") WHERE "external_id" IS NOT NULL;
