# Voice service (Master Spec §6.4)

Python 3.12 + Pipecat on Fly.io (`fra`). Long-lived WebSockets; Vercel
functions can't hold them.

> Local machine may run Python 3.9, so Pipecat is NOT installed here.
> Helpers are stdlib-only and tested with `python3 -m unittest`.
> `pipeline.py` includes a text-demo path (Meta Spark + ElevenLabs + signed
> web tools) for private rehearsals. Wire Twilio Media Streams on Fly with 3.12.

## Layout

```text
services/voice/
  requirements.txt
  src/security.py    HMAC for tool callbacks
  src/fillers.py     HU/EN fillers
  src/session.py     GET /api/voice/session
  src/toolloop.py    tool-call ordering
  src/turnstate.py   turn state machine
  src/pipeline.py    text demo + TTS scaffold (Pipecat transport TODO on Fly)
```

## Private rehearsal (no Twilio stream)

```bash
export APP_URL=https://your-preview.vercel.app
export TOOLS_HMAC_SECRET=…
export MODEL_API_KEY=…   # Meta hackathon key
export ELEVENLABS_API_KEY=…
export ELEVENLABS_VOICE_ID=…
python3.12 -m src.pipeline   # from services/voice with PYTHONPATH=src parent
```

Hackathon path: English caller → Meta Voice Transcribe (live) → Spark 1.3 →
ElevenLabs Flash. No Retell. No public browser call.
