"""Pipecat voice loop scaffold — Meta Transcribe → Spark → ElevenLabs.

Run on Python 3.12 (Fly.io `fra` or a local 3.12 venv). The host machine may
be 3.9; helpers in this package stay stdlib-testable without Pipecat installed.

Env:
  APP_URL, TOOLS_HMAC_SECRET, META_API_KEY / MODEL_API_KEY,
  ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID, META_ASR_URL
"""
from __future__ import annotations

import json
import os
import time
import urllib.request

from .security import sign
from .session import fetch_session
from .toolloop import chat_request, order_tool_calls, parse_args
from .fillers import pick


TOOLS = [
    {"type": "function", "function": {
        "name": "check_availability",
        "description": "List open appointment slots",
        "parameters": {"type": "object", "properties": {
            "org_id": {"type": "string"}, "call_id": {"type": "string"},
        }},
    }},
    {"type": "function", "function": {
        "name": "book_appointment",
        "description": "Book a confirmed slot",
        "parameters": {"type": "object", "properties": {
            "org_id": {"type": "string"}, "call_id": {"type": "string"},
            "slot_start": {"type": "string"}, "slot_end": {"type": "string"},
            "service_id": {"type": "string"},
            "caller_name": {"type": "string"}, "caller_phone": {"type": "string"},
        }, "required": ["org_id", "call_id", "slot_start"]},
    }},
    {"type": "function", "function": {
        "name": "take_message",
        "description": "Take a callback message",
        "parameters": {"type": "object", "properties": {
            "org_id": {"type": "string"}, "call_id": {"type": "string"},
            "caller_name": {"type": "string"}, "caller_phone": {"type": "string"},
            "message": {"type": "string"},
        }},
    }},
    {"type": "function", "function": {
        "name": "log_knowledge_gap",
        "description": "Log a question Hanna cannot answer",
        "parameters": {"type": "object", "properties": {
            "org_id": {"type": "string"}, "call_id": {"type": "string"},
            "question": {"type": "string"}, "context": {"type": "string"},
        }, "required": ["question"]},
    }},
]


def _post_signed(base, path, body_obj, secret):
    body = json.dumps(body_obj)
    ts = str(int(time.time()))
    sig = sign("POST", path, ts, body, secret)
    req = urllib.request.Request(
        base.rstrip("/") + path,
        data=body.encode(),
        headers={
            "Content-Type": "application/json",
            "X-DH-Timestamp": ts,
            "X-DH-Signature": sig,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def call_tool(base, secret, name, args):
    return _post_signed(base, "/api/voice/tools/%s" % name, args, secret)


def complete_call(base, secret, call_id, payload):
    return _post_signed(base, "/api/voice/calls/%s/complete" % call_id, payload, secret)


def meta_chat(messages, tools=None):
    """Non-streaming turn for the scaffold; Pipecat should stream in production."""
    key = os.environ.get("MODEL_API_KEY") or os.environ.get("META_API_KEY") or ""
    base = os.environ.get("META_API_BASE", "https://api.meta.ai/v1")
    body = chat_request(
        messages[0]["content"] if messages and messages[0]["role"] == "system" else "",
        [m for m in messages if m["role"] != "system"] if messages and messages[0]["role"] == "system" else messages,
        tools,
        model=os.environ.get("MODEL_LIVE", "muse-spark-1.3"),
    )
    # Rebuild cleanly
    body = {
        "model": os.environ.get("MODEL_LIVE", "muse-spark-1.3"),
        "messages": messages,
        "max_tokens": 500,
        "stream": False,
        "reasoning_effort": "minimal",
    }
    if tools:
        body["tools"] = tools
    req = urllib.request.Request(
        base.rstrip("/") + "/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Authorization": "Bearer %s" % key, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def elevenlabs_tts(text, voice_id=None):
    """Return raw mp3 bytes (or None if keys missing)."""
    key = os.environ.get("ELEVENLABS_API_KEY")
    vid = voice_id or os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not vid:
        return None
    url = "https://api.elevenlabs.io/v1/text-to-speech/%s" % vid
    body = {"text": text, "model_id": "eleven_flash_v2_5"}
    req = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={
            "xi-api-key": key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def run_text_demo(to_number, from_number, user_turns):
    """Offline rehearsal without Twilio media: session → turns → complete.

    user_turns: list of English caller strings.
    """
    app = os.environ["APP_URL"]
    secret = os.environ["TOOLS_HMAC_SECRET"]
    session = fetch_session(app, {"to": to_number, "from": from_number}, secret)
    call_id = session["callId"]
    org_id = session["orgId"]
    history = [
        {"role": "system", "content": session["systemPrompt"]},
        {"role": "assistant", "content": session.get("greeting") or session.get("greetingEn")},
    ]
    transcript = [
        {"role": "hanna", "text": history[-1]["content"]},
    ]
    used_fillers = set()
    for utt in user_turns:
        history.append({"role": "user", "content": utt})
        transcript.append({"role": "caller", "text": utt})
        resp = meta_chat(history, TOOLS)
        msg = resp["choices"][0]["message"]
        tool_calls = msg.get("tool_calls") or []
        if tool_calls:
            filler = pick("en", avoid=next(iter(used_fillers), None))
            used_fillers.add(filler)
            transcript.append({"role": "hanna", "text": filler})
            for step in order_tool_calls(tool_calls):
                for tc in step:
                    fn = tc["function"]["name"]
                    args, err = parse_args(tc["function"].get("arguments"))
                    if err:
                        result = {"ok": False, "error": err}
                    else:
                        args = dict(args or {})
                        args.setdefault("org_id", org_id)
                        args.setdefault("call_id", call_id)
                        result = call_tool(app, secret, fn, args)
                    history.append({"role": "assistant", "content": None, "tool_calls": [tc]})
                    history.append({
                        "role": "tool",
                        "tool_call_id": tc["id"],
                        "content": json.dumps(result),
                    })
            resp = meta_chat(history, TOOLS)
            msg = resp["choices"][0]["message"]
        content = msg.get("content") or ""
        history.append({"role": "assistant", "content": content})
        transcript.append({"role": "hanna", "text": content})
        elevenlabs_tts(content, session.get("voiceId"))
    complete_call(app, secret, call_id, {
        "transcript": transcript,
        "duration_s": max(30, 15 * len(user_turns)),
        "language": "en",
    })
    return {"callId": call_id, "turns": len(user_turns)}


if __name__ == "__main__":
    # Minimal smoke: needs APP_URL + TOOLS_HMAC_SECRET + Meta key.
    print(run_text_demo(
        os.environ.get("TWILIO_PHONE_NUMBER", "+10000000000"),
        "+36111111111",
        [
            "Hi, I'd like to book a haircut on Thursday afternoon.",
            "Yes, please — my name is Anna.",
            "Do you have parking nearby?",
        ],
    ))
