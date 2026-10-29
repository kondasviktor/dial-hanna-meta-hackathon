// Website → Muse Wonder profile extraction (optional URL; manual FAQ fallback).

import { chat, MODELS } from "./meta.ts";

export interface ExtractedProfile {
  business: {
    name?: string;
    website?: string;
    address?: string;
    phone?: string;
    hours?: { weekday: number; open: string; close: string }[];
    services?: { id: string; name: string; price_text?: string; duration_min?: number }[];
    policies?: Record<string, string>;
  };
  faqs: { q_hu: string; a_hu: string; q_en?: string; a_en?: string }[];
  items_meta: { path: string; kind: "fact" | "inference"; evidence?: string }[];
  missing_required: string[];
  keywords?: string[];
}

const SYSTEM = `You extract a Hungarian small-business profile for an AI phone assistant.
Return ONLY JSON matching: { business: { name, website, address, phone, hours:[{weekday,open,close}], services:[{id,name,price_text,duration_min}], policies:{} }, faqs:[{q_hu,a_hu,q_en,a_en}], items_meta:[{path,kind,evidence}], missing_required:[], keywords:[] }.
kind is "fact" if clearly on the page, "inference" if guessed. Prefer Hungarian q_hu/a_hu. Never invent prices as facts.`;

export async function extractFromHtml(url: string, html: string): Promise<ExtractedProfile> {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 24_000);
  const raw = await chat({
    model: MODELS.extract,
    reasoningEffort: "high",
    maxTokens: 800,
    json: true,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `URL: ${url}\n\nPAGE TEXT:\n${text}` },
    ],
  });
  const parsed = JSON.parse(raw) as ExtractedProfile;
  if (!parsed.business) parsed.business = {};
  if (!Array.isArray(parsed.faqs)) parsed.faqs = [];
  if (!Array.isArray(parsed.items_meta)) parsed.items_meta = [];
  if (!Array.isArray(parsed.missing_required)) parsed.missing_required = [];
  parsed.business.website = parsed.business.website ?? url;
  return parsed;
}

export async function fetchWebsiteText(url: string): Promise<string> {
  const u = new URL(url);
  if (!["http:", "https:"].includes(u.protocol)) throw new Error("bad-url");
  const r = await fetch(u.toString(), {
    headers: { "User-Agent": "DialHannaBot/0.1 (+https://dialhanna.com)" },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`fetch-${r.status}`);
  return await r.text();
}
