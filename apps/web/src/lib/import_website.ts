// Website or Facebook Page → Muse Wonder profile extraction (always 5 FAQs).

import { chat, MODELS } from "./meta.ts";
import {
  detectImportKind,
  fetchFacebookPageText,
  type ImportKind,
} from "./import_source.ts";

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

const SYSTEM = `You extract a Hungarian small-business profile for an AI phone assistant (Dial Hanna).
Source may be a website OR a Facebook Page dump — treat them the same.
Return ONLY JSON matching:
{ business: { name, website, address, phone, hours:[{weekday,open,close}], services:[{id,name,price_text,duration_min}], policies:{} },
  faqs:[{q_hu,a_hu,q_en,a_en}],
  items_meta:[{path,kind,evidence}],
  missing_required:[],
  keywords:[] }.
CRITICAL: faqs MUST contain exactly 5 items (typical caller questions: hours, services/prices, booking, location/parking, policies).
kind is "fact" if clearly on the page, "inference" if guessed. Prefer Hungarian q_hu/a_hu; always include q_en/a_en too.
Never invent exact prices as facts — say the owner will confirm if unknown.`;

const PAD_TEMPLATES: { q_hu: string; a_hu: string; q_en: string; a_en: string }[] = [
  {
    q_hu: "Mikor vagytok nyitva?",
    a_hu: "A pontos nyitvatartást a tulajdonos még megerősíti. Kérhetek visszahívást?",
    q_en: "What are your opening hours?",
    a_en: "The owner still needs to confirm exact hours. Can I take a callback request?",
  },
  {
    q_hu: "Milyen szolgáltatásokat kínáltok?",
    a_hu: "Szívesen segítek — mondja el, mire van szüksége, és jegyzetlek a tulajdonosnak.",
    q_en: "What services do you offer?",
    a_en: "Happy to help — tell me what you need and I’ll note it for the owner.",
  },
  {
    q_hu: "Szeretnék időpontot foglalni.",
    a_hu: "Foglaláshoz kérem a nevét, elérhetőségét és a kívánt időablakot.",
    q_en: "I’d like to book an appointment.",
    a_en: "For a booking I’ll need your name, contact, and preferred time window.",
  },
  {
    q_hu: "Hol találhatóatok / van parkoló?",
    a_hu: "A címet a profilból mondom, ha ismert; parkolásról a tulajdonos erősít meg részleteket.",
    q_en: "Where are you / is there parking?",
    a_en: "I’ll share the address from the profile if known; parking details need owner confirmation.",
  },
  {
    q_hu: "Lehet lemondani vagy átrakni az időpontot?",
    a_hu: "Lemondást és áthelyezést felveszem üzenetben a tulajdonosnak.",
    q_en: "Can I cancel or reschedule?",
    a_en: "I’ll take cancel or reschedule requests as a message for the owner.",
  },
];

export function normalizeToFiveFaqs(
  faqs: ExtractedProfile["faqs"],
  businessName?: string,
): ExtractedProfile["faqs"] {
  const cleaned = (faqs ?? []).filter((f) => f.q_hu?.trim() && f.a_hu?.trim());
  const out = cleaned.slice(0, 5).map((f) => ({
    q_hu: f.q_hu.trim(),
    a_hu: f.a_hu.trim(),
    q_en: f.q_en?.trim() || f.q_hu.trim(),
    a_en: f.a_en?.trim() || f.a_hu.trim(),
  }));
  let i = 0;
  while (out.length < 5) {
    const t = PAD_TEMPLATES[i % PAD_TEMPLATES.length];
    const name = businessName?.trim();
    out.push({
      ...t,
      a_hu: name ? `${t.a_hu} (${name})` : t.a_hu,
      a_en: name ? `${t.a_en} (${name})` : t.a_en,
    });
    i += 1;
  }
  return out;
}

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
    maxTokens: 1200,
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
  parsed.faqs = normalizeToFiveFaqs(parsed.faqs, parsed.business.name);
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

export async function fetchImportSource(url: string): Promise<{ kind: ImportKind; text: string }> {
  const kind = detectImportKind(url);
  if (kind === "facebook") {
    return { kind, text: await fetchFacebookPageText(url) };
  }
  return { kind, text: await fetchWebsiteText(url) };
}
