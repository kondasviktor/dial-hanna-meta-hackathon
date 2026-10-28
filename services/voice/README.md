# Voice service (Master Spec §6.4)

Python 3.12 + Pipecat on Fly.io (`fra`). Long-lived WebSockets; Vercel
functions can't hold them.

> Local machine runs Python 3.9, so Pipecat is NOT installed here.
> `src/security.py` and `src/fillers.py` are stdlib-only and tested with
> `python3 -m unittest`. The Pipecat pipeline (`pipeline.py`, transports)
> lands on a 3.12 env / Fly.io.

## Layout

```text
services/voice/
  requirements.txt   pinned Pipecat + deps (install on py3.12)
  src/security.py    HMAC verify for tool callbacks (tested)
  src/fillers.py     HU/EN filler phrases, no-repeat picker (tested)
  src/session.py     tenant config fetch from web (needs VOICE_SERVICE_URL)
  src/pipeline.py    TODO: Pipecat STT → Spark → TTS loop (Day-1+)
```
