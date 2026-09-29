import { NextResponse } from "next/server";
import { importAll, SOURCES } from "@/lib/sources";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Vercel cron hits this with `Authorization: Bearer $CRON_SECRET`. `?only=luma,meetup` limits sources.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const only = (new URL(req.url).searchParams.get("only") ?? "").split(",").filter((s) => s in SOURCES) as (keyof typeof SOURCES)[];
  const results = await importAll(only);
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results });
}
