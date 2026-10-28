import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";
import Header from "./header";

export const metadata: Metadata = {
  title: "Dial Hanna — AI call coverage for Hungarian SMBs",
  description: "Never miss a customer call again. Hanna answers when you can't.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="hu">
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
