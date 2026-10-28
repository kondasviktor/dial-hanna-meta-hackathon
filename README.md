# Dial Hanna — Meta Hackathon build

AI call coverage for Hungarian small businesses. Built for the Meta Global AI
Developer Hackathon (26 Oct – 4 Nov 2026).

> **Status:** Day-0 scaffold. Product features land only after the Day 0–1
> gates pass (see `scripts/gates/RESULTS.md`).

## Layout (Master Spec §6.2)

```text
apps/web/         Next.js app (dashboard, onboarding, API, tool endpoints)
services/voice/   Pipecat voice service (browser + Telnyx transports)
schemas/          JSON Schemas shared by web (zod) and voice (pydantic)
scripts/gates/    G1–G5 gate scripts + results (no real third-party audio)
docs/             public docs: README assets, architecture.md, demo.md
docs/private/     GITIGNORED: master spec, research, DEVIATIONS.md
```

## Meta models used (Spec §5)

| Job | Model |
|---|---|
| Live conversation + tools | `muse-spark-1.3` (`reasoning_effort: "minimal"`, streaming) |
| Live STT | `muse-voice-transcribe-1.0` realtime |
| Recording / voice-note transcription | `muse-voice-transcribe-1.0` (file, diarization on) |
| Profile extraction, test scenarios | `muse-wonder-1.0` (`reasoning_effort: "high"`) |
| Simulated caller (synthetic only) | `muse-spark-1.3-contributor`, fallback `muse-spark-1.3` |
| Test judge, post-call outcome, FAQ rewrite | `muse-spark-1.3` |

All calls go directly to `https://api.meta.ai/v1` with the hackathon key.

## Quickstart (gates)

```bash
cp .env.example .env   # fill in MODEL_API_KEY / META_API_KEY
python3 scripts/gates/g5_meta_access.py
python3 scripts/gates/g2_llm_hungarian.py
python3 scripts/gates/g1_stt_accuracy.py --help
python3 scripts/gates/g3_tts.py
```

Gate results are recorded in `scripts/gates/RESULTS.md`.
No product code is built until the gates pass (Spec §18).
