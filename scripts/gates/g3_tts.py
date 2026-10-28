#!/usr/bin/env python3
"""G3 — Hungarian TTS voice check (Master Spec §4.4).

3 Hungarian female voices (ElevenLabs Flash v2.5 first, Azure hu-HU fallback)
reading 10 typical lines incl. numbers, times, prices.

Pass: owner judges natural; first audio byte <= 300 ms.

This harness synthesizes the 10 lines per voice, measures time-to-first-byte,
and saves MP3s under scripts/gates/results_local/g3/ for the OWNER listening
test. Without provider keys it exits SKIP (nothing to judge yet).

Usage:
    ELEVENLABS_API_KEY=... python3 scripts/gates/g3_tts.py [--voice VOICE_ID]...
    AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=westeurope python3 scripts/gates/g3_tts.py --azure

Stdlib only (urllib). ElevenLabs endpoint: POST /v1/text-to-speech/{voice_id}
(VERIFY model id 'eleven_flash_v2_5' against current docs).
"""
import os
import sys
import time
import urllib.request
import urllib.error

LINES = [
    "Jó napot kívánok, a Teszt Szalon vonalán Hanna beszél.",
    "Természetesen, péntek délután fél háromkor várom.",
    "A női hajvágás tizenkétezer-ötszáz forinttól elérhető.",
    "A telefonszámom nulla hat harminc per százhuszonhárom per negyvenöt hatvanhét.",
    "A Rákóczi út tizenkettőben talál meg minket, a Blaha Lujza térnél.",
    "Sajnos ma már nincs szabad helyünk, holnap délelőtt tudom fogadni.",
    "Egy pillanat, megnézem a naptárat.",
    "A hívást minőségbiztosítási céllal rögzítjük.",
    "Köszönöm a hívását, viszontlátásra!",
    "Hello, you've reached Teszt Szalon. This is Hanna, how can I help?",
]

OUT = os.path.join(os.path.dirname(__file__), "results_local", "g3")


def elevenlabs(line, voice_id, key, model="eleven_flash_v2_5"):
    body = ('{"model_id": "%s", "text": %s}' % (
        model, __import__("json").dumps(line))).encode()
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/text-to-speech/" + voice_id, data=body,
        headers={"xi-api-key": key, "Content-Type": "application/json",
                 "Accept": "audio/mpeg"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            audio = r.read()
        return (time.time() - t0) * 1000, audio, None
    except urllib.error.HTTPError as e:
        return None, None, "HTTP %s %s" % (e.code, e.read().decode()[:200])
    except Exception as e:
        return None, None, "%s: %s" % (type(e).__name__, e)


def main():
    use_azure = "--azure" in sys.argv
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    voices = [a for a in sys.argv[1:] if not a.startswith("--")] or \
        ([os.environ.get("ELEVENLABS_VOICE_ID", "")] if os.environ.get("ELEVENLABS_VOICE_ID") else [])
    if use_azure and not os.environ.get("AZURE_SPEECH_KEY"):
        print("G3 SKIP: AZURE_SPEECH_KEY not set.")
        sys.exit(3)
    if not use_azure and (not key or not voices or not voices[0]):
        print("G3 SKIP: ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID not set.")
        print("Set keys, then re-run. Owner listens to MP3s in %s" % OUT)
        sys.exit(3)
    os.makedirs(OUT, exist_ok=True)
    if use_azure:
        print("G3 TODO: Azure hu-HU path not yet implemented (fallback). "
              "ElevenLabs first per spec.")
        sys.exit(3)
    worst = 0
    for v in voices:
        for i, line in enumerate(LINES, 1):
            ms, audio, err = elevenlabs(line, v, key)
            if err:
                print("FAIL voice %s line %d: %s" % (v, i, err))
                sys.exit(1)
            worst = max(worst, ms)
            with open(os.path.join(OUT, "%s_%02d.mp3" % (v[:8], i)), "wb") as f:
                f.write(audio)
            print("voice %s line %02d: %.0f ms, %d bytes" % (v[:8], i, ms, len(audio)))
    print("G3 TTFB worst=%.0f ms (target first byte <=300ms; note: REST total, "
          "streaming will differ). OWNER: listen in %s and judge natural." % (worst, OUT))


if __name__ == "__main__":
    main()
