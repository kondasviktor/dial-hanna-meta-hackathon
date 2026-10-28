"""LLM tool-call loop helpers (Master Spec §6.4/§6.7).

- Max ~120 tokens per turn; tools declared per tenant agent version.
- Booking tools run ONE AT A TIME (no parallel booking calls): if the model
  requests several tool calls and any is booking-family, the booking call runs
  first and alone, the rest follow on the next turn.
- A filler must precede every tool call (caller hears it via TTS first).
"""
import json

BOOKING_TOOLS = ("book_appointment", "reschedule_appointment", "cancel_appointment")
MAX_OUTPUT_TOKENS = 120


def chat_request(system_prompt, history, tools, model="muse-spark-1.3"):
    """Build the chat-completions body for the live turn."""
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    body = {"model": model, "messages": messages,
            "max_tokens": 500,  # reasoning eats budget (see DEVIATIONS.md #4)
            "stream": True, "reasoning_effort": "minimal"}
    if tools:
        body["tools"] = tools
    return body


def order_tool_calls(tool_calls):
    """Split requested calls into sequential steps. Booking-family first, alone."""
    names = [tc.get("function", {}).get("name", "") for tc in tool_calls]
    booking = [tc for tc in tool_calls
               if tc.get("function", {}).get("name", "") in BOOKING_TOOLS]
    others = [tc for tc in tool_calls
              if tc.get("function", {}).get("name", "") not in BOOKING_TOOLS]
    steps = []
    steps.extend([[b] for b in booking])  # one at a time
    if others:
        steps.append(others)
    return steps


def parse_args(raw):
    """Tool args must be valid JSON; garbage → caller re-asks, never a blind call."""
    try:
        args = json.loads(raw or "{}")
    except ValueError:
        return None, "bad-json-args"
    if not isinstance(args, dict):
        return None, "args-not-object"
    return args, None
