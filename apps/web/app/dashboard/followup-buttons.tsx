"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import type { FollowupStatus } from "@/lib/outcomes.ts";

/**
 * Two icon-only actions, top-right of the follow-up tile.
 * Filled icon = current state; clicking the other one sets it,
 * clicking the filled one reopens. No text labels.
 */
export default function FollowupButtons({
  callId,
  status,
  lang,
  action,
}: {
  callId: string;
  status: FollowupStatus;
  lang: "hu" | "en";
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, start] = useTransition();
  const t =
    lang === "en"
      ? { done: "Mark handled", noAction: "No action needed", reopen: "Reopen" }
      : { done: "Késznek jelöl", noAction: "Nincs teendő", reopen: "Újranyit" };
  const set = (next: FollowupStatus) => {
    const fd = new FormData();
    fd.set("callId", callId);
    fd.set("status", next);
    start(() => {
      void action(fd);
    });
  };
  const doneOn = status === "done";
  const noOn = status === "dismissed";
  return (
    <span className="followup-ctl">
      <button
        type="button"
        className={`icon-btn icon-btn-done${doneOn ? " on" : ""}`}
        disabled={pending}
        title={doneOn ? t.reopen : t.done}
        aria-label={doneOn ? t.reopen : t.done}
        onClick={() => set(doneOn ? "open" : "done")}
      >
        <Check size={15} />
      </button>
      <button
        type="button"
        className={`icon-btn icon-btn-no${noOn ? " on" : ""}`}
        disabled={pending}
        title={noOn ? t.reopen : t.noAction}
        aria-label={noOn ? t.reopen : t.noAction}
        onClick={() => set(noOn ? "open" : "dismissed")}
      >
        <X size={15} />
      </button>
    </span>
  );
}
