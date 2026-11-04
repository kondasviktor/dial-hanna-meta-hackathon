"use client";

import { useTransition } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { FollowupStatus } from "@/lib/outcomes.ts";

const DOT: Record<FollowupStatus, string> = {
  open: "#d97706",
  done: "#15803d",
  dismissed: "#dc2626",
};

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
  const label =
    status === "done"
      ? lang === "en"
        ? "Done"
        : "Elvégezve"
      : status === "dismissed"
        ? lang === "en"
          ? "No action"
          : "Nincs teendő"
        : lang === "en"
          ? "Pending"
          : "Nyitott";
  const set = (next: FollowupStatus) => {
    const fd = new FormData();
    fd.set("callId", callId);
    fd.set("status", next);
    start(() => {
      void action(fd);
    });
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          fontWeight: 600,
          color: DOT[status],
        }}
      >
        <span
          aria-hidden
          style={{ width: 8, height: 8, borderRadius: "50%", background: DOT[status] }}
        />
        {label}
      </span>
      {status === "open" ? (
        <>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={pending}
            onClick={() => set("done")}
            title={lang === "en" ? "Mark handled" : "Késznek jelöl"}
          >
            <Check size={14} /> {lang === "en" ? "Done" : "Kész"}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={pending}
            onClick={() => set("dismissed")}
            title={lang === "en" ? "No action needed" : "Nincs teendő"}
          >
            <X size={14} /> {lang === "en" ? "No action" : "Nem kell"}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={pending}
          onClick={() => set("open")}
          title={lang === "en" ? "Reopen" : "Újranyitás"}
        >
          <RotateCcw size={14} /> {lang === "en" ? "Reopen" : "Újranyit"}
        </button>
      )}
    </span>
  );
}
