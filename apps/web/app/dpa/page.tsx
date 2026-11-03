import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";
import DpaContent from "@/legal/dpa.tsx";

export const metadata: Metadata = {
  title: "Adatfeldolgozás / Data processing",
  alternates: {
    canonical: `${siteUrl()}/dpa`,
    languages: { hu: `${siteUrl()}/dpa`, en: `${siteUrl()}/en/dpa` },
  },
};

export default DpaContent;
