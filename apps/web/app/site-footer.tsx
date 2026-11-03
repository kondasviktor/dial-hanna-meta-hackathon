"use client";

import { usePathname } from "next/navigation";

/** Compact legal footer for non-landing routes. Landing has its own footer. */
export default function SiteFooter({ lang }: { lang: "hu" | "en" }) {
  const path = usePathname() || "/";
  if (path === "/" || path === "/en") return null;

  const en = lang === "en" || path.startsWith("/en");
  return (
    <footer className="site-legal-footer">
      <nav aria-label={en ? "Legal" : "Jogi"}>
        <a href={en ? "/en/privacy" : "/privacy"}>{en ? "Privacy" : "Adatvédelem"}</a>
        <a href={en ? "/en/terms" : "/terms"}>{en ? "Terms" : "ÁSZF"}</a>
        <a href={en ? "/en/dpa" : "/dpa"}>{en ? "Data processing" : "Adatfeldolgozás"}</a>
        <a href="mailto:hello@dialhanna.com">{en ? "Contact" : "Kapcsolat"}</a>
      </nav>
    </footer>
  );
}
