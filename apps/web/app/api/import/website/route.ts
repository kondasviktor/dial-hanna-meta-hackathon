import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { organizations, businessProfiles, faqs, knowledgeSources, agentVersions } from "@/db/schema.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import { extractFromHtml, fetchImportSource } from "@/lib/import_website.ts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const orgRes = await resolveOrgId();
  if (!orgRes.clerkOrgId || !orgRes.orgUuid) {
    return NextResponse.json({ ok: false, error: "org-required" }, { status: 400 });
  }
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  const url = String(body.url ?? "").trim();
  if (!url) return NextResponse.json({ ok: false, error: "url-required" }, { status: 400 });

  const db = getDb();
  if (!db) return NextResponse.json({ ok: false, error: "db-unavailable" }, { status: 503 });

  let kind: string;
  let sourceText: string;
  let pages: string[] | undefined;
  let crawlEngine: string | undefined;
  let linkedWebsite: string | undefined;
  try {
    const src = await fetchImportSource(url);
    kind = src.kind;
    sourceText = src.text;
    pages = src.pages;
    crawlEngine = src.crawlEngine;
    linkedWebsite = src.linkedWebsite;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }

  let extracted;
  try {
    extracted = await extractFromHtml(url, sourceText, pages);
  } catch (e) {
    return NextResponse.json({ ok: false, error: `extract:${String(e)}` }, { status: 502 });
  }

  const orgId = orgRes.orgUuid;
  await db.insert(knowledgeSources).values({
    orgId,
    type: kind === "facebook" ? "facebook" : "url",
    uri: url,
    rawText: sourceText.slice(0, 8000),
    status: "processed",
  });

  const existing = (await db.select().from(businessProfiles).where(eq(businessProfiles.orgId, orgId)).limit(1))[0];
  if (existing) {
    await db.update(businessProfiles).set({ profile: extracted.business, updatedAt: new Date() })
      .where(eq(businessProfiles.orgId, orgId));
  } else {
    await db.insert(businessProfiles).values({ orgId, profile: extracted.business });
  }

  if (extracted.business.name) {
    await db.update(organizations).set({ name: extracted.business.name })
      .where(eq(organizations.id, orgId));
  }

  // Replace prior import drafts so re-runs stay at 5.
  const prior = await db.select().from(faqs).where(eq(faqs.orgId, orgId));
  for (const f of prior) {
    if (f.origin === "import" && f.status === "draft") {
      await db.delete(faqs).where(eq(faqs.id, f.id));
    }
  }

  for (const f of extracted.faqs.slice(0, 8)) {
    if (!f.q_hu?.trim() || !f.a_hu?.trim()) continue;
    await db.insert(faqs).values({
      orgId,
      qHu: f.q_hu.trim(),
      aHu: f.a_hu.trim(),
      qEn: f.q_en ?? null,
      aEn: f.a_en ?? null,
      origin: "import",
      status: "draft",
    });
  }

  const keywords = [
    ...(extracted.keywords ?? []),
    extracted.business.name,
    ...(extracted.business.services ?? []).map((s) => s.name),
  ].filter(Boolean) as string[];

  await db.insert(agentVersions).values({
    orgId,
    status: "draft",
    config: {
      profile: extracted.business,
      faqs: extracted.faqs,
      keywords,
      missing: extracted.missing_required,
      items_meta: extracted.items_meta,
      source: kind,
      crawlEngine: crawlEngine ?? "local",
      pages: pages ?? extracted.pages_crawled ?? [],
    },
  });

  return NextResponse.json({
    ok: true,
    name: extracted.business.name ?? null,
    faqCount: extracted.faqs.length,
    source: kind,
    crawlEngine: crawlEngine ?? "local",
    linkedWebsite: linkedWebsite ?? extracted.business.website ?? null,
    missing: extracted.missing_required,
    pagesCrawled: (pages ?? extracted.pages_crawled ?? []).length,
  });
}
