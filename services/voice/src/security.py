"""Signed tool-call verification (mirror of apps/web/src/lib/security.ts).

Voice service verifies X-DH-* headers on incoming tool-callback responses
and signs its POSTs to /api/voice/tools/<name> (Master Spec §6.7).
Stdlib only.
"""
import hashlib
import hmac
import time

SKEW_SECONDS = 60


def sign(method, path, timestamp, body, secret):
    msg = "\n".join([method, path, timestamp, body]).encode()
    return hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()


def verify(signature, method, path, timestamp, body, secret, now=None):
    now = time.time() if now is None else now
    try:
        ts = float(timestamp)
    except (TypeError, ValueError):
        return False, "bad-timestamp"
    if abs(now - ts) > SKEW_SECONDS:
        return False, "stale"
    expected = sign(method, path, timestamp, body, secret)
    if not hmac.compare_digest(signature or "", expected):
        return False, "bad-signature"
    return True, None
