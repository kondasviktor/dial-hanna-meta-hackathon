"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { landing } from "@/i18n/landing.ts";

function isAppShell(path: string): boolean {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/create-org") ||
    path.startsWith("/waitlist")
  );
}

function SiteFooterInner() {
  const path = usePathname() || "/";
  const searchParams = useSearchParams();
  const en =
    path === "/en" ||
    path.startsWith("/en/") ||
    (isAppShell(path) && searchParams.get("lang")?.toLowerCase() === "en");
  const d = en ? landing.en : landing.hu;
  const privacy = en ? "/en/privacy" : "/privacy";
  const terms = en ? "/en/terms" : "/terms";

  return (
    <footer className="footer site-footer">
      <div className="footer-top">
        <p className="footer-credit muted small">
          <strong className="footer-name">Dial Hanna</strong>
          {" · "}
          {d.footerRights} {d.footerCraftPrefix}
          <a
            href="https://www.vibecoderslife.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-vcl"
          >
            {d.footerCraftLink}
          </a>
        </p>
        <nav className="footer-nav" aria-label={en ? "Footer" : "Lábléc"}>
          <a href={privacy}>{d.privacy}</a>
          <a href={terms}>{d.terms}</a>
          <a href="mailto:hello@dialhanna.com">{d.contact}</a>
          <a href="/api/health">{d.footerStatus}</a>
        </nav>
      </div>
    </footer>
  );
}

/** Same landing footer on every page (including dashboard). */
export default function SiteFooter() {
  return (
    <Suspense
      fallback={
        <footer className="footer site-footer" aria-hidden>
          <div className="footer-top" />
        </footer>
      }
    >
      <SiteFooterInner />
    </Suspense>
  );
}
