#!/usr/bin/env python3
"""Assemble the Dial Hanna commercial cut (~2:30-2:45) from clips + assets.

  video/clips/01-import.*     website import (long crawl — timelapsed here)
  video/clips/02-order.*      demo call: the order
  video/clips/03-gap.*        call: Uber Eats question Hanna can't answer
  video/clips/04-gap-fill.*   owner answers the gap in the dashboard
  video/clips/05-payoff.*     call: delivery answered from the new FAQ
  video/clips/06-dashboard.*  outcomes + follow-up triage

Run: python3 video/merge.py   ->  video/DialHanna-submission.mp4 (1080p, H.264)
Call clips get their live silences compressed (standard demo edit).
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
VF_BASE = (
    f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
    f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0xf2f3ef,fps={FPS},format=yuv420p"
)
SILENCE_CUT = "silenceremove=stop_periods=-1:stop_duration=0.9:stop_threshold=-45dB"
ENC = ["-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "-b:a", "160k",
       "-ar", "48000", "-ac", "2"]


def run(cmd):
    subprocess.run(cmd, check=True)


def probe_dur(p):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
        capture_output=True, text=True).stdout.strip()
    return float(out)


def has_audio(p):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index",
         "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout.strip()
    return bool(out)


def find_clip(prefix):
    for p in sorted(CLIPS.glob(f"{prefix}.*")):
        if p.suffix.lower() in {".mov", ".mp4", ".m4v"}:
            return p
    return None


def super_filter(text, seconds=4.5):
    esc = text.replace("'", "\\'").replace(":", "\\:")
    return (
        f"drawtext=fontfile={FONT}:text='{esc}':fontcolor=white:fontsize=40:"
        f"box=1:boxcolor=0x0c1c20@0.82:boxborderw=18:x=64:y=h-140:"
        f"enable='between(t,0.5,{seconds})'"
    )


def norm(src, name, ss=0, dur=None, speed=1.0, compress=False, super_text=None, crop=None,
         mute=False, fade_out=False):
    """Canonical segment: 1080p30 video + stereo audio (silence if source has none)."""
    out = WORK / f"{name}.mp4"
    vf = (f"crop={crop},fps={FPS}," if crop else "") + VF_BASE
    if speed != 1.0:
        vf += f",setpts=PTS/{speed}"
    if super_text:
        vf += "," + super_filter(super_text)
    cmd = ["ffmpeg", "-y"]
    if ss:
        cmd += ["-ss", str(ss)]
    cmd += ["-i", str(src)]
    af = []
    if speed != 1.0:
        af.append(f"atempo={speed}")
    if compress:
        af.append(SILENCE_CUT)
    if fade_out and dur:
        af.append(f"afade=t=out:st={max(0, dur - 1)}:d=1")
    if has_audio(src) and not mute:
        cmd += ["-vf", vf, "-map", "0:v", "-map", "0:a"]
        if af:
            cmd += ["-af", ",".join(af)]
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                "-vf", vf, "-map", "0:v", "-map", "1:a", "-shortest"]
    if dur:
        cmd += ["-t", str(dur)]
    run([*cmd, *ENC, str(out)])
    return out


def card(png, dur, name, vo=None):
    out = WORK / f"{name}.mp4"
    cmd = ["ffmpeg", "-y", "-loop", "1", "-i", str(png)]
    if vo:
        cmd += ["-i", str(vo), "-map", "0:v", "-map", "1:a"]
    else:
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
                "-map", "0:v", "-map", "1:a"]
    run([*cmd, "-vf", f"scale={W}:{H},fps={FPS},format=yuv420p",
         "-t", str(dur), *ENC, str(out)])
    return out


def with_vo(seg, vo, name, vo_dur, duck_to=0.2):
    """Lay narration over a segment, ducking its own audio while VO speaks."""
    out = WORK / f"{name}.mp4"
    run(["ffmpeg", "-y", "-i", str(seg), "-i", str(vo), "-filter_complex",
         f"[0:a]volume={duck_to}:enable='lt(t,{vo_dur})'[bed];[bed][1:a]amix=inputs=2:duration=first[a]",
         "-map", "0:v", "-map", "[a]", *ENC, str(out)])
    return out


def timelapse(src, name, head=6, tail=7, speed=24):
    total = probe_dur(src)
    mid_end = max(head + 1, total - tail)
    parts = [
        norm(src, f"{name}_h", dur=head),
        norm(src, f"{name}_m", ss=head, dur=mid_end - head, speed=speed),
        norm(src, f"{name}_t", ss=mid_end, dur=tail),
    ]
    lst = WORK / f"{name}_list.txt"
    lst.write_text("".join(f"file '{p}'\n" for p in parts))
    out = WORK / f"{name}.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out)])
    return out


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    need = ["01-import", "02-order", "03-gap", "04-gap-fill", "05-payoff", "06-dashboard"]
    clips = {k: find_clip(k) for k in need}
    missing = [k for k in need if not clips[k]]
    if missing:
        print("Missing clips:", ", ".join(missing))
        sys.exit(1)

    gap_parts = [
        norm(clips["03-gap"], "s07_gap", super_text="Caller asks about Uber Eats delivery",
             dur=7, mute=True, crop="1398:230:0:240"),
        norm(clips["04-gap-fill"], "s08_fill", super_text="The owner answers once in the dashboard",
             speed=1.6),
        norm(clips["05-payoff"], "s09_payoff", super_text="Next caller: Hanna knows it now",
             dur=7, mute=True, crop="1398:230:0:240"),
    ]
    gap_lst = WORK / "gap_list.txt"
    gap_lst.write_text("".join(f"file '{p}'\n" for p in gap_parts))
    gap_raw = WORK / "s10_gap_raw.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(gap_lst), "-c", "copy", str(gap_raw)])
    GAPSEG = with_vo(gap_raw, ASSETS / "vo_gap.mp3", "s10_gap", vo_dur=16.7, duck_to=0.0)

    imp = timelapse(clips["01-import"], "s05_import")
    imp = with_vo(imp, ASSETS / "vo_import.mp3", "s05_import_vo", vo_dur=7.8)

    segs = [
        card(ASSETS / "card_hook.png", 7.6, "s01_hook", ASSETS / "vo_hook.mp3"),
        with_vo(norm(ASSETS / "sectors.mp4", "s02_sectors_raw"),
                ASSETS / "vo_sectors2.mp3", "s02_sectors", vo_dur=19.7),
        card(ASSETS / "card_money.png", 11.2, "s03_money", ASSETS / "vo_money.mp3"),
        card(ASSETS / "card_steps.png", 12.2, "s04_steps", ASSETS / "vo_steps.mp3"),
        imp,
        norm(clips["02-order"], "s06_order", super_text="Live call: Hanna takes the full order",
             dur=32, compress=True, fade_out=True, crop="1398:230:0:240"),
        GAPSEG,  # built below: muted gap calls + fill, narrated
        norm(clips["06-dashboard"], "s10_dash", super_text="Intent > outcome > next action",
             dur=9),
        card(ASSETS / "card_stack.png", 15.5, "s11_stack", ASSETS / "vo_stack.mp3"),
        card(ASSETS / "card_punch.png", 5.4, "s12_punch", ASSETS / "vo_cta.mp3"),
    ]
    lst = WORK / "concat.txt"
    lst.write_text("".join(f"file '{s}'\n" for s in segs))
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(OUT)])
    print(f"\nDONE: {OUT} ({probe_dur(OUT):.1f}s, target 150-165s)")


if __name__ == "__main__":
    main()
