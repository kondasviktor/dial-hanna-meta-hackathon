"""Turn-taking state machine (Master Spec §6.4). Pure logic, no audio.

Meta server endpointing (speechStart/partials/speechEnd/speechComplete)
drives "user finished". Local VAD drives barge-in: caller speaks while Hanna
talks → stop TTS (~200 ms budget). States and events are plain data so the
Pipecat pipeline and tests share this module.
"""

LISTENING, THINKING, SPEAKING, TOOL_WAIT, CLOSING = (
    "listening", "thinking", "speaking", "tool_wait", "closing")

EVENTS = ("partial", "final", "speech_end", "barge_in", "agent_done",
          "tool_result", "tool_error", "error", "hangup", "time_limit")

# Actions the pipeline must execute in order.
STOP_TTS = "stop_tts"       # barge-in: halt TTS immediately
LLM = "call_llm"            # user finished → stream Spark
FILLER = "speak_filler"     # before a tool call, never dead air
TOOL = "call_tool"          # run named voice tool
FALLBACK = "fallback_script"  # STT/LLM/TTS error → name+number script
END = "end_call"


def step(state, event, payload=None):
    """(state, event) -> (new_state, [actions]). payload carries e.g. tool name."""
    payload = payload or {}
    if event == "hangup":
        return CLOSING, [END]
    if event == "time_limit":
        return CLOSING, [END]
    if state == LISTENING:
        if event == "barge_in":
            return LISTENING, []  # nobody to interrupt; keep listening
        if event == "speech_end":
            return THINKING, [LLM]
        if event == "error":
            return SPEAKING, [FALLBACK]
        return LISTENING, []
    if state == THINKING:
        if event == "barge_in":
            return LISTENING, []  # caller restarted; drop pending reply
        if event == "agent_done":
            if payload.get("tool_calls"):
                return TOOL_WAIT, [FILLER, TOOL]
            return SPEAKING, []
        if event in ("error", "tool_error"):
            return SPEAKING, [FALLBACK]
        return THINKING, []
    if state == SPEAKING:
        if event == "barge_in":
            return LISTENING, [STOP_TTS]
        if event == "agent_done":
            return LISTENING, []
        if event == "error":
            return SPEAKING, [FALLBACK]
        return SPEAKING, []
    if state == TOOL_WAIT:
        if event == "tool_result":
            return THINKING, [LLM]
        if event in ("tool_error", "error"):
            # Calendar/tool failure → callback offer, never a silent hang.
            return THINKING, [LLM]
        if event == "barge_in":
            return LISTENING, [STOP_TTS]
        return TOOL_WAIT, []
    return state, []
