import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs, knowledgeGaps, organizations } from "@/db/schema.ts";
import { buildFaqDraft } from "@/lib/gaps.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import { dashLangFromSearch, type DashLang } from "@/lib/dash_lang.ts";
import ImportForm from "../../onboarding/import-form";

export const dynamic = "force-dynamic";

type BizProfile = {
  name?: string;
  website?: string;
  address?: string;
  phone?: string;
  hours?: { weekday?: number; open?: string; close?: string; label?: string }[];
  services?: { id?: string; name?: string; price_text?: string; duration_min?: number }[];
  policies?: Record<string, string>;
};

const WEEKDAY_HU = ["Hét", "Ked", "Sze", "Csü", "Pén", "Szo", "Vas"];
const WEEKDAY_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHours(hours: BizProfile["hours"], lang: DashLang): string[] {
  if (!Array.isArray(hours) || hours.length === 0) return [];
  const days = lang === "en" ? WEEKDAY_EN : WEEKDAY_HU;
  return hours.map((h) => {
    if (h.label?.trim()) return h.label.trim();
    const d = typeof h.weekday === "number" ? h.weekday : undefined;
    const idx = d != null ? ((d - 1) % 7 + 7) % 7 : undefined;
    const day = idx != null ? days[idx] : "?";
    return `${day} ${h.open ?? "—"}–${h.close ?? "—"}`;
  });
}

async function answerGap(formData: FormData) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const gapId = String(formData.get("gapId") ?? "");
  const answer = String(formData.get("answer") ?? "");
  const gap = (await db.select().from(knowledgeGaps).where(eq(knowledgeGaps.id, gapId)).limit(1))[0];
  if (!gap) throw new Error("gap-not-found");
  const draft = buildFaqDraft(gap.question, answer);
  const inserted = await db.insert(faqs).values({
    orgId: gap.orgId,
    qHu: draft.qHu,
    aHu: draft.aHu,
    qEn: draft.qEn,
    aEn: draft.aEn,
    origin: "gap",
    status: "approved",
  }).returning({ id: faqs.id });
  await db.update(knowledgeGaps).set({
    status: "approved",
    approvedFaqId: inserted[0].id,
  }).where(eq(knowledgeGaps.id, gapId));
  revalidatePath("/dashboard/kb");
  revalidatePath("/dashboard/gaps");
  revalidatePath("/dashboard");
}

