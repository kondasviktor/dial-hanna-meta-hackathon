// Website crawl → Meta extract model → business profile + FAQs.

import { chat, MODELS } from "./meta.ts";
import { crawlWebsite, htmlToText } from "./crawl_site.ts";
import { detectImportKind, type ImportKind } from "./import_source.ts";

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
  pages_crawled?: string[];
}

const SYSTEM = `You build a phone knowledge base for Dial Hanna, an AI receptionist for Hungarian small businesses.
Source is a multi-page website crawl (PAGE: url sections) — merge facts from every section.
Return ONLY JSON matching:
{ business: { name, website, address, phone, hours:[{weekday,open,close}], services:[{id,name,price_text,duration_min}], policies:{parking,payment,ordering,cancellation,other,events} },
  faqs:[{q_hu,a_hu,q_en,a_en}],
  items_meta:[{path,kind,evidence}],
  missing_required:[],
  keywords:[] }.

RULES:
- weekday MUST be integer 1=Mon … 7=Sun (not day names).
- Infer vertical from category/about/menu (restaurant, café, bar, bakery, salon, etc.).
- Scan EVERY PAGE section. Product/menu pages often have prices (Ft, Ft/kg, Ft/db) — put real price_text on services when present. Never say "price not on homepage" if another crawled page shows prices.
- List concrete popular products/services with prices when available (MAX 10 — most typical callers ask about). Keep each price_text short.
- policies.parking / payment / ordering / cancellation: only from the source; omit if unknown. policies.events: live music, daily specials, private events if stated.
- faqs: return 6 to 8 items, vertical-aware:
  * Restaurant / café / bar: (1) hours (2) address + parking (3) cuisine / what they serve (4) BOOK A TABLE with Hanna — party size, date/time, name, phone (5) takeaway or online order ONLY if the source mentions it (6) payment (7) events / specials if mentioned. Prefer table booking language — do NOT invent cake/product retail ordering.
  * Retail / bakery / services: (1) hours (2) location (3) products/prices (4) PLACE an order with Hanna (item, size, pickup, name, phone) (5) cancel/change (6) payment (7) extras (allergens, lead time).
- Answers must help the caller finish the task on this call. Prefer actionable scripts over "call this number". Do NOT tell the caller to dial the shop number they already called.
- Speak as Hanna on the phone. NEVER mention the website, homepage, weboldal, honlap, or crawl gaps in answers. Missing facts → owner/shop will confirm or take a note; put gaps only in missing_required / items_meta.
- kind is "fact" if clearly on a page, "inference" if guessed. Prefer Hungarian q_hu/a_hu; always include q_en/a_en.
- Never invent exact prices as facts — if unknown, say the owner will confirm. If prices ARE on a crawled page, use them as facts.`;

const PAD_TEMPLATES: { q_hu: string; a_hu: string; q_en: string; a_en: string }[] = [
  {
    q_hu: "Mikor vagytok nyitva?",
    a_hu: "A pontos nyitvatartást a tulajdonos még megerősíti. Kérhetek visszahívást?",
    q_en: "What are your opening hours?",
    a_en: "The owner still needs to confirm exact hours. Can I take a callback request?",
  },
  {
    q_hu: "Mit lehet rendelni, és mennyibe kerül?",
    a_hu: "Elmondom a kínálatot, amire van adatunk; ha az ár nincs meg, felveszem a kérést a tulajdonosnak.",
    q_en: "What can I order, and what does it cost?",
    a_en: "I’ll share what we have on file; if a price is missing I’ll note your request for the owner.",
  },
  {
    q_hu: "Szeretnék rendelni / időpontot foglalni.",
    a_hu: "Felveszem a rendelést: mi kell, méret vagy adag, mikorra, és a neve plusz telefonszáma.",
    q_en: "I’d like to order or book.",
    a_en: "I’ll take the order: what you need, size, when, plus your name and phone number.",
  },
  {
    q_hu: "Hol vagytok, van parkoló?",
    a_hu: "A címet a profilból mondom; parkolásról csak azt, ami a tudásbázisban van — ha nincs adat, üzenetet hagyok.",
    q_en: "Where are you, is there parking?",
    a_en: "I’ll share the address from the profile; parking only if we have it on file — otherwise I’ll leave a note.",
  },
  {
    q_hu: "Lehet lemondani vagy módosítani a rendelést?",
    a_hu: "Lemondást és módosítást felveszem a tulajdonosnak a neveddel és a rendelés részleteivel.",
    q_en: "Can I cancel or change an order?",
    a_en: "I’ll take cancel or change requests for the owner with your name and order details.",
  },
  {
    q_hu: "Mivel lehet fizetni?",
    a_hu: "Ha van adat a tudásbázisban, azt mondom; különben megjegyzem a kérdését a tulajdonosnak.",
    q_en: "How can I pay?",
    a_en: "I’ll share payment options on file; otherwise I’ll note the question for the owner.",
  },
];

