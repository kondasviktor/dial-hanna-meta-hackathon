/** Website URL import helpers. Facebook Page import is not supported. */

export type ImportKind = "website";

export function detectImportKind(raw: string): ImportKind {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "facebook.com" || host === "fb.com" || host === "m.facebook.com" || host.endsWith(".facebook.com")) {
      throw new Error("facebook-not-supported");
    }
  } catch (e) {
    if (e instanceof Error && e.message === "facebook-not-supported") throw e;
    /* invalid URL — let the crawler/API surface a clearer error */
  }
  return "website";
}
