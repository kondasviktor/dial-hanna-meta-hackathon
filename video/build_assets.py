#!/usr/bin/env python3
"""Generate Dial Hanna video assets: title/architecture/CTA cards + EN narration.

Reads ELEVENLABS_API_KEY from the repo-root .env (never printed).
Outputs into video/assets/. Run from the repo root: python3 video/build_assets.py
"""
import json
import os
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "video" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

ENV = {}
for line in (ROOT / ".env").read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, _, v = line.partition("=")
        ENV[k.strip()] = v.strip().strip('"')

INK = (12, 28, 32)
GROUND = (242, 243, 239)
PANEL = (14, 42, 48)
AMBER = (255, 182, 46)
GREEN = (61, 220, 151)
WHITE = (255, 255, 255)
MUTED_L = (214, 226, 224)

FONT = "/System/Library/Fonts/Helvetica.ttc"


def font(size):
    from PIL import ImageFont

    return ImageFont.truetype(FONT, size)


def base(bg):
    from PIL import Image

    return Image.new("RGB", (1920, 1080), bg)


def amber_rule(d, x, y, w=120):
    d.rounded_rectangle([x, y, x + w, y + 10], radius=5, fill=AMBER)


def save(img, name):
    img.save(OUT / name, quality=95)
    print("card:", name)


def card_title():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 300)
    d.text((120, 350), "Dial Hanna", font=font(150), fill=INK)
    d.text((120, 540), "The AI receptionist for Hungarian small businesses.", font=font(52), fill=(62, 81, 87))
    d.text((120, 640), "She answers when the owner can't.", font=font(52), fill=(62, 81, 87))
    save(img, "card_title.png")


def card_problem():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 330)
    d.text((120, 390), "A missed call is a missed booking.", font=font(76), fill=INK)
    d.text((120, 510), "Busy owners can't always pick up.", font=font(50), fill=(62, 81, 87))
    d.text((120, 580), "Hanna answers — every time.", font=font(50), fill=(11, 93, 63))
    save(img, "card_problem.png")


def card_stack():
    from PIL import ImageDraw

    img = base(PANEL)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 100)
    d.text((120, 150), "Built on Meta", font=font(84), fill=WHITE)
    rows = [
        ("Muse Wonder", "Reads the website URL, maps the industry,\ndrafts the FAQ customers actually ask."),
        ("Muse Spark", "Runs every live call — conversation,\norders, follow-ups, outcomes."),
        ("Muse Voice Transcribe", "Production speech-to-text. Hungary is home;\nthis hackathon demo runs in English."),
        ("ElevenLabs Flash", "Hanna's voice (text-to-speech)."),
    ]
    y = 320
    for name, desc in rows:
        d.text((120, y), name, font=font(52), fill=GREEN)
        for i, line in enumerate(desc.split("\n")):
            d.text((760, y + 4 + i * 52), line, font=font(44), fill=MUTED_L)
        y += 158
    d.text((120, 990), "Dial Hanna · Meta Global AI Developer Hackathon", font=font(36), fill=(140, 160, 158))
    save(img, "card_stack.png")


def card_cta():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 300)
    d.text((120, 350), "Join the waitlist", font=font(110), fill=INK)
    d.text((120, 510), "dialhanna.com", font=font(72), fill=(11, 93, 63))
    d.text((120, 640), "Dial Hanna — your shop's second pair of hands.", font=font(48), fill=(62, 81, 87))
    save(img, "card_cta.png")


SEGMENTS = {
    "vo_problem": "When a Hungarian shop misses a call, it misses a booking. Owners are busy — with customers, with cakes, with life. Hanna answers, every time.",
    "vo_import": "It starts with one paste. Meta Muse Wonder reads the website, works out the industry, and drafts the questions customers actually ask. Approve them, and Hanna is live.",
    "vo_stack": "Under the hood: Muse Wonder builds the knowledge. Muse Spark runs the call. Muse Voice Transcribe is our production speech path — Hungary is home, this demo is English. ElevenLabs is Hanna's voice.",
    "vo_cta": "Dial Hanna. Join the waitlist at dial hanna dot com.",
}

VOICE = "EXAVITQu4vr4xnSDxMaL"  # Sarah (EN), same as Hanna's English voice


def tts(name, text):
    key = ENV.get("ELEVENLABS_API_KEY", "")
    if not key:
        print("SKIP narration (no ELEVENLABS_API_KEY):", name)
        return
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": "eleven_flash_v2_5", "language_code": "en"}).encode(),
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        (OUT / f"{name}.mp3").write_bytes(r.read())
    print("narration:", name)


if __name__ == "__main__":
    card_title()
    card_problem()
    card_stack()
    card_cta()
    for name, text in SEGMENTS.items():
        tts(name, text)
    print("done ->", OUT)