const WEEKDAY_NAME_TO_ISO: Record<string, number> = {
  hétfő: 1, hetfo: 1, monday: 1, mon: 1,
  kedd: 2, tuesday: 2, tue: 2,
  szerda: 3, wednesday: 3, wed: 3,
  csütörtök: 4, csutortok: 4, thursday: 4, thu: 4,
  péntek: 5, pentek: 5, friday: 5, fri: 5,
  szombat: 6, saturday: 6, sat: 6,
  vasárnap: 7, vasarnap: 7, sunday: 7, sun: 7,
};

const FAQ_MIN = 6;
const FAQ_MAX = 8;

/** Coerce free-form hours into {weekday:1-7, open, close}. */
export function normalizeHours(
  hours: ExtractedProfile["business"]["hours"] | unknown,
): ExtractedProfile["business"]["hours"] {
  if (!Array.isArray(hours)) return [];
  const out: NonNullable<ExtractedProfile["business"]["hours"]> = [];
  for (const raw of hours) {
    if (!raw || typeof raw !== "object") continue;
    const h = raw as Record<string, unknown>;
    let weekday: number | undefined;
    if (typeof h.weekday === "number" && h.weekday >= 1 && h.weekday <= 7) {
      weekday = h.weekday;
    } else if (typeof h.weekday === "string") {
      const key = h.weekday.trim().toLowerCase();
      weekday = WEEKDAY_NAME_TO_ISO[key];
      const asNum = Number(key);
      if (weekday == null && asNum >= 1 && asNum <= 7) weekday = asNum;
    }
    const open = typeof h.open === "string" ? h.open.trim() : "";
    const close = typeof h.close === "string" ? h.close.trim() : "";
    if (weekday == null || !open || !close) continue;
    out.push({ weekday, open, close });
  }
  return out;
}

/** Strip crawl/website meta that must never be spoken to callers. */
export function scrubSpokenAnswer(text: string): string {
  let t = text.trim();
  // Drop clauses that explain website gaps (HU + EN).
  t = t.replace(
    /[.;,]?\s*(a\s+)?(főoldalon|honlapon|weboldalon|weboldalon|webhelyen)[^.?!]*[.?!]?/gi,
    "",
  );
  t = t.replace(
    /[.;,]?\s*(nem szerepel(nek)?|nincs megadva|nem található)[^.?!]*(honlap|weboldal|főoldal|webhely)[^.?!]*[.?!]?/gi,
    "",
  );
  t = t.replace(
    /[.;,]?\s*(not (listed|shown|available|found)|no (price|info|information))[^.?!]*(website|homepage|site|online)[^.?!]*[.?!]?/gi,
    "",
  );
  t = t.replace(
    /[.;,]?\s*(price|prices|info|information)[^.?!]*not (on|listed on)[^.?!]*(website|homepage|site)[^.?!]*[.?!]?/gi,
    "",
  );
  t = t.replace(/\s{2,}/g, " ").replace(/\s+([.,;!?])/g, "$1").trim();
  if (!t) {
    return "Ezt a tulajdonos / üzlet visszaigazolja; felveszem a kérésedet.";
  }
  return t;
}