async function setFaqStatus(formData: FormData) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const id = String(formData.get("faqId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (status !== "approved" && status !== "rejected") throw new Error("bad-status");
  await db.update(faqs).set({ status }).where(eq(faqs.id, id));
  revalidatePath("/dashboard/kb");
  revalidatePath("/onboarding");
}

async function addManualFaq(formData: FormData) {
  "use server";
  const admin = await requireAdmin();
  if (!admin.ok) throw new Error("forbidden");
  const orgRes = await resolveOrgId();
  if (!orgRes.orgUuid) throw new Error("org-required");
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const q = String(formData.get("q") ?? "").trim();
  const a = String(formData.get("a") ?? "").trim();
  if (!q || !a) throw new Error("q-a-required");
  await db.insert(faqs).values({
    orgId: orgRes.orgUuid,
    qHu: q,
    aHu: a,
    origin: "manual",
    status: "draft",
  });
  revalidatePath("/dashboard/kb");
}

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/waitlist");
  const orgRes = await resolveOrgId();
  if (!orgRes.clerkOrgId) redirect("/create-org");

  const sp = searchParams ? await searchParams : {};
  const lang = dashLangFromSearch(sp);
  const en = lang === "en";

  const db = getDb();
  let rows: {
    id: string;
    qHu: string;
    aHu: string;
    qEn: string | null;
    aEn: string | null;
    status: string;
    origin: string;
  }[] = [];
  let gaps: { id: string; question: string; context: string | null; status: string }[] = [];
  let bizName = "";
  let profile: BizProfile | null = null;
  let hasProfileRow = false;

  if (db) {
    const org = (await db.select().from(organizations).where(eq(organizations.clerkOrgId, orgRes.clerkOrgId)).limit(1))[0];
    if (org) {
      const prof = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, org.id)).limit(1))[0];
      hasProfileRow = Boolean(prof);
      profile = (prof?.profile ?? null) as BizProfile | null;
      bizName = profile?.name?.trim() || org.name || "";

      rows = (await db.select().from(faqs).where(eq(faqs.orgId, org.id))).map((f) => ({
        id: f.id,
        qHu: f.qHu,
        aHu: f.aHu,
        qEn: f.qEn,
        aEn: f.aEn,
        status: f.status,
        origin: f.origin,
      }));
      gaps = (await db.select().from(knowledgeGaps).where(eq(knowledgeGaps.orgId, org.id))).map((g) => ({
        id: g.id, question: g.question, context: g.context, status: g.status,
      }));
    }
  }

  const openGaps = gaps.filter((g) => g.status === "open");
  const badge = (origin: string) => {
    if (origin === "import") return "import";
    if (origin === "gap") return en ? "gap" : "pótlás";
    return en ? "manual" : "kézi";
  };

  const hoursLines = formatHours(profile?.hours, lang);
  const services = Array.isArray(profile?.services) ? profile!.services!.filter((s) => s?.name?.trim()) : [];
  const missingLabels: string[] = [];
  if (hasProfileRow && profile) {
    if (hoursLines.length === 0) missingLabels.push(en ? "hours" : "nyitvatartás");
    if (services.length === 0) missingLabels.push(en ? "services" : "szolgáltatások");
    if (!profile.address?.trim()) missingLabels.push(en ? "address" : "cím");
    if (!profile.phone?.trim()) missingLabels.push(en ? "phone" : "telefon");
  }

  const t = en
    ? {
        title: "Knowledge",
        intro: "Import a website or Facebook Page, fill gaps, and approve FAQs.",
        profile: "Profile",
        noProfile:
          "No business profile yet. Paste a website below — Muse Wonder fills the details.",
        name: "Name",
        address: "Address",
        phone: "Phone",
        hours: "Hours",
        services: "Services",
        stillMissing: "Still missing from this profile",
        import: "Import",
        importHelp:
          "Paste a website or Facebook Page URL — Wonder drafts 5 Q&As. No site? Add FAQs manually below. Only approved answers go live.",
        gaps: "Open gaps",
        gapsHelp: "What Hanna did not know — answer in one line and she will use it next time.",
        noGaps: "No open gaps.",
        answerPh: "One-line answer…",
        save: "Save",
        manual: "Manual FAQ",
        qPh: "Question",
        aPh: "Answer",
        add: "Add",
        faqs: "FAQs",
        empty: "Empty so far.",
        approve: "Approve",
        reject: "Reject",
      }
    : {
        title: "Tudás",
        intro: "Weboldal vagy Facebook Page beillesztése, hiányzó válaszok pótlása, és a jóváhagyott tudás.",
        profile: "Profil",
        noProfile:
          "Még nincs üzleti profil. Illeszd be lent a weboldalt — a Muse Wonder tölti ki a részleteket.",
        name: "Név",
        address: "Cím",
        phone: "Telefon",
        hours: "Nyitvatartás",
        services: "Szolgáltatások",
        stillMissing: "Hiányzik még ebből a profilból",
        import: "Import",
        importHelp:
          "Illeszd be a weboldal vagy Facebook Page címét — készül belőle 5 kérdés–válasz vázlat. Nincs oldalad? Írd be kézzel lent. Csak a jóváhagyott válasz megy élőbe.",
        gaps: "Pótolandó válaszok",
        gapsHelp: "Amit Hanna nem tudott: írd meg egy mondatban, és legközelebb már válaszol.",
        noGaps: "Nincs nyitott kérdés.",
        answerPh: "Válasz egy mondatban…",
        save: "Mentés",
        manual: "Kézi kérdés és válasz",
        qPh: "Kérdés",
        aPh: "Válasz",
        add: "Hozzáadás",
        faqs: "Kérdések és válaszok",
        empty: "Még üres.",
        approve: "Jóváhagy",
        reject: "Elvet",
      };

  return (
    <div>
      <h1 className="dash-title">
        {t.title}
        {bizName ? ` · ${bizName}` : ""}
      </h1>
      <p className="muted">{t.intro}</p>

      <div className="dash-card">
        <h2>{t.profile}</h2>
        {!hasProfileRow || !profile ? (
          <p className="muted small">{t.noProfile}</p>
        ) : (
          <div className="muted small" style={{ display: "grid", gap: 6 }}>
            {profile.name && (
              <div>
                <strong>{t.name}:</strong> {profile.name}
              </div>
            )}
            {profile.website && (
              <div>
                <strong>Web:</strong>{" "}
                <a href={profile.website} target="_blank" rel="noreferrer">
                  {profile.website}
                </a>
              </div>
            )}
            {profile.address?.trim() && (
              <div>
                <strong>{t.address}:</strong> {profile.address}
              </div>
            )}
            {profile.phone?.trim() && (
              <div>
                <strong>{t.phone}:</strong> {profile.phone}
              </div>
            )}
            {hoursLines.length > 0 && (
              <div>
                <strong>{t.hours}:</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {hoursLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {services.length > 0 && (
              <div>
                <strong>{t.services}:</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                  {services.map((s, i) => (
                    <li key={s.id ?? `${s.name}-${i}`}>
                      {s.name}
                      {s.price_text ? ` · ${s.price_text}` : ""}
                      {s.duration_min ? ` · ${s.duration_min} min` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {missingLabels.length > 0 && (
              <p style={{ marginTop: 8 }}>
                <strong>{t.stillMissing}:</strong> {missingLabels.join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="dash-card">
        <h2>{t.import}</h2>
        <p className="muted small" style={{ marginBottom: 12 }}>
          {t.importHelp}
        </p>
        <ImportForm lang={lang} />
      </div>

      <div className="dash-card gap-callout">
        <h2>
          {t.gaps}
          {openGaps.length > 0 ? ` · ${openGaps.length}` : ""}
        </h2>
        <p className="muted small">{t.gapsHelp}</p>
        {openGaps.length === 0 && <p className="muted">{t.noGaps}</p>}
        {openGaps.map((g) => (
          <div key={g.id} style={{ borderTop: "1px solid #e8c87a", padding: "12px 0" }}>
            <strong>{g.question}</strong>
            {g.context && <div className="muted small">{g.context}</div>}
            <form action={answerGap} style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="hidden" name="gapId" value={g.id} />
              <input
                name="answer"
                required
                placeholder={t.answerPh}
                style={{ flex: 1, minWidth: 180, padding: 8 }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                {t.save}
              </button>
            </form>
          </div>
        ))}
      </div>

      <div className="dash-card">
        <h2>{t.manual}</h2>
        <form action={addManualFaq} style={{ display: "grid", gap: 8 }}>
          <input name="q" required placeholder={t.qPh} style={input} />
          <textarea name="a" required placeholder={t.aPh} rows={3} style={input} />
          <button type="submit" className="btn btn-primary btn-sm" style={{ justifySelf: "start" }}>
            {t.add}
          </button>
        </form>
      </div>

      <h2 className="dash-title" style={{ fontSize: 22, marginTop: 8 }}>
        {t.faqs}
      </h2>
      {rows.length === 0 && <p className="muted">{t.empty}</p>}
      {rows.map((f) => {
        const q = en ? f.qEn || f.qHu : f.qHu;
        const a = en ? f.aEn || f.aHu : f.aHu;
        return (
          <div key={f.id} className="dash-card" style={{ marginBottom: 12 }}>
            <p className="muted small">
              {badge(f.origin)} · {f.status}
            </p>
            <p>
              <strong>{q}</strong>
            </p>
            <p>{a}</p>
            {f.status === "draft" && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <form action={setFaqStatus}>
                  <input type="hidden" name="faqId" value={f.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="btn btn-primary btn-sm">
                    {t.approve}
                  </button>
                </form>
                <form action={setFaqStatus}>
                  <input type="hidden" name="faqId" value={f.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" className="btn btn-outline btn-sm">
                    {t.reject}
                  </button>
                </form>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const input = {
  border: "1px solid #D8DDD6",
  borderRadius: 8,
  padding: "10px 12px",
  font: "inherit",
} as const;
