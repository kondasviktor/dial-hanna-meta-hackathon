"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DashLang } from "@/lib/dash_lang.ts";

export default function ImportForm({ lang = "hu" }: { lang?: DashLang }) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const en = lang === "en";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setMsg("");
    try {
      const r = await fetch("/api/import/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setState("err");
        if (j.error === "facebook-not-supported") {
          setMsg(
            en
              ? "Facebook Pages are not supported — paste the business website URL."
              : "Facebook Oldal nem támogatott — a vállalkozás weboldalának címét illeszd be.",
          );
          return;
        }
        setMsg(j.message ?? j.error ?? (en ? "error" : "hiba"));
        return;
      }
      setState("ok");
      const pages =
        typeof j.pagesCrawled === "number" && j.pagesCrawled > 0
          ? en
            ? ` · ${j.pagesCrawled} pages`
            : ` · ${j.pagesCrawled} oldal`
          : "";
      setMsg(
        en
          ? `${j.name ?? "Profile"} · website${pages} · ${j.faqCount ?? 0} draft Q&As`
          : `${j.name ?? "Profil"} · weboldal${pages} · ${j.faqCount ?? 0} kérdés vázlat`,
      );
      router.refresh();
    } catch (err) {
      setState("err");
      setMsg(String(err));
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
      <input
        type="url"
        required
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={en ? "https://example-salon.com" : "https://pelda-szalon.hu"}
        style={{ flex: 1, minWidth: 220, border: "1px solid #D8DDD6", borderRadius: 8, padding: "10px 12px", font: "inherit" }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="btn btn-primary btn-sm"
      >
        {state === "loading"
          ? en
            ? "Reading…"
            : "Olvasás…"
          : en
            ? "Analyze"
            : "Elemzés"}
      </button>
      {msg && (
        <p style={{ width: "100%", color: state === "err" ? "#8A2A12" : "#0B5D3F", margin: 0 }}>
          {msg}
        </p>
      )}
    </form>
  );
}
