import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import { Suspense } from "react";
import Header from "./header";
import { SITE, siteUrl } from "@/lib/site.ts";
import "./globals.css";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const lang = h.get("x-page-lang") === "en" ? "en" : "hu";
  return (
    <ClerkProvider>
      <html lang={lang}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <Suspense>
            <Header />
          </Suspense>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