export function normalizeFaqs(
  faqs: ExtractedProfile["faqs"],
  businessName?: string,
): ExtractedProfile["faqs"] {
  const cleaned = (faqs ?? []).filter((f) => f.q_hu?.trim() && f.a_hu?.trim());
  const out = cleaned.slice(0, FAQ_MAX).map((f) => ({
    q_hu: f.q_hu.trim(),
    a_hu: scrubSpokenAnswer(f.a_hu),
    q_en: f.q_en?.trim() || f.q_hu.trim(),
    a_en: scrubSpokenAnswer(f.a_en?.trim() || f.a_hu),
  }));
  let i = 0;
  while (out.length < FAQ_MIN) {
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

/** @deprecated use normalizeFaqs */
export function normalizeToFiveFaqs(
  faqs: ExtractedProfile["faqs"],
  businessName?: string,
): ExtractedProfile["faqs"] {
  return normalizeFaqs(faqs, businessName).slice(0, 5);
}

export async function extractFromHtml(
  url: string,
  htmlOrCrawlText: string,
  pagesCrawled?: string[],
): Promise<ExtractedProfile> {
  const text = htmlOrCrawlText.includes("=== PAGE:")
    ? htmlOrCrawlText.slice(0, 55_000)
    : htmlToText(htmlOrCrawlText).slice(0, 55_000);

  async function callExtract(userContent: string, maxTokens: number): Promise<ExtractedProfile> {
    const raw = await chat({
      model: MODELS.extract,
      reasoningEffort: "minimal",
      maxTokens,
      json: true,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userContent },
      ],
    });
    return JSON.parse(raw) as ExtractedProfile;
  }

  const pageList = (pagesCrawled ?? []).join(", ") || "single document";
  const baseUser = `Seed URL: ${url}\nPages in this crawl: ${pageList}\n\nCRAWLED TEXT:\n`;
  let parsed: ExtractedProfile;
  try {
    parsed = await callExtract(`${baseUser}${text.slice(0, 40_000)}`, 4500);
  } catch {
    // Usually finish_reason=length → truncated JSON. Retry compact.
    parsed = await callExtract(
      `${baseUser}${text.slice(0, 22_000)}\n\nCOMPACT MODE: max 8 services, short price_text, exactly 6 faqs, short answers.`,
      2800,
    );
  }
  if (!parsed.business) parsed.business = {};
  if (!Array.isArray(parsed.faqs)) parsed.faqs = [];
  if (!Array.isArray(parsed.items_meta)) parsed.items_meta = [];
  if (!Array.isArray(parsed.missing_required)) parsed.missing_required = [];
  parsed.business.website = parsed.business.website ?? url;
  parsed.business.hours = normalizeHours(parsed.business.hours);
  if (!Array.isArray(parsed.business.services)) parsed.business.services = [];
  if (!parsed.business.policies || typeof parsed.business.policies !== "object") {
    parsed.business.policies = {};
  }
  parsed.faqs = normalizeFaqs(parsed.faqs, parsed.business.name);
  parsed.pages_crawled = pagesCrawled;
  return parsed;
}

export async function fetchWebsiteText(url: string): Promise<string> {
  const crawl = await crawlWebsite(url);
  return crawl.text;
}

async function crawlWebsiteSource(
  url: string,
): Promise<{ text: string; pages: string[]; crawlEngine: string }> {
  if (process.env.APIFY_TOKEN?.trim()) {
    try {
      const { crawlWithApify } = await import("./crawl_apify.ts");
      const apify = await crawlWithApify(url);
      if (apify?.pages.length) {
        return {
          text: apify.text,
          pages: apify.pages,
          crawlEngine: apify.engine === "web-scraper" ? "apify-web-scraper" : "apify-cheerio",
        };
      }
    } catch (e) {
      console.error("apify-crawl-fallback", e);
    }
  }
  const crawl = await crawlWebsite(url);
  return { text: crawl.text, pages: crawl.pages, crawlEngine: "local" };
}

export async function fetchImportSource(
  url: string,
): Promise<{
  kind: ImportKind;
  text: string;
  pages?: string[];
  crawlEngine?: string;
}> {
  const kind = detectImportKind(url);
  const site = await crawlWebsiteSource(url);
  return { kind, text: site.text, pages: site.pages, crawlEngine: site.crawlEngine };
}
