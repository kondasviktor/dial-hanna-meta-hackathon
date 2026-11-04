# Dial Hanna — Meta Global AI Developer Hackathon

AI call coverage for Hungarian small businesses: when the owner is busy, **Hanna** — an AI phone receptionist — answers, takes orders, books, and learns from every question she could not answer.

Built in ten days for the **Meta Global AI Developer Hackathon** (26 Oct – 4 Nov 2026), on Meta's Muse model family via the Meta Model API.

> **Status: join-the-waitlist.** The public funnel is a waitlist while we validate with pilot shops; paid plans (Stripe) open after the hackathon. Hungarian owners first — this demo build runs English callers, with Hungarian speech as the production path (see *Honest limits*).

## The pitch in one paragraph

A missed call is a missed booking. Dial Hanna lets a small shop keep its number and forward busy/unanswered calls to Hanna. She answers from owner-approved knowledge, takes multi-slot orders (product, size, pickup time, name, phone), and writes **Intent → Outcome → Next action** — not a transcript dump. When she does not know something (e.g. home delivery), she logs a *knowledge gap*, offers the caller an owner callback, and the owner answers once in the dashboard: the next caller gets the answer. The knowledge base grows from real calls.

## Meta models used

| Job | Model |
|---|---|
| Live conversation + tools | `muse-spark-1.3` |
| Live STT (production voice path) | `muse-voice-transcribe-1.0` |
| Website → business profile / FAQs | `muse-wonder-1.0` |
| Post-call outcome, FAQ sync, test judge | `muse-spark-1.3` |
| Simulated caller (text suite, synthetic only) | `muse-spark-1.3-contributor` |

All calls go directly to `https://api.meta.ai/v1` with the hackathon key. Speech synthesis is ElevenLabs Flash (Meta has no TTS in this program). Tooling agent: Muse Code (`muse-wonder-1.0`).

## How it works

```text
Caller → Twilio softphone/DID → Gather (speech)
  → Muse Spark 1.3 (knowledge + multi-turn order memory)
  → ElevenLabs Flash (spoken reply)
  → background outcome extraction (Intent → Outcome → Next action)
  → dashboard follow-ups (owner triage: done / pending / no action)
Unknown question → knowledge-gap inbox → owner answers once → new FAQ
```

- **Knowledge import:** paste a business website URL → multi-page crawl → Muse Wonder extracts profile + likely FAQs → owner approves.
- **Calls:** per-call memory keyed by Twilio CallSid; takes orders slot by slot without re-asking; closes every call with "anything else?" before goodbye.
- **Outcomes:** after hangup, Spark extracts the structured outcome; the owner manages follow-ups with a done / no-action triage.
- **Gaps:** unanswered questions surface in the dashboard; one owner answer becomes an approved FAQ.

## Honest limits (hackathon build)

- English callers for the demo; Hungarian speech recognition is the production path (Meta Transcribe HU rollout), stated openly in the video.
- No public "call from the website"; browser softphone is the demo surface.
- Waitlist only; Stripe and paid plans are post-hackathon.
- Call latency is bounded by live model inference (~3–5s/turn warmed); sentence-streaming speech is the post-hackathon voice path.

## Layout

```text
apps/web/         Next.js (landing, waitlist, dashboard, voice APIs)
services/voice/   Python voice helpers + pipeline scaffold (Pipecat, Fly)
schemas/          Shared JSON Schemas (call outcome, profile, scenarios)
scripts/gates/    G1–G5 verification gate scripts + results
video/            Submission-video assets + assembly script
docs/             Architecture + demo script
```

## Quickstart

```bash
cp .env.example .env   # Meta, Neon, Clerk, ElevenLabs, Twilio keys
cd apps/web && npm install && npm test && npm run dev
```

Gate scripts: see `scripts/gates/RESULTS.md`. Demo recording script: `docs/demo.md`.
