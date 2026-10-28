#!/usr/bin/env python3
"""G1 synthetic clip generator (see docs/private/DEVIATIONS.md #5).

Generates the 30 gate clips with ElevenLabs HU TTS instead of recorded
voices: 20 HU entity-dense lines (each in 2 voices = 20 clips) + 10 EN
lines (5 topics x 2 voices). Writes audio + manifest.json into
scripts/gates/clips/ (gitignored).

Phone-degradation (8 kHz mu-law -> 16 kHz) needs ffmpeg; without it the
script saves clean audio and prints the conversion command.

Usage:
    ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... python3 scripts/gates/g1_make_synthetic.py

Stdlib only.
"""
import json
import os
import sys
import urllib.request
import urllib.error

HU = [
    ("Kovács Anna vagyok, a számom nulla hat harminc per százhuszonhárom per negyvenöt hatvanhét.",
     ["Kovács Anna", "06 30 123 4567"]),
    ("Jövő kedd délután háromkor szeretnék jönni.",
     ["jövő kedd", "délután háromkor"]),
    ("Tizenkétezer-ötszáz forint lesz a hajvágás?",
     ["tizenkétezer-ötszáz forint"]),
    ("A Rákóczi úton lakom, a Blaha Lujza térnél.",
     ["Rákóczi út", "Blaha Lujza tér"]),
    ("Női hajvágást és gél lakkot szeretnék kérni.",
     ["női hajvágás", "gél lakk"]),
    ("Lemondanám a pénteki időpontomat, Nagy Péter vagyok.",
     ["pénteki időpont", "Nagy Péter"]),
    ("A tulajdonossal szeretnék beszélni, sürgős lenne.",
     ["tulajdonos"]),
    ("Már fél órája várok, ez felháborító.",
     ["fél órája"]),
    ("Elnézést, én a gyógyszertárat keresem, rossz szám?",
     ["gyógyszertár"]),
    ("Hol lehet parkolni a szalon közelében?",
     ["parkolni"]),
]

EN = [
    ("Hello, I'd like to book a haircut for Friday afternoon. My name is Sarah Smith.",
     ["Friday afternoon", "Sarah Smith"]),
    ("How much is a manicure? My number is zero six twenty one two three four five six seven.",
     ["manicure", "06 20 123 4567"]),
    ("Where is your salon located? Is there parking nearby?",
     ["located", "parking"]),
    ("Can I cancel my appointment for tomorrow? This is John Doe.",
     ["cancel", "tomorrow", "John Doe"]),
    ("Do you speak English? I need a pedicure next Tuesday morning.",
     ["English", "pedicure", "Tuesday morning"]),
]

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "clips")


def synth(text, voice_id, key, model="eleven_flash_v2_5"):
    body = json.dumps({"model_id": model, "text": text}).encode()
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/text-to-speech/" + voice_id, data=body,
        headers={"xi-api-key": key, "Content-Type": "application/json",
                 "Accept": "audio/mpeg"})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.read(), None
    except urllib.error.HTTPError as e:
        return None, "HTTP %s %s" % (e.code, e.read().decode()[:200])
    except Exception as e:
        return None, "%s: %s" % (type(e).__name__, e)


def main():
    key = os.environ.get("ELEVENLABS_API_KEY", "")
    v1 = os.environ.get("ELEVENLABS_VOICE_ID", "")
    v2 = os.environ.get("ELEVENLABS_VOICE_ID_2", v1)  # 2nd HU voice if available
    if not key or not v1:
        print("G1-synth SKIP: set ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID "
              "(+ optional ELEVENLABS_VOICE_ID_2).")
        sys.exit(3)
    os.makedirs(OUT, exist_ok=True)
    manifest = []
    n = 0
    for idx, (text, entities) in enumerate(HU, 1):
        for vi, voice in enumerate([v1, v2], 1):
            audio, err = synth(text, voice, key)
            if err:
                print("FAIL hu_%02d voice%d: %s" % (idx, vi, err))
                sys.exit(1)
            fn = "hu_%02d_v%d.mp3" % (idx, vi)
            with open(os.path.join(OUT, fn), "wb") as f:
                f.write(audio)
            manifest.append({"file": fn, "lang": "hu", "quality": "clean",
                             "text": text, "entities": entities})
            n += 1
            print("wrote %s (%d bytes)" % (fn, len(audio)))
    for idx, (text, entities) in enumerate(EN, 1):
        for vi, voice in enumerate([v1, v2], 1):
            audio, err = synth(text, voice, key)
            if err:
                print("FAIL en_%02d voice%d: %s" % (idx, vi, err))
                sys.exit(1)
            fn = "en_%02d_v%d.mp3" % (idx, vi)
            with open(os.path.join(OUT, fn), "wb") as f:
                f.write(audio)
            manifest.append({"file": fn, "lang": "en", "quality": "clean",
                             "text": text, "entities": entities})
            n += 1
            print("wrote %s (%d bytes)" % (fn, len(audio)))
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump({"clips": manifest}, f, indent=2, ensure_ascii=False)
    print("Wrote %d clips + manifest.json to %s" % (n, OUT))
    print("Next: phone-degrade each file (needs ffmpeg):")
    print("  for f in %s/*.mp3; do ffmpeg -y -i \"$f\" -ar 8000 -ac 1 -c:a pcm_mulaw \"${f%%.mp3}_phone.wav\"; done" % OUT)
    print("Then transcribe phone_* via Meta STT and score:")
    print("  python3 scripts/gates/g1_stt_accuracy.py --score scripts/gates/results_local/g1_transcripts.json")


if __name__ == "__main__":
    main()
