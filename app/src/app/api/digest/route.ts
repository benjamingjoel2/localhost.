import { NextResponse } from "next/server";
import { sendDigests, buildDigest, renderDigest } from "@/lib/digest";
import { prisma } from "@/lib/db";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Monday cron. `?preview=<email>` renders that user's digest as HTML instead of sending. `?dry=1` lists who would get one.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const preview = sp.get("preview");
  if (preview) {
    const u = await prisma.user.findUnique({ where: { email: preview }, select: { id: true } });
    if (!u) return NextResponse.json({ error: "no such user" }, { status: 404 });
    const d = await buildDigest(u.id);
    return new Response(d ? renderDigest(d) : "", { headers: { "content-type": "text/html; charset=utf-8" } });
  }
  const results = await sendDigests({ dryRun: sp.get("dry") === "1" });
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), count: results.length, results });
}
