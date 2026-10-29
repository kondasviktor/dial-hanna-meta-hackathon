import { verifyToolCall } from "./security.ts";

export function hmacSecret(): string {
  const s = process.env.TOOLS_HMAC_SECRET ?? "";
  if (!s) throw new Error("TOOLS_HMAC_SECRET-unset");
  return s;
}

export function verifyVoiceRequest(
  req: Request,
  method: string,
  pathWithQuery: string,
  body: string,
): { ok: boolean; reason?: string } {
  const ts = req.headers.get("x-dh-timestamp") ?? "";
  const sig = req.headers.get("x-dh-signature") ?? "";
  try {
    return verifyToolCall(sig, method, pathWithQuery, ts, body, hmacSecret());
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
}
