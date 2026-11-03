import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";
import DpaContent from "@/legal/dpa.tsx";

export const metadata: Metadata = {
  title: "Data processing / Adatfeldolgozás",
  alternates: {
    canonical: `${siteUrl()}/en/dpa`,
    languages: { hu: `${siteUrl()}/dpa`, en: `${siteUrl()}/en/dpa` },
  },
};

export default DpaContent;
