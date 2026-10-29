import type { Metadata } from "next";
import Landing from "../landing";
import { JsonLd } from "../json-ld";
import { siteUrl } from "@/lib/site.ts";

const base = siteUrl();

export const metadata: Metadata = {
  title: "Dial Hanna — When you can't pick up, Hanna answers",
  description:
    "Keep your own number. Hanna answers forwarded calls in Hungarian or English, books appointments, and hands you a ready to-do. Built for Hungarian SMBs.",
  alternates: {
    canonical: `${base}/en`,
    languages: {
      hu: `${base}/`,
      en: `${base}/en`,
      "x-default": `${base}/`,
    },
  },
  openGraph: {
    locale: "en_US",
    url: `${base}/en`,
    title: "Dial Hanna — When you can't pick up, Hanna answers",
    description:
      "AI call coverage for Hungarian small businesses. Keep your number; Hanna answers when you can't.",
  },
};

export default function EnglishHome() {
  return (
    <>
      <JsonLd lang="en" />
      <Landing lang="en" />
    </>
  );
}
