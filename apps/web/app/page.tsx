import type { Metadata } from "next";
import Landing from "./landing";
import { JsonLd } from "./json-ld";
import { siteUrl } from "@/lib/site.ts";

const base = siteUrl();

export const metadata: Metadata = {
  title: "Dial Hanna — Ha nem érsz rá, Hanna felveszi",
  description:
    "Tartsd meg a saját számodat. Hanna magyarul vagy angolul fogadja az átirányított hívásokat, időpontot foglal, és kész teendőt ad át. Magyarország — kisvállalkozások.",
  alternates: {
    canonical: `${base}/`,
    languages: {
      hu: `${base}/`,
      en: `${base}/en`,
      "x-default": `${base}/`,
    },
  },
  openGraph: {
    locale: "hu_HU",
    url: `${base}/`,
    title: "Dial Hanna — Ha nem érsz rá, Hanna felveszi",
    description:
      "MI-alapú híváslefedés magyar kisvállalkozásoknak. Tartsd meg a számodat; Hanna felveszi, amikor te nem tudod.",
  },
};

export default function Home() {
  return (
    <>
      <JsonLd lang="hu" />
      <Landing lang="hu" />
    </>
  );
}
