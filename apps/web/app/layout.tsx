import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Header from "./header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dial Hanna — AI call coverage for Hungarian SMBs",
  description: "Never miss a customer call again. Hanna answers when you can't.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="hu">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=JetBrains+Mono:wght@400;500&display=swap"
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
