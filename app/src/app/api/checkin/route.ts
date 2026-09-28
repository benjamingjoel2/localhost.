import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const { eventId, pin, code } = (await req.json()) as { eventId: string; pin: string; code: string };
  const e = await prisma.event.findUnique({ where: { id: eventId }, select: { checkinPin: true } });
  if (!e || e.checkinPin !== String(pin)) return NextResponse.json({ ok: false, message: "wrong pin" }, { status: 403 });
  const t = await prisma.ticket.findUnique({ where: { code }, include: { order: true, tier: true } });
  if (!t || t.eventId !== eventId) return NextResponse.json({ ok: false, message: "no such ticket for this event" });
  if (t.checkedInAt) return NextResponse.json({ ok: false, message: `already checked in at ${t.checkedInAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`, name: t.order.name, tier: t.tier.name });
  await prisma.ticket.update({ where: { id: t.id }, data: { checkedInAt: new Date() } });
  return NextResponse.json({ ok: true, message: "welcome in", name: t.order.name, tier: t.tier.name });
}
