CREATE TABLE IF NOT EXISTS "waitlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL UNIQUE,
  "locale" text DEFAULT 'hu' NOT NULL,
  "plan_interest" text,
  "created_at" timestamp DEFAULT now()
);
