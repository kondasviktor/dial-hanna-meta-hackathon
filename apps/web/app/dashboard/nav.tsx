"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { withDashLang, type DashLang } from "@/lib/dash_lang.ts";

const NAV_HU = [
  { href: "/dashboard", label: "Áttekintés", exact: true },
  { href: "/dashboard/calls", label: "Telefon", exact: false },
  { href: "/dashboard/kb", label: "Tudás", exact: false, badge: true },
];

const NAV_EN = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/calls", label: "Phone", exact: false },
  { href: "/dashboard/kb", label: "Knowledge", exact: false, badge: true },
];

function DashNavInner({
  openGaps,
  orgName,
  orgMeta,
}: {
  openGaps: number | null;
  orgName: string;
  orgMeta: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang: DashLang = searchParams.get("lang")?.toLowerCase() === "en" ? "en" : "hu";
  const nav = lang === "en" ? NAV_EN : NAV_HU;
  const search = searchParams.toString();
  const [hannaOn, setHannaOn] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/hanna/status");
        if (!res.ok) throw new Error("status");
        const data = (await res.json()) as { enabled?: boolean };
        if (!cancelled && typeof data.enabled === "boolean") {
          setHannaOn(data.enabled);
          window.localStorage.setItem("dh_hanna_on", data.enabled ? "1" : "0");
          return;
        }
      } catch {
        /* fall through to localStorage */
      }
      if (cancelled) return;
      const stored = window.localStorage.getItem("dh_hanna_on");
      if (stored === "0") setHannaOn(false);
      if (stored === "1") setHannaOn(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle() {
    const next = !hannaOn;
    setHannaOn(next);
    window.localStorage.setItem("dh_hanna_on", next ? "1" : "0");
    setSaving(true);
    try {
      await fetch("/api/hanna/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
    } catch {
      /* UI still reflects intent; webhooks use last saved DB value */
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="dash-side">
      <div className="dash-org">
        <strong>{orgName}</strong>
        <span>{orgMeta}</span>
      </div>
      <nav aria-label="dashboard">
        {nav.map((n) => {
          const on = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          const href = withDashLang(n.href, lang, search);
          return (
            <Link key={n.href} href={href} className={on ? "dash-link on" : "dash-link"} aria-current={on ? "page" : undefined}>
              {n.label}
              {n.badge && openGaps != null && openGaps > 0 && (
                <span className="dash-count">{openGaps}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="dash-hanna">
        <button
          type="button"
          role="switch"
          aria-checked={hannaOn}
          aria-busy={saving}
          onClick={() => void toggle()}
          className={hannaOn ? "hanna-switch on" : "hanna-switch"}
        >
          <span className="hanna-track" aria-hidden>
            <span className="hanna-knob" />
          </span>
          <span className="hanna-switch-label">
            {lang === "en"
              ? hannaOn
                ? "Hanna is on"
                : "Hanna is paused"
              : hannaOn
                ? "Hanna bekapcsolva"
                : "Hanna kikapcsolva"}
          </span>
        </button>
        <p>
          {lang === "en"
            ? hannaOn
              ? "She answers forwarded calls."
              : "Paused — she will not answer calls."
            : hannaOn
              ? "Átirányított hívásokat ő veszi fel."
              : "Szünet — a hívásokat nem veszi fel."}
        </p>
      </div>
    </aside>
  );
}

export default function DashNav(props: {
  openGaps: number | null;
  orgName: string;
  orgMeta: string;
}) {
  return (
    <Suspense fallback={<aside className="dash-side" />}>
      <DashNavInner {...props} />
    </Suspense>
  );
}
