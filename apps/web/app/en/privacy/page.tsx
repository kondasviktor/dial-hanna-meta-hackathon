import type { Metadata } from "next";
import { siteUrl } from "@/lib/site.ts";
import PrivacyContent from "@/legal/privacy.tsx";

export const metadata: Metadata = {
  title: "Privacy / Adatvédelem",
  alternates: {
    canonical: `${siteUrl()}/en/privacy`,
    languages: { hu: `${siteUrl()}/privacy`, en: `${siteUrl()}/en/privacy` },
  },
};

export default PrivacyContent;
