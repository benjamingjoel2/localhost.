import { NextResponse } from "next/server";
import { importAllLuma } from "@/lib/sources/luma";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Vercel cron hits this with `Authorization: Bearer $CRON_SECRET`. Locally, hit it with the same header.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const results = await importAllLuma();
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results });
}
