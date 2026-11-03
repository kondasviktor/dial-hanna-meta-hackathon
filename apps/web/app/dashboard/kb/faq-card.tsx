"use client";

import { useState, useTransition } from "react";
import { Check, CircleDashed, Pencil, Trash2, X } from "lucide-react";
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
  onSave: (id: string, q: string, a: string) => Promise<void>;
}) {
  const en = lang === "en";
  const [editing, setEditing] = useState(false);
  const displayQ = en ? faq.qEn || faq.qHu : faq.qHu;
  const displayA = en ? faq.aEn || faq.aHu : faq.aHu;
  const [q, setQ] = useState(displayQ);
  const [a, setA] = useState(displayA);
  const [pending, start] = useTransition();

  const originLabel =
    faq.origin === "import"
      ? en
        ? "Import"
        : "Import"
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

  function run(fn: () => Promise<void>) {
    start(() => {
      void fn();
    });
  }

  return (
    <div className="dash-card faq-card" style={{ marginBottom: 12 }}>
      <div className="faq-card-head">
        <span className="faq-status" title={originLabel}>
          {statusIcon}
          <span className="muted small">{originLabel}</span>
        </span>
        <button
          type="button"
          className="faq-icon-btn"
          disabled={pending}
          onClick={() => run(() => onDelete(faq.id))}
          aria-label={en ? "Delete" : "Törlés"}
          title={en ? "Delete" : "Törlés"}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {editing ? (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={field}
            aria-label={en ? "Question" : "Kérdés"}
          />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={4}
            style={field}
            aria-label={en ? "Answer" : "Válasz"}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={pending || !q.trim() || !a.trim()}
              onClick={() =>
                run(async () => {
                  await onSave(faq.id, q.trim(), a.trim());
                  setEditing(false);
                })
              }
            >
              {en ? "Save" : "Mentés"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pending}
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
                  disabled={pending}
                  onClick={() => run(() => onApprove(faq.id))}
                >
                  {en ? "Approve" : "Jóváhagy"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={pending}
                  onClick={() => run(() => onReject(faq.id))}
                >
                  {en ? "Reject" : "Elvet"}
                </button>
              </>
            )}
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={pending}
              onClick={() => {
                setQ(displayQ);
                setA(displayA);
                setEditing(true);
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
