"use client";

import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, OrganizationSwitcher, SignedIn, SignedOut } from "@clerk/nextjs";
import { landing } from "@/i18n/landing.ts";

export default function Header() {
  const pathname = usePathname();
  const en = pathname === "/en" || pathname.startsWith("/en/");
  const d = (en ? landing.en : landing.hu).nav;
  const home = en ? "/en" : "/";
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href={home}>
          <span className="brand-dot" aria-hidden />
          Dial Hanna
        </a>
        <nav className="site-nav" aria-label="sections">
          <a href={`${home}#how`}>{d.how}</a>
          <a href={`${home}#get`}>{d.get}</a>
          <a href={`${home}#industries`}>{d.industries}</a>
          <a href={`${home}#pricing`}>{d.pricing}</a>
          <a href={`${home}#faq`}>{d.faq}</a>
        </nav>
        <div className="lang-switch" aria-label="language">
          <a href="/" className={en ? "" : "on"}>HU</a>
          <a href="/en" className={en ? "on" : ""}>EN</a>
        </div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="btn btn-ghost btn-sm" type="button">{d.signin}</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-primary btn-sm" type="button">{d.cta}</button>
          </SignUpButton>
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
