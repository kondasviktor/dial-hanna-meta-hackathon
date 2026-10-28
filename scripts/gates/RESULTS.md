# Gate results — Day 0–1 (Master Spec §4.4)

> No product features until the gates pass (Spec §18).
> Verdicts: PASS / FAIL / SKIP / MANUAL. STT file-endpoint + realtime socket
> shapes are VERIFY against current Meta docs; differences go in
> `docs/private/DEVIATIONS.md` (vendor doc wins).

| Gate | Test | Pass bar | Status | Result (28 Oct) |
|---|---|---|---|---|
| G1 Hungarian STT | 30 clips ×2 qualities, key-entity accuracy | HU phone-quality ≥ 90% | SKIP | clips not recorded yet — harness ready (`g1_stt_accuracy.py`) |
| G2 LLM HU turns | 20 HU turns, `minimal`, streaming + tools | TTFT p50 ≤ 800 ms; ≥ 18/20 acceptable | REVIEW | 20/20 auto-clean, HU quality good on spot-check; TTFT p50 ≈ 1.25 s > 800 ms — see findings |
| G3 TTS voices | 3 HU female voices × 10 lines | natural + first byte ≤ 300 ms | SKIP | provider keys not set — harness ready (`g3_tts.py`) |
| G4 HU number | Telnyx Budapest geo ordered Day 0 | active by Day 6 | TODO | owner action: order + KYC docs |
| G5 Meta access | 1 request each: Spark 1.3, Wonder, Transcribe | all respond | PASS | 3/3 HTTP (Spark ~1.3 s, Wonder ~1.5 s, contributor ~5.6 s); realtime socket = MANUAL next |

## Day-0 findings (28 Oct, measured from Hungary)

1. **Reasoning tokens eat the completion budget.** A one-word HU reply cost
   188 reasoning tokens; `-contributor` burned ~300 on a trivial probe and
   returned `content: null` with `finish_reason: length` at `max_tokens: 300`.
   Fix applied: per-model budgets in `g5_meta_access.py` (500 / 800 / 2000)
   and `max_tokens: 500` in `g2_llm_hungarian.py`. Cost model in §11 must
   count reasoning tokens as output tokens.
2. **TTFT p50 ≈ 1.25 s (target ≤ 800 ms).** First streamed tokens are
   reasoning, not speakable text, so perceived voice latency is worse than
   TTFT suggests. Mitigations per spec: cache-friendly prompt order (§6.6),
   cached greeting, filler phrases; accept-and-flag if still slow.
3. **G2 harness has no tool-execution loop** — the model says "megnézem…"
   (correct filler behavior) but no tool runs. The Day-1 voice service must
   implement the tool-call loop before booking can be demoed.
4. Wonder extraction probe returned exact JSON (`{"name": "Teszt Szalon"}`).
   One transient 60 s timeout seen on Wonder; retry succeeded in 1.6 s.

## Language decision (H10 fallback)

If G1 fails: demo runs **English callers** to the Hungarian business,
video states Hungarian voice is the production path, no non-Meta STT
is added during the hackathon.
