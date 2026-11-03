import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import Header from "./header";
import SiteFooter from "./site-footer";
import { SITE, siteUrl } from "@/lib/site.ts";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const base = siteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c1c20",
};

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "Dial Hanna — AI call coverage for Hungarian SMBs",
    template: "%s · Dial Hanna",
  },
  description:
    "Never miss a customer call again. Hanna answers when you can't — in Hungarian and English.",
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: base }],
  creator: SITE.name,
  keywords: [
    "AI call coverage",
    "Hungary",
    "Budapest",
    "small business",
    "call forwarding",
    "Hungarian",
    "Dial Hanna",
    "AI phone assistant",
    "SMB",
  ],
  alternates: {
    canonical: "/",
    languages: {
      hu: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.localeDefault,
    alternateLocale: [SITE.localeEn],
    url: base,
    title: "Dial Hanna — When you can't pick up, Hanna answers",
    description:
      "Keep your number. Hanna answers forwarded calls for Hungarian small businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dial Hanna",
    description:
      "AI call coverage for Hungarian SMBs. Keep your number; Hanna answers when you can't.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: "business",
  other: {
    "geo.region": SITE.geo.region,
    "geo.placename": SITE.geo.placename,
    "geo.position": SITE.geo.position,
    ICBM: "47.4979, 19.0402",
  },
};

function HeaderFallback() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand" href="/">
          <span className="brand-dot" aria-hidden />
          Dial Hanna
        </a>
        <div className="lang-switch" aria-label="language">
          <a href="/" className="on">HU</a>
          <a href="/en">EN</a>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" type="button" disabled>
            Belépés
          </button>
          <a className="btn btn-primary btn-sm" href="/waitlist">
            Várólista
          </a>
        </div>
      </div>
    </header>
  );
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const lang = h.get("x-page-lang") === "en" ? "en" : "hu";
  return (
    <ClerkProvider>
      <html lang={lang} className={`${bricolage.variable} ${instrument.variable} ${jetbrains.variable}`}>
        <head>
          <link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt" />
        </head>
        <body>
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          <main>{children}</main>
          <SiteFooter lang={lang} />
        </body>
      </html>
    </ClerkProvider>
  );
}
