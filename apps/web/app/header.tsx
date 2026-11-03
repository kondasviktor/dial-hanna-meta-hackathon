"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  UserButton,
  OrganizationSwitcher,
  useAuth,
  useClerk,
} from "@clerk/nextjs";
import { landing, waitlistHref } from "@/i18n/landing.ts";
import { localeHref } from "@/lib/locale_href.ts";

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

function LangSwitch({ en }: { en: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [pathname]);

  const search = searchParams.toString();
  const huHref = localeHref(pathname, "hu", search, hash);
  const enHref = localeHref(pathname, "en", search, hash);

  return (
    <div className="lang-switch" aria-label="language">
      <a href={huHref} className={en ? "" : "on"} hrefLang="hu">
        HU
      </a>
      <a href={enHref} className={en ? "on" : ""} hrefLang="en">
        EN
      </a>
    </div>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const dashEn = searchParams.get("lang")?.toLowerCase() === "en";
  const en =
    pathname === "/en" ||
    pathname.startsWith("/en/") ||
    ((pathname.startsWith("/dashboard") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/create-org") ||
      pathname.startsWith("/waitlist")) &&
      dashEn);
  const d = (en ? landing.en : landing.hu).nav;
  const home = en ? "/en" : "/";
  const waitlist = waitlistHref(en ? "en" : "hu");
  const onDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/create-org");

  const showGuest = !isLoaded || !isSignedIn;
  const dashHref = en ? "/dashboard?lang=en" : "/dashboard";

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
        <LangSwitch en={en} />

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
              <a href={dashHref} className="btn btn-ghost btn-sm">
                dashboard
              </a>
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
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<header className="site-header" />}>
      <HeaderInner />
    </Suspense>
  );
}
