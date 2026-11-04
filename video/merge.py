#!/usr/bin/env python3
"""Assemble the Dial Hanna submission video from recorded clips + generated assets.

Expects (any of .mov/.mp4/.m4v):
  video/clips/01_import.*     Muse Wonder import + FAQ approval
  video/clips/02_call.*       demo call: chocolate-cake order + delivery gap
  video/clips/03_gap.*        answering the delivery gap in one line
  video/clips/04_payoff.*     second call: delivery answered from the new FAQ
  video/clips/05_dashboard.*  outcomes + follow-up tick

Run: python3 video/merge.py   ->  video/DialHanna-submission.mp4 (1080p, H.264)
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "video" / "assets"
CLIPS = ROOT / "video" / "clips"
WORK = ROOT / "video" / "work"
OUT = ROOT / "video" / "DialHanna-submission.mp4"
FONT = "/System/Library/Fonts/Helvetica.ttc"
W, H, FPS = 1920, 1080, 30


def run(cmd):
    print("+", " ".join(cmd[:6]), "…")
    subprocess.run(cmd, check=True)


def find_clip(prefix):
    for p in sorted(CLIPS.glob(f"{prefix}.*")):
        if p.suffix.lower() in {".mov", ".mp4", ".m4v"}:
            return p
    return None


def seg_image(png, dur, name, audio=None):
    """Static card segment, with optional narration audio."""
    out = WORK / f"{name}.mp4"
    vf = f"scale={W}:{H},fps={FPS},format=yuv420p"
    if audio:
        run(["ffmpeg", "-y", "-loop", "1", "-i", str(png), "-i", str(audio),
             "-vf", vf, "-t", str(dur), "-c:v", "libx264", "-preset", "veryfast",
             "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-shortest", str(out)])
    else:
        run(["ffmpeg", "-y", "-loop", "1", "-i", str(png), "-f", "lavfi",
             "-i", "anullsrc=r=48000:cl=stereo", "-vf", vf, "-t", str(dur),
             "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "-b:a", "160k", str(out)])
    return out


def super_filter(text, seconds=4):
    esc = text.replace("'", "\\'").replace(":", "\\:")
    return (
        f"drawtext=fontfile={FONT}:text='{esc}':fontcolor=white:fontsize=40:"
        f"box=1:boxcolor=0x0c1c20@0.82:boxborderw=18:x=64:y=h-140:"
        f"enable='between(t,0.5,{seconds})'"
    )


def seg_clip(path, name, super_text=None, max_len=None, vo=None, vo_dur=0):
    out = WORK / f"{name}.mp4"
    vf = (
        f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
        f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0xf2f3ef,fps={FPS},format=yuv420p"
    )
    if super_text:
        vf += "," + super_filter(super_text)
    cmd = ["ffmpeg", "-y", "-i", str(path)]
    if vo:
        cmd += ["-i", str(vo)]
    cmd += ["-vf", vf]
    if max_len:
        cmd += ["-t", str(max_len)]
    if vo:
        # Narration loud, clip audio tucked under it for its duration.
        cmd += ["-filter_complex",
                f"[0:a]volume=0.25:enable='lt(t,{vo_dur})'[duck];[duck][1:a]amix=inputs=2:duration=first[a]",
                "-map", "0:v", "-map", "[a]"]
    cmd += ["-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "-b:a", "160k",
            "-ar", "48000", "-ac", "2", str(out)]
    run(cmd)
    return out


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    need = {
        "01_import": "Wonder import + approve FAQs",
        "02_call": "demo call (order + delivery gap)",
        "03_gap": "answer the gap in one line",
        "04_payoff": "second call, delivery answered",
        "05_dashboard": "outcomes + follow-up tick",
    }
    clips = {k: find_clip(k) for k in need}
    missing = [f"{k}.* ({v})" for k, v in need.items() if not clips[k]]
    if missing:
        print("Missing clips in video/clips/:")
        for m in missing:
            print("  -", m)
        print("Record those, then re-run: python3 video/merge.py")
        sys.exit(1)

    segs = [
        seg_image(ASSETS / "card_title.png", 3.0, "s0_title"),
        seg_image(ASSETS / "card_problem.png", 11.6, "s1_problem", ASSETS / "vo_problem.mp3"),
        seg_clip(clips["01_import"], "s2_import",
                 "Muse Wonder builds the knowledge base", max_len=22,
                 vo=ASSETS / "vo_import.mp3", vo_dur=11.3),
        seg_clip(clips["02_call"], "s3_call",
                 "Live call: chocolate-cake order, then a question Hanna can't answer"),
        seg_clip(clips["03_gap"], "s4_gap", "The owner answers once in the dashboard", max_len=16),
        seg_clip(clips["04_payoff"], "s5_payoff", "Next caller: Hanna knows it now", max_len=16),
        seg_clip(clips["05_dashboard"], "s6_dashboard", "Intent → outcome → next action", max_len=13),
        seg_image(ASSETS / "card_stack.png", 15.5, "s7_stack", ASSETS / "vo_stack.mp3"),
        seg_image(ASSETS / "card_cta.png", 4.5, "s8_cta", ASSETS / "vo_cta.mp3"),
    ]
    lst = WORK / "concat.txt"
    lst.write_text("".join(f"file '{s}'\n" for s in segs))
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
         "-c", "copy", str(OUT)])
    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT)],
        capture_output=True, text=True).stdout.strip()
    print(f"\nDONE: {OUT} ({float(dur):.1f}s, target ~150s / 2:30)")


if __name__ == "__main__":
    main()
