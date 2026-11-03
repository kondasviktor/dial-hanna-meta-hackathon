import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";
import PrivacyContent from "@/legal/privacy.tsx";

export const metadata: Metadata = {
  title: "Adatvédelem / Privacy",
  alternates: {
    canonical: `${siteUrl()}/privacy`,
    languages: { hu: `${siteUrl()}/privacy`, en: `${siteUrl()}/en/privacy` },
  },
};

export default PrivacyContent;
