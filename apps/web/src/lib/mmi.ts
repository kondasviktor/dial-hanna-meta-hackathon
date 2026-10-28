// Carrier forwarding wizard MMI codes (Master Spec §10.2).
// Patterns are TYPICAL HU mobile codes — VERIFY per Telekom / Yettel / One.
// The wizard fills in the tenant DID and shows activate + deactivate codes.

export type ForwardCondition = "busy" | "no_answer" | "unreachable" | "all_conditional" | "unconditional";
export type Carrier = "telekom" | "yettel" | "one" | "other";

const ACTIVATE: Record<ForwardCondition, (did: string) => string> = {
  busy: (did) => `*67*${did}#`,
  no_answer: (did) => `*61*${did}#`,
  unreachable: (did) => `*62*${did}#`,
  all_conditional: (did) => `*004*${did}#`,
  unconditional: (did) => `*21*${did}#`,
};

const DEACTIVATE: Record<ForwardCondition, string> = {
  busy: "##67#",
  no_answer: "##61#",
  unreachable: "##62#",
  all_conditional: "##004#",
  unconditional: "##21#",
};

export function forwardingCodes(condition: ForwardCondition, did: string, _carrier: Carrier): {
  activate: string;
  deactivate: string;
  verifyPerCarrier: boolean;
} {
  const digits = did.replace(/\D/g, "");
  if (digits.length < 9) throw new Error(`invalid DID: ${did}`);
  return {
    activate: ACTIVATE[condition](`+${digits}`),
    deactivate: DEACTIVATE[condition],
    verifyPerCarrier: true, // per-carrier VERIFY still open (spec §10.2)
  };
}

// Recommended wizard default: forward on busy + no-answer + unreachable.
export const DEFAULT_CONDITIONS: ForwardCondition[] = ["busy", "no_answer", "unreachable"];
