import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, app: "dial-hanna", time: new Date().toISOString() });
}
