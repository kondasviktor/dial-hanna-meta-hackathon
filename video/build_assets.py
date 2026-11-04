#!/usr/bin/env python3
"""Generate Dial Hanna submission-video assets: cards + EN narration (v2 commercial).

Reads ELEVENLABS_API_KEY from the repo-root .env (never printed).
Outputs into video/assets/. Run from the repo root: python3 video/build_assets.py
"""
import json
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
MUTED_D = (62, 81, 87)
DEEP = (11, 93, 63)

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


def card_hook():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 280)
    d.text((120, 330), "The phone rings.", font=font(120), fill=INK)
    d.text((120, 480), "You are busy.", font=font(64), fill=MUTED_D)
    d.text((120, 570), "Hanna answers.", font=font(88), fill=DEEP)
    save(img, "card_hook.png")


def card_sectors():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 240)
    d.text((120, 290), "Made for businesses", font=font(84), fill=INK)
    d.text((120, 390), "where the phone rings while hands are busy", font=font(52), fill=MUTED_D)
    y = 560
    for s in ["Salons", "Bakeries", "Cafés", "Florists"]:
        d.text((140, y), "—", font=font(60), fill=(200, 130, 10))
        d.text((230, y), s, font=font(64), fill=INK)
        y += 105
    save(img, "card_sectors.png")


def card_money():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 230)
    d.text((120, 280), "The math is simple", font=font(84), fill=INK)
    d.text((120, 430), "20 missed calls a week", font=font(58), fill=MUTED_D)
    d.text((120, 510), "→ 8 lost bookings a month", font=font(58), fill=MUTED_D)
    d.text((120, 640), "≈ 120 000 Ft", font=font(110), fill=DEEP)
    d.text((120, 770), "left on the table, every month", font=font(52), fill=MUTED_D)
    save(img, "card_money.png")


def card_steps():
    from PIL import ImageDraw

    img = base(PANEL)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 120)
    d.text((120, 170), "Live in minutes", font=font(84), fill=WHITE)
    steps = [
        ("1", "Paste your website"),
        ("2", "Muse Wonder drafts your knowledge"),
        ("3", "Approve the answers"),
        ("4", "Hanna picks up the phone"),
    ]
    y = 380
    for n, t in steps:
        d.ellipse([120, y, 200, y + 80], fill=AMBER)
        d.text((143, y + 8), n, font=font(52), fill=INK)
        d.text((250, y + 6), t, font=font(58), fill=WHITE)
        y += 140
    save(img, "card_steps.png")


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


def card_punch():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 260)
    d.text((120, 310), "Don't leave orders", font=font(110), fill=INK)
    d.text((120, 440), "on the table.", font=font(110), fill=INK)
    d.text((120, 610), "Ask Hanna.", font=font(72), fill=DEEP)
    d.text((120, 720), "Join the waitlist — dialhanna.com", font=font(54), fill=MUTED_D)
    save(img, "card_punch.png")


def card_title():
    from PIL import ImageDraw

    img = base(GROUND)
    d = ImageDraw.Draw(img)
    amber_rule(d, 120, 300)
    d.text((120, 350), "Dial Hanna", font=font(150), fill=INK)
    d.text((120, 540), "The AI receptionist for Hungarian small businesses.", font=font(52), fill=MUTED_D)
    save(img, "card_title.png")


SEGMENTS = {
    "vo_hook": "The phone rings. You are busy. By the time you call back, they've already booked someone else. Hanna answers instead.",
    "vo_sectors": "Built for salons, bakeries, cafés, and florists. Anywhere the phone rings while your hands are busy.",
    "vo_money": "The math is simple. Twenty missed calls a week can mean eight lost bookings. Around one hundred twenty thousand forints a month, gone. Hanna costs less than one of them.",
    "vo_steps": "Getting started takes minutes. Paste your website. Meta Muse Wonder reads it, works out your business, and drafts your knowledge base. Approve the answers, and Hanna is live.",
    "vo_import": "She learns your hours, your products, and your prices, straight from your site. One import, and she sounds like she's worked there for years.",
    "vo_stack": "Under the hood: Muse Wonder builds the knowledge. Muse Spark runs the call. Muse Voice Transcribe is our production speech path — Hungary is home, this demo is English. ElevenLabs is Hanna's voice.",
    "vo_cta": "Don't leave orders on the table. Ask Hanna. Join the waitlist at dial hanna dot com.",
}

