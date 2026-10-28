import time
import unittest

from src.security import sign, verify
from src.fillers import pick


class SecurityTest(unittest.TestCase):
    def test_round_trip(self):
        ts = str(int(time.time()))
        sig = sign("POST", "/api/voice/tools/book_appointment", ts, '{"a":1}', "s")
        ok, reason = verify(sig, "POST", "/api/voice/tools/book_appointment", ts, '{"a":1}', "s")
        self.assertTrue(ok, reason)

    def test_stale(self):
        ts = str(int(time.time()) - 300)
        sig = sign("POST", "/p", ts, "{}", "s")
        ok, reason = verify(sig, "POST", "/p", ts, "{}", "s")
        self.assertFalse(ok)
        self.assertEqual(reason, "stale")

    def test_tampered_body(self):
        ts = str(int(time.time()))
        sig = sign("POST", "/p", ts, '{"a":1}', "s")
        ok, _ = verify(sig, "POST", "/p", ts, '{"a":2}', "s")
        self.assertFalse(ok)


class FillersTest(unittest.TestCase):
    def test_no_repeat(self):
        first = pick("hu", index=0)
        second = pick("hu", avoid=first, index=0)
        self.assertNotEqual(first, second)
        self.assertTrue(first.startswith("Egy pillanat") or "megnézem" in first)

    def test_english_fallback(self):
        self.assertIn("moment", pick("xx", index=0).lower())


if __name__ == "__main__":
    unittest.main()
