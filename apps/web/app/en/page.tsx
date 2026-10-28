import type { Metadata } from "next";
import Landing from "../landing";
import { landing } from "@/i18n/landing.ts";

export const metadata: Metadata = {
  title: "Dial Hanna — When you can't pick up, Hanna answers",
  description:
    "Keep your own number. Hanna answers forwarded calls in Hungarian or English, books appointments, and hands you a ready to-do.",
};

export default function EnglishHome() {
  return <Landing d={landing.en} lang="en" />;
}
