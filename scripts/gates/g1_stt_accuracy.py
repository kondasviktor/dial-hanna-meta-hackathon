#!/usr/bin/env python3
"""G1 — Hungarian STT key-entity accuracy (Master Spec §4.4).

30 clips (20 HU + 10 EN), each run twice: clean 16 kHz and phone-quality
(8 kHz mu-law resampled to 16 kHz). Scores KEY-ENTITY accuracy (names, phone
numbers, dates, prices, street names) — not WER.

Pass: HU phone-quality key entities ≥ 90% correct.

This script is the harness. It does NOT ship audio: place consented clips
(owner + family only, no third parties) under scripts/gates/clips/ with a
manifest, then run. Without clips it prints the recording plan and exits SKIP.

Manifest (scripts/gates/clips/manifest.json):
    {"clips": [{"file": "hu_01.wav", "lang": "hu", "quality": "clean|phone",
                "entities": ["Kovács Anna", "06 30 123 4567", ...]}, ...]}

Transcription backend: muse-voice-transcribe-1.0 file endpoint — shape is
VERIFY against current docs, so the transcribe() function below is a clearly
marked stub that resolves the endpoint from env META_STT_FILE_URL. The entity
scorer works today on any transcripts JSON you drop in results_local/.

Usage:
    python3 scripts/gates/g1_stt_accuracy.py [--score results_local/g1_transcripts.json]
"""
import json
import os
import sys

CLIP_DIR = os.path.join(os.path.dirname(__file__), "clips")
STT_FILE_URL = os.environ.get("META_STT_FILE_URL", "")  # VERIFY, see DEVIATIONS.md

# Suggested 30-clip recording plan (owner + family, consented).
PLAN_HU = [
    "name+phone: 'Kovács Anna vagyok, a számom 06 30 123 4567'",
    "date: 'Jövő kedd délután háromkor szeretnék jönni'",
    "price: 'Tizenkétezer-ötszáz forint lesz?'",
    "street: 'A Rákóczi úton lakom, a Blaha Lujza térnél'",
    "service: 'Női hajvágást és gél lakkot szeretnék'",
    "cancel: 'Lemondanám a pénteki időpontomat'",
    "transfer: 'A tulajdonossal szeretnék beszélni'",
    "angry: 'Már fél órája várok, ez felháborító'",
    "wrong-number: 'A gyógyszertárat keresem?'",
    "parking: 'Hol lehet parkolni a közelben?'",
    "x2 variants of each (different speaker) = 20 HU clips",
]
PLAN_EN = [
    "booking in English, 'Friday afternoon', name spelling",
    "price question in English", "x5 topics x2 speakers = 10 EN clips",
]


def norm(s):
    return "".join(c for c in s.lower() if c.isalnum())


def score(transcripts):
    """transcripts: [{entities: [...], transcript: '...'}] -> entity hit rate."""
    hits = total = 0
    misses = []
    for t in transcripts:
        for ent in t.get("entities", []):
            total += 1
            if norm(ent) in norm(t.get("transcript", "")):
                hits += 1
            else:
                misses.append({"entity": ent, "transcript": t.get("transcript", "")})
    return hits, total, misses


def main():
    if "--score" in sys.argv:
        path = sys.argv[sys.argv.index("--score") + 1]
        with open(path) as f:
            data = json.load(f)
        items = data if isinstance(data, list) else data.get("results", [])
        hits, total, misses = score(items)
        rate = (100.0 * hits / total) if total else 0.0
        print("G1 entities: %d/%d = %.1f%% (need HU phone-quality >= 90%%)" % (
            hits, total, rate))
        for m in misses:
            print("  MISS %r <- %r" % (m["entity"], m["transcript"][:120]))
        sys.exit(0 if rate >= 90 else 1)
    manifest = os.path.join(CLIP_DIR, "manifest.json")
    if not os.path.exists(manifest):
        print("G1 SKIP: no clips yet. Recording plan (owner + family, consented):")
        print("  HU (20):")
        for p in PLAN_HU:
            print("    - %s" % p)
        print("  EN (10):")
        for p in PLAN_EN:
            print("    - %s" % p)
        print("Place 16kHz WAVs + manifest.json in %s" % CLIP_DIR)
        print("(each clip also needed phone-degraded: 8kHz mu-law -> 16kHz).")
        if not STT_FILE_URL:
            print("NOTE: META_STT_FILE_URL is unset — file-endpoint shape is VERIFY; "
                  "see docs/private/DEVIATIONS.md before coding transcribe().")
        sys.exit(3)
    print("G1 TODO: manifest found; transcribe() backend pending VERIFY. "
          "Score with --score once transcripts exist.")


if __name__ == "__main__":
    main()
