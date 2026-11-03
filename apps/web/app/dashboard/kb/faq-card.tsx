"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, CircleDashed, Loader2, Pencil, Trash2, X } from "lucide-react";
import type { DashLang } from "@/lib/dash_lang.ts";

export type FaqRow = {
  id: string;
  qHu: string;
  aHu: string;
  qEn: string | null;
  aEn: string | null;
  status: string;
  origin: string;
};

type Busy = "save" | "approve" | "reject" | "delete" | null;

export default function FaqCard({
  faq,
  lang,
  onApprove,
  onReject,
  onDelete,
  onSave,
}: {
  faq: FaqRow;
  lang: DashLang;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSave: (id: string, q: string, a: string, lang: DashLang) => Promise<void>;
}) {
  const en = lang === "en";
  const [editing, setEditing] = useState(false);
  const displayQ = en ? faq.qEn || faq.qHu : faq.qHu;
  const displayA = en ? faq.aEn || faq.aHu : faq.aHu;
  const [q, setQ] = useState(displayQ);
  const [a, setA] = useState(displayA);
  const [busy, setBusy] = useState<Busy>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQ(displayQ);
    setA(displayA);
  }, [displayQ, displayA]);

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 2200);
    return () => window.clearTimeout(t);
  }, [flash]);

  const originLabel =
    faq.origin === "import"
      ? "Import"
      : faq.origin === "gap"
        ? en
          ? "Gap"
          : "Pótlás"
        : en
          ? "Manual"
          : "Kézi";

  const statusIcon =
    faq.status === "approved" ? (
      <Check size={18} strokeWidth={2.5} style={{ color: "#0B5D3F" }} aria-label={en ? "Approved" : "Jóváhagyva"} />
    ) : faq.status === "rejected" ? (
      <X size={18} strokeWidth={2.5} style={{ color: "#8A2A12" }} aria-label={en ? "Rejected" : "Elvetve"} />
    ) : (
      <CircleDashed size={18} strokeWidth={2.25} style={{ color: "#1B6CA8" }} aria-label={en ? "Draft" : "Vázlat"} />
    );

  function keepInView() {
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function run(kind: Busy, fn: () => Promise<void>, okMsg: string) {
    setBusy(kind);
    start(() => {
      void (async () => {
        try {
          await fn();
          setFlash(okMsg);
          keepInView();
        } finally {
          setBusy(null);
        }
      })();
    });
  }

  const locked = pending || busy != null;

  return (
    <div
      ref={cardRef}
      id={`faq-${faq.id}`}
      className={`dash-card faq-card${busy ? " faq-card-busy" : ""}${flash ? " faq-card-ok" : ""}`}
      style={{ marginBottom: 12 }}
    >
      <div className="faq-card-head">
        <span className="faq-status" title={originLabel}>
          {statusIcon}
          <span className="muted small">{originLabel}</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {flash && <span className="faq-flash">{flash}</span>}
          <button
            type="button"
            className="faq-icon-btn"
            disabled={locked}
            onClick={() =>
              run("delete", () => onDelete(faq.id), en ? "Deleted" : "Törölve")
            }
            aria-label={en ? "Delete" : "Törlés"}
            title={en ? "Delete" : "Törlés"}
          >
            {busy === "delete" ? <Loader2 size={16} className="faq-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={field}
            disabled={locked}
            aria-label={en ? "Question" : "Kérdés"}
          />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={4}
            style={field}
            disabled={locked}
            aria-label={en ? "Answer" : "Válasz"}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={locked || !q.trim() || !a.trim()}
              onClick={() =>
                run(
                  "save",
                  async () => {
                    await onSave(faq.id, q.trim(), a.trim(), lang);
                    setEditing(false);
                  },
                  en ? "Saved" : "Mentve",
                )
              }
            >
              {busy === "save" ? (
                <>
                  <Loader2 size={14} className="faq-spin" style={{ marginRight: 6, verticalAlign: "-2px" }} />
                  {en ? "Saving…" : "Mentés…"}
                </>
              ) : en ? (
                "Save"
              ) : (
                "Mentés"
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={locked}
              onClick={() => {
                setQ(displayQ);
                setA(displayA);
                setEditing(false);
              }}
            >
              {en ? "Cancel" : "Mégse"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <p>
            <strong>{displayQ}</strong>
          </p>
          <p>{displayA}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {faq.status === "draft" && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={locked}
                  onClick={() =>
                    run("approve", () => onApprove(faq.id), en ? "Approved" : "Jóváhagyva")
                  }
                >
                  {busy === "approve" ? (
                    <>
                      <Loader2 size={14} className="faq-spin" style={{ marginRight: 6, verticalAlign: "-2px" }} />
                      {en ? "Approving…" : "Jóváhagyás…"}
                    </>
                  ) : en ? (
                    "Approve"
                  ) : (
                    "Jóváhagy"
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={locked}
                  onClick={() =>
                    run("reject", () => onReject(faq.id), en ? "Rejected" : "Elvetve")
                  }
                >
                  {busy === "reject" ? (
                    <>
                      <Loader2 size={14} className="faq-spin" style={{ marginRight: 6, verticalAlign: "-2px" }} />
                      {en ? "Rejecting…" : "Elvetés…"}
                    </>
                  ) : en ? (
                    "Reject"
                  ) : (
                    "Elvet"
                  )}
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={locked}
              onClick={() => {
                setQ(displayQ);
                setA(displayA);
                setEditing(true);
                keepInView();
              }}
            >
              <Pencil size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
              {en ? "Edit" : "Módosítás"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const field = {
  border: "1px solid #D8DDD6",
  borderRadius: 8,
  padding: "10px 12px",
  font: "inherit",
  width: "100%",
  boxSizing: "border-box" as const,
};