VOICE = "EXAVITQu4vr4xnSDxMaL"  # Sarah (EN), same as Hanna's English voice


def tts(name, text):
    if (OUT / f"{name}.mp3").exists() and (OUT / f"{name}.mp3").stat().st_size > 0:
        print("narration (cached):", name)
        return
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


SECTORS = [
    ("Salon & beauty", "scissors"),
    ("Auto & tyre service", "car"),
    ("Trades & handymen", "wrench"),
    ("Moving & cleaning", "truck"),
    ("Guesthouses & apartments", "building-2"),
    ("Trainers & studios", "dumbbell"),
    ("Photographers & events", "camera"),
    ("Pet grooming", "paw-print"),
    ("Hospitality", "utensils-crossed"),
    ("Flowers & gifts", "flower-2"),
    ("Language schools & tutors", "graduation-cap"),
    ("Freelancers", "briefcase"),
]


def _path_points(d, scale, ox, oy):
    """Sample an SVG path (M/L/H/V/C/S/Q/T/A/Z subset) into polyline points."""
    import math
    import re

    toks = re.findall(r"[MLHVCSQTAZmlhvcsqtaz]|-?\d*\.?\d+(?:e[-+]?\d+)?", d)
    pts = []
    i = 0
    cmd = None
    cx = cy = 0.0
    sx = sy = 0.0
    prev_c = None

    def P(x, y):
        return (ox + x * scale, oy + y * scale)

    def cubic(p0, p1, p2, p3, n=14):
        out = []
        for k in range(1, n + 1):
            t = k / n
            mt = 1 - t
            x = mt**3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t**3 * p3[0]
            y = mt**3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t**3 * p3[1]
            out.append(P(x, y))
        return out

    def quad(p0, p1, p2, n=10):
        out = []
        for k in range(1, n + 1):
            t = k / n
            mt = 1 - t
            x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0]
            y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]
            out.append(P(x, y))
        return out

    def arc_to(x, y, rx, ry, rot, large, sweep, n=12):
        # Lucide arcs are circular (rx == ry). Choose the center candidate
        # whose swept angle matches the large-arc flag; sample along it.
        import math as _m

        x1, y1 = cx, cy
        r = max(rx, ry, _m.hypot(x - x1, y - y1) / 2)
        mx, my = (x1 + x) / 2, (y1 + y) / 2
        dx, dy = x - x1, y - y1
        dist = _m.hypot(dx, dy)
        if dist == 0:
            return [P(x, y)]
        h = _m.sqrt(max(0.0, r * r - (dist / 2) ** 2))
        ux, uy = -dy / dist, dx / dist
        best = None
        for sgn in (1, -1):
            ccx, ccy = mx + sgn * h * ux, my + sgn * h * uy
            a0 = _m.atan2(y1 - ccy, x1 - ccx)
            a1 = _m.atan2(y - ccy, x - ccx)
            if sweep:
                delta = (a1 - a0) % (2 * _m.pi)
            else:
                delta = -((a0 - a1) % (2 * _m.pi))
            is_large = abs(delta) > _m.pi
            if is_large == bool(large):
                best = (ccx, ccy, a0, delta)
                break
            if best is None:
                best = (ccx, ccy, a0, delta)
        ccx, ccy, a0, delta = best
        return [
            P(ccx + r * _m.cos(a0 + delta * k / n), ccy + r * _m.sin(a0 + delta * k / n))
            for k in range(1, n + 1)
        ]

    while i < len(toks):
        if re.fullmatch(r"[A-Za-z]", toks[i]):
            cmd = toks[i]
            i += 1
            if cmd in "Zz":
                pts.append(P(sx, sy))
                cx, cy = sx, sy
                continue
        if cmd is None:
            break
        rel = cmd.islower()
        C = cmd.upper()
        try:
            if C == "M":
                x, y = float(toks[i]), float(toks[i + 1])
                i += 2
                if rel:
                    x, y = x + cx, y + cy
                cx, cy = x, y
                sx, sy = x, y
                pts.append(P(x, y))
                cmd = "l" if rel else "L"
            elif C == "L":
                x, y = float(toks[i]), float(toks[i + 1])
                i += 2
                if rel:
                    x, y = x + cx, y + cy
                cx, cy = x, y
                pts.append(P(x, y))
            elif C == "H":
                x = float(toks[i])
                i += 1
                cx = x + cx if rel else x
                pts.append(P(cx, cy))
            elif C == "V":
                y = float(toks[i])
                i += 1
                cy = y + cy if rel else y
                pts.append(P(cx, cy))
            elif C == "C":
                v = [float(toks[i + k]) for k in range(6)]
                i += 6
                if rel:
                    v = [v[0] + cx, v[1] + cy, v[2] + cx, v[3] + cy, v[4] + cx, v[5] + cy]
                seg = cubic((cx, cy), (v[0], v[1]), (v[2], v[3]), (v[4], v[5]))
                pts.extend(seg)
                prev_c = (v[2], v[3])
                cx, cy = v[4], v[5]
            elif C == "S":
                v = [float(toks[i + k]) for k in range(4)]
                i += 4
                if rel:
                    v = [v[0] + cx, v[1] + cy, v[2] + cx, v[3] + cy]
                c1 = (2 * cx - prev_c[0], 2 * cy - prev_c[1]) if prev_c else (cx, cy)
                seg = cubic((cx, cy), c1, (v[0], v[1]), (v[2], v[3]))
                pts.extend(seg)
                prev_c = (v[0], v[1])
                cx, cy = v[2], v[3]
            elif C == "Q":
                v = [float(toks[i + k]) for k in range(4)]
                i += 4
                if rel:
                    v = [v[0] + cx, v[1] + cy, v[2] + cx, v[3] + cy]
                seg = quad((cx, cy), (v[0], v[1]), (v[2], v[3]))
                pts.extend(seg)
                prev_c = (v[0], v[1])
                cx, cy = v[2], v[3]
            elif C == "T":
                x, y = float(toks[i]), float(toks[i + 1])
                i += 2
                if rel:
                    x, y = x + cx, y + cy
                c1 = (2 * cx - prev_c[0], 2 * cy - prev_c[1]) if prev_c else (cx, cy)
                seg = quad((cx, cy), c1, (x, y))
                pts.extend(seg)
                prev_c = c1
                cx, cy = x, y
            elif C == "A":
                rx, ry, rot, la, sw, x, y = (float(toks[i + k]) for k in range(7))
                i += 7
                if rel:
                    x, y = x + cx, y + cy
                seg = arc_to(x, y, rx, ry, rot, int(la), int(sw))
                pts.extend(seg)
                prev_c = None
                cx, cy = x, y
            else:
                break
        except (IndexError, ValueError):
            break
        if C not in "CSQT":
            prev_c = None
    return pts


