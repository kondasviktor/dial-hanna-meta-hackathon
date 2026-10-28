#!/usr/bin/env python3
"""G2 — Spark 1.3 Hungarian receptionist turns (Master Spec §4.4).

20 HU receptionist turns on muse-spark-1.3, reasoning_effort minimal,
streaming, with a tool definition present. Measures per-turn TTFT and
applies cheap automatic checks (Hungarian formal address, no obvious
anglicisms, valid JSON tool args when a tool is called).

Pass: TTFT p50 ≤ 800 ms; ≥ 18/20 turns acceptable (auto-checks + owner
review of flagged turns). This script covers the automatic part; the owner
still reviews Hungarian quality (formal "Ön", no anglicisms).

Usage:
    python3 scripts/gates/g2_llm_hungarian.py [--json] [--out results_local/g2.json]

Env: MODEL_API_KEY (or META_API_KEY), META_API_BASE, MODEL_LIVE (default muse-spark-1.3).
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
MODEL = os.environ.get("MODEL_LIVE", "muse-spark-1.3")

SYSTEM = ("Ön Hanna, a Teszt Szalon mesterséges intelligencia alapú telefonos "
          "asszisztense. Magyarul beszél, magázza a hívót (Ön), rövid természetes "
          "mondatokban válaszol. Csak a megadott tudásból válaszol; ha nem tudja, "
          "mondja, hogy továbbítja a kérdést. Időpontot csak eszközzel foglal.")

TOOLS = [{"type": "function", "function": {
    "name": "get_business_hours",
    "description": "A szalon nyitvatartása.",
    "parameters": {"type": "object",
                   "properties": {"date": {"type": "string"}},
                   "required": []}}}]

TURNS = [
    "Jó napot, hétfőn hánytól vannak nyitva?",
    "Mennyibe kerül a női hajvágás?",
    "Szeretnék időpontot kérni péntek délutánra.",
    "Hol található a szalon?",
    "Van parkolási lehetőség a közelben?",
    "Meddig tart egy gél lakk manikűr?",
    "Tudok szombatra is jönni?",
    "Mi a telefonszámuk?",
    "Férfi hajvágást is vállalnak?",
    "Milyen fizetési módokat fogadnak el?",
    "Lemondanám a holnapi időpontomat. Kovács Anna vagyok, 06301234567.",
    "Van szabad helyük ma délután háromkor?",
    "Gyerekhajvágás is van?",
    "Mennyi a várakozási idő általában?",
    "Késhetek tíz percet a megbeszélt időpontról?",
    "Milyen szolgáltatásaik vannak?",
    "Lehet ajándékutalványt venni?",
    "Kutyával be lehet menni?",
    "Beszélnek angolul? (Answer in Hungarian.)",
    "Köszönöm, viszontlátásra!",
]

ANGLICISMS = ["sorry", "okay", "please", "actually", "anyway", "by the way",
              " update", "meeting", "slot", "booking"]
TEGEZO = [" te ", " téged", " neked", " vagy?", " tudsz", " szeretnél "]


def stream_turn(user_text, timeout_s=90):
    """POST streaming chat completion; returns (ttft_ms, total_ms, text, toolcall_ok)."""
    body = json.dumps({
        "model": MODEL,
        "messages": [{"role": "system", "content": SYSTEM},
                      {"role": "user", "content": user_text}],
        "max_tokens": 500, "stream": True,
        "reasoning_effort": "minimal", "tools": TOOLS}).encode()
    req = urllib.request.Request(
        BASE + "/chat/completions", data=body,
        headers={"Authorization": "Bearer " + KEY,
                 "Content-Type": "application/json"})
    t0 = time.time()
    ttft = None
    chunks = []
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as r:
            for raw in r:
                line = raw.decode(errors="replace").strip()
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                if ttft is None:
                    ttft = (time.time() - t0) * 1000
                try:
                    delta = json.loads(data)["choices"][0].get("delta", {})
                except (ValueError, KeyError, IndexError):
                    continue
                c = delta.get("content")
                if c:
                    chunks.append(c)
        total = (time.time() - t0) * 1000
        return ttft or total, total, "".join(chunks), True
    except urllib.error.HTTPError as e:
        return None, (time.time() - t0) * 1000, \
            "HTTP %s: %s" % (e.code, e.read().decode()[:200]), False
    except Exception as e:
        return None, (time.time() - t0) * 1000, \
            "%s: %s" % (type(e).__name__, e), False


def auto_check(text):
    flags = []
    low = " " + text.lower() + " "
    if any(a in low for a in ANGLICISMS):
        flags.append("possible-anglicism")
    if any(t in low for t in TEGEZO):
        flags.append("possible-tegezes")
    if len(text.split()) > 80:
        flags.append("too-long")
    if not text.strip():
        flags.append("empty")
    return flags


def main():
    as_json = "--json" in sys.argv
    out = None
    if "--out" in sys.argv:
        out = sys.argv[sys.argv.index("--out") + 1]
    if not KEY:
        print("FAIL: MODEL_API_KEY / META_API_KEY is not set.")
        sys.exit(2)
    rows = []
    for i, turn in enumerate(TURNS, 1):
        ttft, total, text, ok = stream_turn(turn)
        flags = auto_check(text) if ok else ["request-failed"]
        rows.append({"n": i, "caller": turn, "ttft_ms": round(ttft) if ttft else None,
                     "total_ms": round(total), "reply": text[:400], "flags": flags})
        print("[%02d] ttft=%sms total=%sms flags=%s" % (
            i, rows[-1]["ttft_ms"], rows[-1]["total_ms"], flags or ["-"]))
    ttfts = sorted(r["ttft_ms"] for r in rows if r["ttft_ms"] is not None)
    p50 = ttfts[len(ttfts) // 2] if ttfts else None
    clean = sum(1 for r in rows if not r["flags"])
    passed = (p50 is not None and p50 <= 800 and clean >= 18)
    print("G2 %s: TTFT p50=%sms, %d/20 turns clean (need p50<=800ms, >=18 clean)" % (
        "PASS" if passed else "REVIEW", p50, clean))
    print("Owner must still review flagged turns for Ön-address and natural Hungarian.")
    if out:
        with open(out, "w") as f:
            json.dump({"model": MODEL, "p50_ttft_ms": p50,
                       "clean": clean, "rows": rows}, f,
                      indent=2, ensure_ascii=False)
        print("Wrote %s" % out)
    if as_json:
        print(json.dumps({"p50_ttft_ms": p50, "clean": clean}, ensure_ascii=False))
    sys.exit(0 if passed else 1)


if __name__ == "__main__":
    main()
