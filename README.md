# Dial Hanna — Meta Global AI Developer Hackathon

**When the phone rings and you are busy, Hanna answers.**

Dial Hanna is an AI phone receptionist for small businesses. The owner keeps their own number and forwards busy or unanswered calls to **Hanna**, who answers in the business's name from owner-approved knowledge, takes orders and bookings, and turns every call into **Intent → Outcome → Next action** on the owner's dashboard — never a transcript dump.

Built for the **Meta Global AI Developer Hackathon** (Cerebral Valley, 26 Oct – 4 Nov 2026) on Meta's Muse model family via the Meta Model API.

> **Status: join-the-waitlist.** [dialhanna.com](https://dialhanna.com) is public as a waitlist. Per program rules, paid plans (Stripe) were not enabled during the hackathon; the dashboard is admin-only while we validate with pilot shops. Hungarian owners are the primary market — this demo build takes English callers, with Hungarian speech as the production path (see *Honest limits*).

## Submission video

[`video/DialHanna-submission.mp4`](video/DialHanna-submission.mp4) (2:35) — hook, the 12 business types Hanna serves, the money a missed call costs, the 3-step setup, a live cake order, and the knowledge-gap loop: Hanna does not know about Uber Eats delivery, logs the question, the owner answers once, and the next caller gets the answer. Raw clips and the reproducible ffmpeg/PIL assembly pipeline live alongside it in [`video/`](video/).

## The problem

A missed call is a missed booking. Salons, bakeries, trades, guesthouses — the owner's hands are busy exactly when the phone rings. Existing options are voicemail (callers hang up) or a generic call center (no business knowledge). Dial Hanna answers with *that shop's* approved facts, and learns from every question it could not answer.

## What Hanna does

- **Answers forwarded calls** in the business's name, disclosing in the first sentence that she is an AI assistant.
- **Takes multi-slot orders** (product, size, pickup day/time, name, phone) with per-call memory — never re-asks what was already given — and reads the order back before confirming.
- **Books appointments** when the owner allows it.
- **Never guesses.** An unknown question triggers an owner-callback offer, is logged as a *knowledge gap*, and the owner answers it once in the dashboard. The answer becomes an approved FAQ, so the next caller is answered instantly. The knowledge base grows from real calls.
- **Closes every call properly**: "Is there anything else I can help you with?" — and only then thanks and goodbye.
- **Reports outcomes, not transcripts**: after hangup, the call lands on the dashboard as Intent → Outcome → Next action, with owner follow-up triage (done / no action, icon-only in the tile corner).

## Meta products used

| Job | Meta product |
|---|---|
| Live phone conversation, order memory, tool use | **Muse Spark** (`muse-spark-1.3`) |
| Speech-to-text for callers | **Muse Voice Transcribe** (`muse-voice-transcribe-1.0`) |
| Website → business profile + draft FAQ knowledge base | **Muse Wonder** (`muse-wonder-1.0`) |
| Post-call outcome extraction, FAQ translation/sync, test judging | **Muse Spark** (`muse-spark-1.3`) |
| Simulated callers in the automated text test suite | Muse Spark contributor model |
| Development tooling | Muse Code (`muse-wonder-1.0`) |

All model calls go directly to `https://api.meta.ai/v1` with the hackathon key. Speech synthesis is ElevenLabs Flash (the program offers no Meta TTS). The website import analyses the business's industry and drafts its most likely FAQs with Wonder; Spark then runs every conversation against that approved knowledge.

## Full stack

| Layer | Tech |
|---|---|
| Web app (landing HU/EN, waitlist, dashboard, APIs) | Next.js (App Router, TypeScript) on Vercel |
| Voice telephony | Twilio (Gather speech + TwiML), softphone demo surface |
| LLMs | Meta Muse Spark / Wonder / Voice Transcribe via Meta Model API |
| TTS | ElevenLabs Flash, streamed |
| Database | Neon Postgres |
| Auth / organisations | Clerk (admin-gated dashboard via `ADMIN_EMAILS`) |
| Website import | Multi-page crawl + Apify fallback → Muse Wonder extraction |
| Tests | Node test runner, 69 passing (`apps/web/test/`) + G1–G5 gate scripts |
| Video | ffmpeg + PIL pipeline in [`video/`](video/), ElevenLabs narration |

## How it works

```text
Caller → forwarded call → Twilio Gather (speech)
  → Muse Spark (approved knowledge + multi-turn order memory)
  → ElevenLabs Flash (spoken reply)
  → background outcome extraction (Intent → Outcome → Next action)
  → dashboard follow-ups for the owner
Unknown question → knowledge-gap inbox → owner answers once → approved FAQ
```

- **Knowledge import:** paste a website URL → crawl → Muse Wonder extracts profile, hours, contact and likely FAQs → owner approves, edits or rejects.
- **Calls:** per-call state keyed by Twilio CallSid; closing sequence on every call; no callback is ever invented that Hanna did not promise.
- **Outcomes:** Spark extracts the structured result after the call; empty results are retried, never shown as "? → ?".

## Honest limits (hackathon build)

- English callers for the demo; Hungarian is the home market and the production speech path.
- No public "call from the website" yet; the softphone is the demo surface.
- Waitlist only — Stripe and paid plans open after the hackathon (program rules).
- Turn latency is bounded by live model inference; streaming voice is the post-hackathon path.

## Layout

```text
apps/web/         Next.js (landing, waitlist, dashboard, voice APIs)
services/voice/   Python voice helpers + pipeline scaffold
schemas/          Shared JSON Schemas (call outcome, profile, scenarios)
scripts/gates/    G1–G5 verification gate scripts + results
video/            Submission video, raw clips, assembly pipeline
docs/             Architecture + demo script
```

## Quickstart

```bash
cp .env.example .env   # Meta, Neon, Clerk, ElevenLabs, Twilio keys
cd apps/web && npm install && npm test && npm run dev
```

Gate scripts: see `scripts/gates/RESULTS.md`. Demo recording script: `docs/demo.md`.
