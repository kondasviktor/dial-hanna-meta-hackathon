/**
 * Render the imported business profile + approved FAQs into Hanna's
 * live BUSINESS KNOWLEDGE block. Crawl data lives in businessProfiles.profile;
 * FAQs are the owner-approved Q&A layer — both go to the model.
 */

const WEEKDAY_HU = ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"];

export type BizProfileKnowledge = {
  name?: string;
  website?: string;
  address?: string;
  phone?: string;
  hours?: { weekday?: number; open?: string; close?: string; label?: string }[];
  services?: { id?: string; name?: string; price_text?: string; duration_min?: number }[];
  policies?: Record<string, string | undefined>;
  staff?: { name?: string }[];
};

export type FaqKnowledgeRow = {
  qHu: string;
  aHu: string;
  qEn?: string | null;
  aEn?: string | null;
  status: string;
};

function formatHours(hours: BizProfileKnowledge["hours"]): string[] {
  if (!Array.isArray(hours) || hours.length === 0) return [];
  return hours.map((h) => {
    if (h.label?.trim()) return h.label.trim();
    const d = typeof h.weekday === "number" ? h.weekday : undefined;
    const idx = d != null ? ((d - 1) % 7 + 7) % 7 : undefined;
    const day = idx != null ? WEEKDAY_HU[idx] : "?";
    return `${day} ${h.open ?? "—"}–${h.close ?? "—"}`;
  });
}

/** Full knowledge string for Spark live calls (profile facts + approved FAQs). */
export function renderBusinessKnowledge(
  profile: BizProfileKnowledge | null | undefined,
  faqs: FaqKnowledgeRow[],
  opts?: { fallbackName?: string; lang?: "hu" | "en" },
): string {
  const b = profile ?? {};
  const name = b.name?.trim() || opts?.fallbackName?.trim() || "";
  const lines: string[] = [];

  if (name) lines.push(`Név / Name: ${name}`);
  if (b.website?.trim()) lines.push(`Web: ${b.website.trim()}`);
  if (b.address?.trim()) lines.push(`Cím / Address: ${b.address.trim()}`);
  if (b.phone?.trim()) lines.push(`Telefon / Phone: ${b.phone.trim()}`);

  const hours = formatHours(b.hours);
  if (hours.length) {
    lines.push("Nyitvatartás / Hours:");
    for (const h of hours) lines.push(`- ${h}`);
  }

  const services = (b.services ?? []).filter((s) => s?.name?.trim());
  if (services.length) {
    lines.push("Kínálat és árak / Products & prices (from website import):");
    for (const s of services.slice(0, 40)) {
      const price = s.price_text?.trim() ? ` — ${s.price_text.trim()}` : "";
      const dur = s.duration_min ? ` (${s.duration_min} min)` : "";
      lines.push(`- ${s.name!.trim()}${price}${dur}`);
    }
  }

  const policies = b.policies ?? {};
  const policyEntries = Object.entries(policies).filter(([, v]) => String(v ?? "").trim());
  if (policyEntries.length) {
    lines.push("Szabályok / Policies:");
    for (const [k, v] of policyEntries) {
      lines.push(`- ${k}: ${String(v).trim()}`);
    }
  }

  const staff = (b.staff ?? []).filter((s) => s?.name?.trim());
  if (staff.length) {
    lines.push(`Munkatársak / Staff: ${staff.map((s) => s.name!.trim()).join(", ")}`);
  }

  const approved = faqs.filter((f) => f.status === "approved" && f.qHu?.trim() && f.aHu?.trim());
  if (approved.length) {
    lines.push("Jóváhagyott GYIK / Approved FAQs (prefer these wordings when they match):");
    for (const f of approved) {
      const qe = f.qEn?.trim();
      const ae = f.aEn?.trim();
      // Live calls render only the call's language — carrying both languages
      // doubled the block and pushed owner-answered FAQs past the size cap.
      if (opts?.lang === "en" && qe && ae) {
        lines.push(`Q (EN): ${qe}`);
        lines.push(`A (EN): ${ae}`);
      } else if (opts?.lang === "hu") {
        lines.push(`Q (HU): ${f.qHu.trim()}`);
        lines.push(`A (HU): ${f.aHu.trim()}`);
      } else if (!opts?.lang && qe && ae) {
        lines.push(`Q (HU): ${f.qHu.trim()}`);
        lines.push(`A (HU): ${f.aHu.trim()}`);
        lines.push(`Q (EN): ${qe}`);
        lines.push(`A (EN): ${ae}`);
      } else {
        lines.push(`Q (HU): ${f.qHu.trim()}`);
        lines.push(`A (HU): ${f.aHu.trim()}`);
      }
    }
  }

  if (!lines.length) {
    return "No business knowledge loaded yet. Take a message for the owner.";
  }
  return lines.join("\n");
}
