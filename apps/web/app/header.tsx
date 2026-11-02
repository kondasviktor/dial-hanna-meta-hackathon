"use client";

import { usePathname } from "next/navigation";
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

export default function Header() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const en = pathname === "/en" || pathname.startsWith("/en/");
  const d = (en ? landing.en : landing.hu).nav;
  const home = en ? "/en" : "/";
  const waitlist = waitlistHref(en ? "en" : "hu");
  const onDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/create-org");

  // Show guest buttons until we *know* the user is signed in (no empty Clerk slot).
  const showGuest = !isLoaded || !isSignedIn;

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
          <a
            href={localeHref(pathname, "en")}
            className={en ? "on" : ""}
            title={onDashboard ? "Dashboard is Hungarian for the hackathon" : undefined}
          >
            EN
          </a>
        </div>

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
              <a href="/dashboard" className="btn btn-ghost btn-sm">dashboard</a>
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
