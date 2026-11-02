"use client";

import { usePathname } from "next/navigation";
import { SignInButton, UserButton, OrganizationSwitcher, SignedIn, SignedOut } from "@clerk/nextjs";
import { landing, waitlistHref } from "@/i18n/landing.ts";
import { localeHref } from "@/lib/locale_href.ts";

export default function Header() {
  const pathname = usePathname();
  const en = pathname === "/en" || pathname.startsWith("/en/");
  const d = (en ? landing.en : landing.hu).nav;
  const home = en ? "/en" : "/";
  const onDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/create-org");

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href={home}>
          <span className="brand-dot" aria-hidden />
          Dial Hanna
        </a>
        {!onDashboard && (
          <nav className="site-nav" aria-label="sections">
            <a href={`${home}#how`}>{d.how}</a>
            <a href={`${home}#get`}>{d.get}</a>
            <a href={`${home}#industries`}>{d.industries}</a>
            <a href={`${home}#pricing`}>{d.pricing}</a>
            <a href={`${home}#faq`}>{d.faq}</a>
          </nav>
        )}
        <div className="lang-switch" aria-label="language">
          <a href={localeHref(pathname, "hu")} className={en ? "" : "on"}>HU</a>
          <a href={localeHref(pathname, "en")} className={en ? "on" : ""} title={onDashboard ? "Dashboard is Hungarian for the hackathon" : undefined}>EN</a>
        </div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-ghost btn-sm" type="button">{d.signin}</button>
          </SignInButton>
          <a className="btn btn-primary btn-sm" href={waitlistHref(en ? "en" : "hu")}>
            {d.cta}
          </a>
        </SignedOut>
        <SignedIn>
          <a href="/dashboard" className="btn btn-ghost btn-sm">dashboard</a>
          <OrganizationSwitcher />
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
