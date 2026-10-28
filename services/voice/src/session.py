"""Tenant session fetch: GET /api/voice/session (signed) — Master Spec §6.3.

Resolves tenant + live agent version at call start. Phone path resolves by
called number (to=<DID>); browser path uses a short-lived JWT token.
Stdlib only.
"""
import json
import urllib.request

from .security import sign


def fetch_session(base_url, params, secret, timeout_s=10):
    query = "&".join("%s=%s" % (k, v) for k, v in params.items())
    path = "/api/voice/session?" + query
    ts = str(int(__import__("time").time()))
    sig = sign("GET", path, ts, "", secret)
    req = urllib.request.Request(
        base_url.rstrip("/") + path,
        headers={"X-DH-Timestamp": ts, "X-DH-Signature": sig})
    with urllib.request.urlopen(req, timeout=timeout_s) as r:
        return json.loads(r.read().decode())
