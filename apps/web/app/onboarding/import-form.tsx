"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { DashLang } from "@/lib/dash_lang.ts";

export default function ImportForm({ lang = "hu" }: { lang?: DashLang }) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const en = lang === "en";

  // The crawl + AI extraction takes 30-90s: reassure in stages so the owner
  // knows work is happening instead of staring at a frozen "Reading…".
  function startProgress(): () => void {
    const stages: [number, string][] = [
      [0, en ? "Search starting…" : "Keresés indul…"],
      [3000, en
        ? "Gathering information from your website — this can take up to a minute. Keep this tab open."
        : "Információt gyűjtünk a weboldaladról — ez akár egy percig is eltarthat. Hagyd nyitva ezt a lapot."],
      [25000, en
        ? "Still working — reading your pages and drafting your Q&As…"
        : "Még dolgozunk — olvassuk az oldalaid és készítjük a kérdés-vázlatokat…"],
      [60000, en
        ? "Almost there — larger sites take a little longer…"
        : "Mindjárt kész — a nagyobb oldalak kicsit több időt igényelnek…"],
    ];
    const timers = stages.map(([at, text]) =>
      window.setTimeout(() => setMsg(text), at),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const stopProgress = startProgress();
    try {
      const r = await fetch("/api/import/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      // A timed-out function returns an HTML error page, not JSON — parse
      // defensively so the owner never sees a raw SyntaxError.
      const rawText = await r.text();
      stopProgress();
      let j: {
        ok?: boolean;
        error?: string;
        message?: string;
        name?: string;
        pagesCrawled?: number;
        faqCount?: number;
      } | null = null;
      try {
        j = JSON.parse(rawText);
      } catch {
        j = null;
      }
      if (!r.ok || !j?.ok) {
        setState("err");
        if (j?.error === "facebook-not-supported") {
          setMsg(
            en
              ? "Facebook Pages are not supported — paste the business website URL."
              : "Facebook Oldal nem támogatott — a vállalkozás weboldalának címét illeszd be.",
          );
          return;
        }
        setMsg(
          j?.message ??
            (en
              ? "The import took too long or the site did not respond. Please try again."
              : "Az import túl sokáig tartott, vagy az oldal nem válaszolt. Próbáld újra."),
        );
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
      stopProgress();
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
        disabled={state === "loading"}
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
        <p
          style={{
            width: "100%",
            color: state === "err" ? "#8A2A12" : "#0B5D3F",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          role={state === "loading" ? "status" : undefined}
        >
          {state === "loading" && <Loader2 size={16} className="faq-spin" aria-hidden />}
          {msg}
        </p>
      )}
    </form>
  );
}
