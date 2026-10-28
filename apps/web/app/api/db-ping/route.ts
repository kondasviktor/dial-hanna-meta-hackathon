import { NextResponse } from "next/server";
import { dbPing } from "@/db/client";

export async function GET() {
  const result = await dbPing();
  const status = result.ok ? 200 : 503;
  return NextResponse.json(result, { status });
}