def draw_lucide(d, slug, ox, oy, size, color, width_scale=2.0):
    # color may be RGBA (overlay) or RGB; PIL accepts both for strokes
    """Draw one Lucide icon (from lucide-react's iconNode data) with PIL strokes."""
    import re

    path = ROOT / "apps" / "web" / "node_modules" / "lucide-react" / "dist" / "esm" / "icons" / f"{slug}.js"
    text = path.read_text()
    scale = size / 24.0
    w = max(2, round(width_scale * scale))
    for tag, attrs_raw in re.findall(r'\[\s*"(\w+)",\s*\{([^}]*)\}\s*\]', text):
        attrs = dict(re.findall(r'(\w+): "([^"]*)"', attrs_raw))
        if tag == "circle":
            cx, cy, r = (float(attrs["cx"]) * scale + ox, float(attrs["cy"]) * scale + oy,
                         float(attrs["r"]) * scale)
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=w)
        elif tag == "rect":
            x, y = float(attrs.get("x", 0)) * scale + ox, float(attrs.get("y", 0)) * scale + oy
            rw, rh = float(attrs.get("width", 0)) * scale, float(attrs.get("height", 0)) * scale
            d.rectangle([x, y, x + rw, y + rh], outline=color, width=w)
        elif tag == "line":
            d.line([float(attrs["x1"]) * scale + ox, float(attrs["y1"]) * scale + oy,
                    float(attrs["x2"]) * scale + ox, float(attrs["y2"]) * scale + oy],
                   fill=color, width=w, joint="curve")
        elif tag in ("polyline", "polygon"):
            nums = [float(v) for v in re.findall(r"-?\d*\.?\d+", attrs.get("points", ""))]
            pts = [(nums[k] * scale + ox, nums[k + 1] * scale + oy) for k in range(0, len(nums) - 1, 2)]
            if tag == "polygon" and len(pts) > 2:
                pts.append(pts[0])
            if len(pts) >= 2:
                d.line(pts, fill=color, width=w, joint="curve")
        elif tag == "path":
            pts = _path_points(attrs.get("d", ""), scale, ox, oy)
            if len(pts) >= 2:
                d.line(pts, fill=color, width=w, joint="curve")


