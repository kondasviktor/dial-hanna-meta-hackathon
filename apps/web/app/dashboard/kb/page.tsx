import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client.ts";
import { businessProfiles, faqs, knowledgeGaps, organizations } from "@/db/schema.ts";
import { buildFaqDraft } from "@/lib/gaps.ts";
import { chat, MODELS } from "@/lib/meta.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import { dashLangFromSearch } from "@/lib/dash_lang.ts";
import ImportForm from "../../onboarding/import-form";
import DeleteAllFaqsButton from "./delete-all-faqs";
import FaqCard from "./faq-card";

/** Translate Q&A into the other locale so HU/EN stay in sync after an owner edit. */
async function translateFaqPair(
  q: string,
  a: string,
  to: "hu" | "en",
): Promise<{ q: string; a: string } | null> {
  try {
    // Spark (or MODEL_TRANSLATE), not Wonder — short FAQ sync must stay cheap.
    const raw = await chat({
      model: MODELS.translate,
      reasoningEffort: "minimal",
      maxTokens: 800,
      json: true,
      messages: [
        {
          role: "system",
          content:
            `You translate shop FAQ for a phone receptionist. Return ONLY JSON {"q":"...","a":"..."} in ${
              to === "hu" ? "Hungarian" : "English"
            }. Keep the same meaning, natural spoken tone. Never mention websites or crawl gaps.`,
        },
        { role: "user", content: JSON.stringify({ q, a }) },
      ],
    });
    const parsed = JSON.parse(raw) as { q?: string; a?: string };
    const tq = parsed.q?.trim();
    const ta = parsed.a?.trim();
    if (tq && ta) return { q: tq, a: ta };
  } catch (e) {
    console.error("faq-translate-failed", e);
  }
  return null;
}

export const dynamic = "force-dynamic";

type BizProfile = {
  name?: string;
  website?: string;
  address?: string;
  phone?: string;
  hours?: { weekday?: number; open?: string; close?: string; label?: string }[];
};

const WEEKDAY_HU = ["Hét", "Ked", "Sze", "Csü", "Pén", "Szo", "Vas"];
const WEEKDAY_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatHours(hours: BizProfile["hours"], lang: "hu" | "en"): string[] {
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

async function approveFaq(id: string) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  await db.update(faqs).set({ status: "approved" }).where(eq(faqs.id, id));
  revalidatePath("/dashboard/kb");
  revalidatePath("/onboarding");
}

async function rejectFaq(id: string) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  await db.update(faqs).set({ status: "rejected" }).where(eq(faqs.id, id));
  revalidatePath("/dashboard/kb");
  revalidatePath("/onboarding");
}

async function deleteFaq(id: string) {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  await db.delete(faqs).where(eq(faqs.id, id));
  revalidatePath("/dashboard/kb");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

async function deleteAllFaqs() {
  "use server";
  const admin = await requireAdmin();
  if (!admin.ok) throw new Error("forbidden");
  const orgRes = await resolveOrgId();
  if (!orgRes.orgUuid) throw new Error("org-required");
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  await db.delete(faqs).where(eq(faqs.orgId, orgRes.orgUuid));
  revalidatePath("/dashboard/kb");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}

async function saveFaq(id: string, q: string, a: string, lang: "hu" | "en" = "hu") {
  "use server";
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL-unset");
  const qTrim = q.trim();
  const aTrim = a.trim();
  if (!qTrim || !aTrim) throw new Error("q-a-required");
  const row = (await db.select().from(faqs).where(eq(faqs.id, id)).limit(1))[0];
  if (!row) throw new Error("faq-not-found");

  const other = lang === "hu" ? "en" : "hu";
  const translated = await translateFaqPair(qTrim, aTrim, other);

  if (lang === "en") {
    await db.update(faqs).set({
      qEn: qTrim,
      aEn: aTrim,
      ...(translated ? { qHu: translated.q, aHu: translated.a } : {}),
    }).where(eq(faqs.id, id));
  } else {
    await db.update(faqs).set({
      qHu: qTrim,
      aHu: aTrim,
      ...(translated ? { qEn: translated.q, aEn: translated.a } : {}),
    }).where(eq(faqs.id, id));
  }
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

      // Stable order by id so save/approve does not shuffle tiles.
      rows = (
        await db.select().from(faqs).where(eq(faqs.orgId, org.id)).orderBy(asc(faqs.id))
      ).map((f) => ({
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

  const hoursLines = formatHours(profile?.hours, lang);
  const missingLabels: string[] = [];
  if (hasProfileRow && profile) {
    if (hoursLines.length === 0) missingLabels.push(en ? "hours" : "nyitvatartás");
    if (!profile.address?.trim()) missingLabels.push(en ? "address" : "cím");
    if (!profile.phone?.trim()) missingLabels.push(en ? "phone" : "telefon");
  }

  const t = en
    ? {
        title: "Knowledge",
        intro: "Import a website or Facebook Page, fill gaps, and approve FAQs.",
        profile: "Profile",
        noProfile:
          "No business profile yet. Paste a website below — our AI agent fills in the details from the site.",
        name: "Name",
        address: "Address",
        phone: "Phone",
        hours: "Hours",
        stillMissing: "Still missing from this profile",
        import: "Import",
        importHelp:
          "Paste a website or Facebook Page URL — we crawl key pages (menu, contact, prices) and draft Q&As for Hanna. No site? Add FAQs manually. Only approved answers go live.",
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
        deleteAll: "Delete all",
        deleteAllConfirm: "Delete every Q&A for this shop? You can re-import after.",
      }
    : {
        title: "Tudás",
        intro: "Weboldal vagy Facebook Page beillesztése, hiányzó válaszok pótlása, és a jóváhagyott tudás.",
        profile: "Profil",
        noProfile:
          "Még nincs üzleti profil. Illeszd be lent a weboldalt — az AI asszisztensünk kitölti a részleteket a webhelyről.",
        name: "Név",
        address: "Cím",
        phone: "Telefon",
        hours: "Nyitvatartás",
        stillMissing: "Hiányzik még ebből a profilból",
        import: "Import",
        importHelp:
          "Illeszd be a weboldal vagy Facebook Page címét — több oldalt is végigolvasunk (kínálat, kapcsolat, árak), és kérdés–válasz vázlatot készítünk Hannának. Nincs oldalad? Írd be kézzel. Csak a jóváhagyott válasz megy élőbe.",
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
        deleteAll: "Összes törlése",
        deleteAllConfirm: "Töröljük az összes kérdés–választ ennél az üzletnél? Utána újra importálhatsz.",
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

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <h2 className="dash-title" style={{ fontSize: 22, margin: 0 }}>
          {t.faqs}
        </h2>
        {rows.length > 0 && (
          <DeleteAllFaqsButton
            label={t.deleteAll}
            confirmMessage={t.deleteAllConfirm}
            action={deleteAllFaqs}
          />
        )}
      </div>
      {rows.length === 0 && <p className="muted">{t.empty}</p>}
      {rows.map((f) => (
        <FaqCard
          key={f.id}
          faq={f}
          lang={lang}
          onApprove={approveFaq}
          onReject={rejectFaq}
          onDelete={deleteFaq}
          onSave={saveFaq}
        />
      ))}
    </div>
  );
}

const input = {
  border: "1px solid #D8DDD6",
  borderRadius: 8,
  padding: "10px 12px",
  font: "inherit",
} as const;
