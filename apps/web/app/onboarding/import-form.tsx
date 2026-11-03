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
        setMsg(j.error ?? (en ? "error" : "hiba"));
        return;
      }
      setState("ok");
      const src =
        j.source === "facebook"
          ? "Facebook Page"
          : en
            ? "website"
            : "weboldal";
      const pages =
        typeof j.pagesCrawled === "number" && j.pagesCrawled > 0
          ? en
            ? ` · ${j.pagesCrawled} pages`
            : ` · ${j.pagesCrawled} oldal`
          : "";
      const engine =
        j.crawlEngine === "apify-cheerio" || j.crawlEngine === "apify-wcc"
          ? en
            ? " · Apify crawl"
            : " · Apify beolvasás"
          : j.crawlEngine === "local"
            ? en
              ? " · local crawl"
              : " · helyi beolvasás"
            : "";
      setMsg(
        en
          ? `${j.name ?? "Profile"} · ${src}${pages}${engine} · ${j.faqCount ?? 0} draft Q&As`
          : `${j.name ?? "Profil"} · ${src}${pages}${engine} · ${j.faqCount ?? 0} kérdés vázlat`,
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
        placeholder={
          en
            ? "https://example-salon.com or https://facebook.com/example.salon"
            : "https://pelda-szalon.hu vagy https://facebook.com/pelda.szalon"
        }
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
