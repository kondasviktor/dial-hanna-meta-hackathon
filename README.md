# Dial Hanna — Meta Hackathon build

AI call coverage for Hungarian small businesses. Built for the Meta Global AI
Developer Hackathon (26 Oct – 4 Nov 2026).

> **Status:** Waitlist public funnel + admin Meta loop. Stripe, public trial, and
> browser calling are deferred until after the hackathon. Repos and Vercel stay
> private until an explicit submission flip.

## What runs today

- HU/EN landing with **Join the waitlist** (no signup trial)
- Clerk **admin-only** dashboard / onboarding (`ADMIN_EMAILS`)
- Optional website import via **Muse Wonder** → FAQ review; or manual Q&A
- Voice APIs: `/api/voice/session`, `/api/voice/tools/:name`,
  `/api/voice/calls/:id/complete`, `/api/twilio/voice`
- Phone page with MMI forwarding codes once `TWILIO_PHONE_NUMBER` is set
- Knowledge-gap inbox → FAQ draft → versions + short text test suite

## Layout

```text
apps/web/         Next.js (landing, waitlist, dashboard, API)
services/voice/   Voice helpers + pipeline text demo (Fly/Pipecat later)
schemas/          Shared JSON Schemas
scripts/gates/    G1–G5 gate scripts + RESULTS.md
docs/             architecture.md, demo.md
docs/private/     GITIGNORED master spec + DEVIATIONS
```

## Meta models used

| Job | Model |
|---|---|
| Live conversation + tools | `muse-spark-1.3` |
| Live STT | `muse-voice-transcribe-1.0` (English demo) |
| Website → profile / FAQs | `muse-wonder-1.0` |
| Outcome, FAQ rewrite, judge | `muse-spark-1.3` |
| Simulated caller | `muse-spark-1.3-contributor` |

All calls go directly to `https://api.meta.ai/v1` with the hackathon key.
TTS is ElevenLabs Flash (Meta has no TTS). No Retell during the hackathon.

## Owner setup (before voice demos)

1. Copy `.env.example` → `.env` and fill Meta, Neon, Clerk, `ADMIN_EMAILS`.
2. Twilio softphone (Meta EN) + Telnyx HU DID → see `.env.example` / `docs/OWNER_ACCOUNTS.md`.
3. ElevenLabs Flash key + voice id → `ELEVENLABS_*` (do not enable their STT/Agents).
4. Google Calendar OAuth in testing mode (optional for booking storage).
5. Apply `apps/web/drizzle/0002_waitlist.sql` on Neon.
6. Sign in once on the closed Vercel URL; confirm Clerk webhook created the org.
7. Keep Vercel deployment protection on until submission day.

## Quickstart

```bash
cp .env.example .env
cd apps/web && npm install && npm test && npm run dev
```

Gate scripts: see `scripts/gates/RESULTS.md`. Demo recording: `docs/demo.md`.
