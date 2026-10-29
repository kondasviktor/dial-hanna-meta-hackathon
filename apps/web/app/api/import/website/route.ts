import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client.ts";
import { organizations, businessProfiles, faqs, knowledgeSources, agentVersions } from "@/db/schema.ts";
import { requireAdmin, resolveOrgId } from "@/lib/org.ts";
import { extractFromHtml, fetchWebsiteText } from "@/lib/import_website.ts";

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

  let html: string;
  try {
    html = await fetchWebsiteText(url);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 });
  }

  let extracted;
  try {
    extracted = await extractFromHtml(url, html);
  } catch (e) {
    return NextResponse.json({ ok: false, error: `wonder:${String(e)}` }, { status: 502 });
  }

  const orgId = orgRes.orgUuid;
  await db.insert(knowledgeSources).values({
    orgId, type: "url", uri: url, rawText: html.slice(0, 8000), status: "processed",
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

  for (const f of extracted.faqs.slice(0, 40)) {
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
    },
  });

  return NextResponse.json({
    ok: true,
    name: extracted.business.name ?? null,
    faqCount: extracted.faqs.length,
    missing: extracted.missing_required,
  });
}
