# Dial Hanna — architecture (hackathon)

## What it is

Hungary-first AI call coverage: keep your number, forward when busy, Hanna
answers from approved knowledge, books when allowed, writes
Intent → Outcome → Next action, and learns from knowledge gaps.

## Stack

| Layer | Choice |
|---|---|
| Web | Next.js App Router on Vercel (`fra1`) |
| DB | Neon Postgres (`eu-central-1`) + Drizzle |
| Auth | Clerk Organizations (admin-only during hackathon) |
| Voice | Python helpers + Telnyx DID → Meta Transcribe → Muse Spark 1.3 → ElevenLabs Flash |
| Public funnel | Waitlist only (no Stripe, no browser call, no public trial) |

## Meta models

| Job | Model |
|---|---|
| Live conversation + tools | `muse-spark-1.3` |
| Live STT | `muse-voice-transcribe-1.0` (English for hackathon demo) |
| Website → profile / FAQ draft | `muse-wonder-1.0` |
| Post-call outcome, FAQ rewrite, test judge | `muse-spark-1.3` |
| Simulated caller (text suite) | `muse-spark-1.3-contributor` |

All calls go directly to `https://api.meta.ai/v1` with the hackathon key.

## Call path

```text
Caller phone → Telnyx DID → voice service
  → Transcribe (keywords from business) → Spark tools → ElevenLabs
  → POST /api/voice/calls/:id/complete → outcome + gaps on dashboard
```

## Admin path

```text
Clerk admin → /onboarding
  → optional website URL → Wonder draft FAQs → approve
  → or manual Q&A
  → publish agent version → phone page MMI codes
```

## Out of scope (hackathon)

Stripe, Számlázz, SMS, public browser calling, Retell, Muse Image, SAM,
Hungarian STT (production path after Meta support / Phase 0).