def sectors_animation():
    """One-by-one reveal of all landing trades with Lucide icons -> sectors.mp4."""
    import subprocess

    from PIL import Image, ImageDraw

    frames_dir = OUT / "sectors_frames"
    frames_dir.mkdir(exist_ok=True)
    fps = 30
    reveal_at = [0.6 + i * 1.42 for i in range(len(SECTORS))]
    total = reveal_at[-1] + 3.2
    n_frames = int(total * fps)
    cols, rows = 3, 4
    gx, gy = 130, 330
    cw, ch = 560, 168

    def render_frame(t):
        img = base(PANEL)
        d = ImageDraw.Draw(img, "RGBA")
        amber_rule(d, 120, 110)
        d.text((120, 160), "Who Hanna answers for", font=font(76), fill=WHITE)
        for i, (name, slug) in enumerate(SECTORS):
            rt = reveal_at[i]
            if t < rt:
                continue
            p = min(1.0, (t - rt) / 0.3)
            alpha = int(255 * p)
            dy = int((1 - p) * 18)
            col, row = i % cols, i // cols
            x, y = gx + col * cw, gy + row * ch + dy
            overlay = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
            od = ImageDraw.Draw(overlay)
            od.rounded_rectangle([x, y, x + 88, y + 88], radius=18,
                                 outline=AMBER + (alpha,), width=3)
            draw_lucide(od, slug, x + 17, y + 17, 54, WHITE + (alpha,))
            od.text((x + 106, y + 24), name, font=font(33), fill=WHITE + (alpha,))
            img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
            d = ImageDraw.Draw(img, "RGBA")
        return img

    for f in range(n_frames):
        render_frame(f / fps).save(frames_dir / f"f{f:04d}.png")
    out_mp4 = OUT / "sectors.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-framerate", str(fps), "-i", str(frames_dir / "f%04d.png"),
         "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a",
         "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-shortest", str(out_mp4)],
        check=True, capture_output=True)
    print(f"sectors animation: {out_mp4} ({total:.1f}s)")


EXTRA_SEGMENTS = {
    "vo_sectors2": "Salons and beauty. Auto and tyre shops. Trades and handymen. Moving and cleaning. Guesthouses. Trainers and studios. Photographers and events. Pet grooming. Hospitality. Flowers and gifts. Language schools and tutors. Freelancers. If your hands are busy, Hanna picks up.",
    "vo_import2": "Watch what Wonder does. It reads the website and builds the knowledge base: products and prices, phone number, opening hours, and draft answers to the questions customers ask most. You approve, edit, or reject each answer, and add anything the site missed.",
    "vo_gap": "But what if a caller asks something Hanna does not know yet, like: do you deliver with Uber Eats? She logs it as an open question for you. You answer once, here in the dashboard. Next time, she knows. Her knowledge grows with every call.",
}


if __name__ == "__main__":
    card_title()
    card_hook()
    card_sectors()
    card_money()
    card_steps()
    card_stack()
    card_punch()
    for name, text in {**SEGMENTS, **EXTRA_SEGMENTS}.items():
        tts(name, text)
    sectors_animation()
    print("done ->", OUT)
