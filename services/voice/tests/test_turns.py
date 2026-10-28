import unittest

from src.turnstate import step, LISTENING, THINKING, SPEAKING, TOOL_WAIT, CLOSING
from src.toolloop import chat_request, order_tool_calls, parse_args


class TurnStateTest(unittest.TestCase):
    def test_speech_end_triggers_llm(self):
        state, actions = step(LISTENING, "speech_end")
        self.assertEqual((state, actions), (THINKING, ["call_llm"]))

    def test_barge_in_stops_tts(self):
        state, actions = step(SPEAKING, "barge_in")
        self.assertEqual(state, LISTENING)
        self.assertIn("stop_tts", actions)

    def test_tool_call_gets_filler_first(self):
        state, actions = step(THINKING, "agent_done", {"tool_calls": ["get_business_hours"]})
        self.assertEqual(state, TOOL_WAIT)
        self.assertEqual(actions[0], "speak_filler")

    def test_tool_result_returns_to_llm(self):
        self.assertEqual(step(TOOL_WAIT, "tool_result"), (THINKING, ["call_llm"]))

    def test_tool_error_recovers_via_callback(self):
        state, actions = step(TOOL_WAIT, "tool_error")
        self.assertEqual((state, actions), (THINKING, ["call_llm"]))

    def test_error_falls_back_never_silent(self):
        for s in (LISTENING, SPEAKING):
            _, actions = step(s, "error")
            self.assertIn("fallback_script", actions)

    def test_hangup_always_closes(self):
        for s in (LISTENING, THINKING, SPEAKING, TOOL_WAIT):
            self.assertEqual(step(s, "hangup"), (CLOSING, ["end_call"]))


class ToolLoopTest(unittest.TestCase):
    def test_booking_runs_alone_first(self):
        calls = [{"function": {"name": "get_business_hours", "arguments": "{}"}},
                 {"function": {"name": "book_appointment", "arguments": "{}"}}]
        steps = order_tool_calls(calls)
        self.assertEqual(len(steps), 2)
        self.assertEqual(steps[0][0]["function"]["name"], "book_appointment")

    def test_non_booking_batch_together(self):
        calls = [{"function": {"name": "get_business_hours", "arguments": "{}"}}]
        self.assertEqual(len(order_tool_calls(calls)), 1)

    def test_bad_args_rejected(self):
        args, err = parse_args("{not json")
        self.assertIsNone(args)
        self.assertEqual(err, "bad-json-args")

    def test_chat_body_minimal_reasoning(self):
        body = chat_request("sys", [{"role": "user", "content": "hi"}], [])
        self.assertEqual(body["reasoning_effort"], "minimal")
        self.assertTrue(body["stream"])
        self.assertGreaterEqual(body["max_tokens"], 500)


if __name__ == "__main__":
    unittest.main()
