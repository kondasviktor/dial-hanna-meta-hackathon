"""Filler phrases spoken before tool calls so there is never dead air
(Master Spec §6.4). No-repeat picker. Stdlib only."""

FILLERS = {
    "hu": [
        "Egy pillanat, megnézem.",
        "Kérem, várjon egy pillanatot, mindjárt megnézem.",
        "Azonnal utánanézek.",
    ],
    "en": [
        "One moment, let me check.",
        "Let me look that up for you.",
    ],
}


def pick(lang, avoid=None, index=0):
    options = FILLERS.get(lang, FILLERS["en"])
    choices = [f for f in options if f != avoid] or options
    return choices[index % len(choices)]
