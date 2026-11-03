"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  UserButton,
  OrganizationSwitcher,
  useAuth,
  useClerk,
} from "@clerk/nextjs";
import { landing, waitlistHref } from "@/i18n/landing.ts";
import { withDashLang } from "@/lib/dash_lang.ts";
import { localeHref } from "@/lib/locale_href.ts";

const APP_SHELL = ["/dashboard", "/onboarding", "/create-org", "/waitlist"] as const;

function isAppShell(pathname: string): boolean {
  return APP_SHELL.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function marketingEn(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

/** Guest CTAs are plain HTML — never wrapped in Clerk gates (avoids load flash). */
function GuestActions({
  signinLabel,
  ctaLabel,
  waitlist,
  onSignIn,
}: {
  signinLabel: string;
  ctaLabel: string;
  waitlist: string;
  onSignIn: () => void;
}) {
  return (
    <>
      <button className="btn btn-ghost btn-sm" type="button" onClick={onSignIn}>
        {signinLabel}
      </button>
      <a className="btn btn-primary btn-sm" href={waitlist}>
        {ctaLabel}
      </a>
    </>
  );
}

function LangSwitchInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [pathname]);

  const search = searchParams.toString();
  const shell = isAppShell(pathname);
  const en = shell
    ? searchParams.get("lang")?.toLowerCase() === "en"
    : marketingEn(pathname);

  const huHref = localeHref(pathname, "hu", search, hash);
  const enHref = localeHref(pathname, "en", search, hash);

  function go(target: "hu" | "en", href: string, e: React.MouseEvent) {
    e.preventDefault();
    if (shell) {
      // Soft query update — keeps header / Clerk org mounted (no Suspense remount).
      router.replace(withDashLang(pathname, target, search), { scroll: false });
      return;
    }
    router.push(href);
  }

  return (
    <div className="lang-switch" aria-label="language">
      <a
        href={huHref}
        className={en ? "" : "on"}
        hrefLang="hu"
        onClick={(e) => go("hu", huHref, e)}
      >
        HU
      </a>
      <a
        href={enHref}
        className={en ? "on" : ""}
        hrefLang="en"
        onClick={(e) => go("en", enHref, e)}
      >
        EN
      </a>
    </div>
  );
}

function LangSwitchFallback() {
  return (
    <div className="lang-switch" aria-label="language">
      <span className="on">HU</span>
      <span>EN</span>
    </div>
  );
}

function MarketingNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const en = isAppShell(pathname)
    ? searchParams.get("lang")?.toLowerCase() === "en"
    : marketingEn(pathname);
  const d = (en ? landing.en : landing.hu).nav;
  // On dashboard the section nav is hidden by parent; this only renders off-dashboard.
  const base = marketingEn(pathname) ? "/en" : "/";
  return (
    <nav className="site-nav" aria-label="sections">
      <a href={`${base}#how`}>{d.how}</a>
      <a href={`${base}#get`}>{d.get}</a>
      <a href={`${base}#industries`}>{d.industries}</a>
      <a href={`${base}#pricing`}>{d.pricing}</a>
      <a href={`${base}#faq`}>{d.faq}</a>
    </nav>
  );
}

function HeaderActions() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  // Pathname-only for auth chrome — never useSearchParams here (avoids remounting Clerk).
  const en = marketingEn(pathname);
  const d = (en ? landing.en : landing.hu).nav;
  const waitlist = waitlistHref(en ? "en" : "hu");
  const showGuest = !isLoaded || !isSignedIn;
  const dashHref = en ? "/dashboard?lang=en" : "/dashboard";

  return (
    <div className="header-actions">
      {showGuest ? (
        <GuestActions
          signinLabel={d.signin}
          ctaLabel={d.cta}
          waitlist={waitlist}
          onSignIn={() => openSignIn({})}
        />
      ) : (
        <>
          <Link href={dashHref} className="btn btn-ghost btn-sm" prefetch>
            dashboard
          </Link>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "header-org",
                organizationSwitcherTrigger: "header-org-trigger",
              },
            }}
          />
          <UserButton />
        </>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const onDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/create-org");
  const home = marketingEn(pathname) ? "/en" : "/";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href={home}>
          <span className="brand-dot" aria-hidden />
          Dial Hanna
        </a>
        {!onDashboard && (
          <Suspense fallback={<nav className="site-nav" aria-hidden />}>
            <MarketingNav />
          </Suspense>
        )}
        <Suspense fallback={<LangSwitchFallback />}>
          <LangSwitchInner />
        </Suspense>
        <HeaderActions />
      </div>
    </header>
  );
}
