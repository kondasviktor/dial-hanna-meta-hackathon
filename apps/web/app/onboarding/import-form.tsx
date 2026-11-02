"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportForm() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

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
        setMsg(j.error ?? "hiba");
        return;
      }
      setState("ok");
      const src = j.source === "facebook" ? "Facebook Page" : "weboldal";
      setMsg(`${j.name ?? "Profil"} · ${src} · ${j.faqCount ?? 5} kérdés vázlat`);
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
        placeholder="https://pelda-szalon.hu vagy https://facebook.com/pelda.szalon"
        style={{ flex: 1, minWidth: 220, border: "1px solid #D8DDD6", borderRadius: 8, padding: "10px 12px", font: "inherit" }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{ background: "#0C1C20", color: "#fff", border: 0, borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}
      >
        {state === "loading" ? "Olvasás…" : "Elemzés"}
      </button>
      {msg && <p style={{ width: "100%", color: state === "err" ? "#8A2A12" : "#0B5D3F", margin: 0 }}>{msg}</p>}
    </form>
  );
}
