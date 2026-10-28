#!/usr/bin/env python3
"""G5 — Meta Model API access smoke test (Master Spec §4.4).

One request each to the hackathon models with the hackathon key, from Hungary:
  - muse-spark-1.3            (chat completions)
  - muse-wonder-1.0           (chat completions, tiny extraction probe)
  - muse-spark-1.3-contributor (chat completions, synthetic-only probe)

Voice Transcribe realtime is a WebSocket handshake (wss://api.meta.ai/v1/asr/realtime)
and the file endpoint shape is still VERIFY — this script checks that the HTTP
API surface answers and prints the exact next step for the socket test.

Usage:
    python3 scripts/gates/g5_meta_access.py [--json]

Env: MODEL_API_KEY (or META_API_KEY), META_API_BASE (default https://api.meta.ai/v1).
Stdlib only.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

BASE = os.environ.get("META_API_BASE", "https://api.meta.ai/v1").rstrip("/")
KEY = os.environ.get("MODEL_API_KEY") or os.environ.get("META_API_KEY") or ""

CHECKS = [
    ("spark-1.3 (live convo)", "muse-spark-1.3", 500,
     [{"role": "user", "content": "Válaszolj egy szóval magyarul: működsz?"}],
     {"reasoning_effort": "minimal"}),
    ("wonder-1.0 (extract)", "muse-wonder-1.0", 800,
     [{"role": "user", "content": "Extract JSON: {\"name\": \"Teszt Szalon\"}. Reply with the JSON only."}],
     {"reasoning_effort": "low"}),
    # NOTE (Day-0 finding): -contributor burns ~300 reasoning tokens on a
    # trivial probe, so it needs a much larger completion budget.
    ("spark-1.3-contributor (synthetic caller)", "muse-spark-1.3-contributor", 2000,
     [{"role": "user", "content": "Say 'synthetic caller probe ok' and nothing else."}],
     {"reasoning_effort": "low"}),
]


def post_chat(model, messages, extra, max_tokens=500, timeout_s=120):
    # NOTE (Day-0 finding): reasoning tokens consume the completion budget
    # (e.g. 188 reasoning tokens for a one-word HU reply; ~300 on
    # -contributor), so keep max_tokens generous even for short answers.
    body = json.dumps({"model": model, "messages": messages,
                       "max_tokens": max_tokens, **extra}).encode()
    req = urllib.request.Request(
        BASE + "/chat/completions", data=body,
        headers={"Authorization": "Bearer " + KEY,
                 "Content-Type": "application/json"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as r:
            payload = json.loads(r.read().decode())
        dt = (time.time() - t0) * 1000
        text = ""
        try:
            text = payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            pass
        return True, dt, (text or "").strip()[:200], payload.get("usage", {})
    except urllib.error.HTTPError as e:
        return False, (time.time() - t0) * 1000, \
            "HTTP %s: %s" % (e.code, e.read().decode()[:300]), {}
    except Exception as e:  # network / timeout
        return False, (time.time() - t0) * 1000, "%s: %s" % (type(e).__name__, e), {}


def main():
    as_json = "--json" in sys.argv
    results = []
    if not KEY:
        print("FAIL: MODEL_API_KEY / META_API_KEY is not set.")
        sys.exit(2)
    if KEY.startswith("LLM_") and len(KEY) < 20:
        print("WARN: key looks truncated; continuing anyway.")
    for label, model, budget, messages, extra in CHECKS:
        ok, ms, text, usage = post_chat(model, messages, extra,
                                        max_tokens=budget)
        if ok and not (text or "").strip():
            ok = False
            text = "empty content (reasoning ate the budget? raise max_tokens)"
        results.append({"check": label, "model": model, "ok": ok,
                        "latency_ms": round(ms), "reply": text, "usage": usage})
    results.append({
        "check": "voice-transcribe (realtime + file)",
        "model": "muse-voice-transcribe-1.0",
        "ok": None,
        "note": ("MANUAL: HTTP API is up; realtime needs a WebSocket handshake to "
                 "wss://api.meta.ai/v1/asr/realtime with the Bearer key. "
                 "File/sync endpoint shape is VERIFY against current docs — do not "
                 "code against a guessed path. See RESULTS.md."),
    })
    failed = [r for r in results if r["ok"] is False]
    if as_json:
        print(json.dumps({"base": BASE, "results": results,
                          "pass": not failed}, indent=2, ensure_ascii=False))
    else:
        for r in results:
            status = "PASS" if r["ok"] else ("MANUAL" if r["ok"] is None else "FAIL")
            print("[%s] %s (%s) %sms" % (
                status, r["check"], r["model"], r.get("latency_ms", "-")))
            print("       %s" % (r.get("reply") or r.get("note", "")))
        print("G5 %s (%d/%d HTTP checks passed)" % (
            "PASS" if not failed else "FAIL",
            sum(1 for r in results if r["ok"]), len(CHECKS)))
    sys.exit(0 if not failed else 1)


if __name__ == "__main__":
    main()
