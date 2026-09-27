"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { pin, slugify } from "@/lib/util";

const Form = z.object({
  communityId: z.string().optional(), communityName: z.string().optional(),
  title: z.string().min(2), city: z.string().min(1), type: z.enum(["MEETUP", "HACKATHON", "CONFERENCE", "DEMO_DAY", "WORKSHOP", "LAUNCH", "DINNER", "OTHER"]),
  startsAt: z.string().min(1), endsAt: z.string().optional(), venue: z.string().optional(), address: z.string().optional(), description: z.string().optional(),
  currency: z.enum(["USD", "EUR", "GBP"]),
  tierName: z.array(z.string()), tierPrice: z.array(z.string()), tierCap: z.array(z.string()),
});

export async function createEvent(fd: FormData) {
  const user = await requireUser();
  const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
  const data = Form.parse({ ...raw, tierName: fd.getAll("tierName"), tierPrice: fd.getAll("tierPrice"), tierCap: fd.getAll("tierCap") });

  let communityId = data.communityId;
  if (!communityId || communityId === "new") {
    const name = (data.communityName ?? "").trim() || `${user.email.split("@")[0]}'s events`;
    const c = await prisma.community.create({ data: { name, slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`, city: data.city, ownerId: user.id } });
    communityId = c.id;
  } else {
    const c = await prisma.community.findFirst({ where: { id: communityId, OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] } });
    if (!c) throw new Error("not your community");
  }
  const base = slugify(data.title);
  const taken = await prisma.event.count({ where: { city: data.city, slug: base } });
  const slug = taken ? `${base}-${Math.random().toString(36).slice(2, 5)}` : base;
  const tiers = data.tierName.map((name, i) => ({ name: name.trim() || "general", priceMinor: Math.round(Number(data.tierPrice[i] || 0) * 100), capacity: data.tierCap[i] ? Number(data.tierCap[i]) : null, order: i })).filter((t) => t.name);
  const e = await prisma.event.create({
    data: {
      slug, city: data.city, title: data.title, type: data.type, description: data.description || null, venue: data.venue || null, address: data.address || null,
      startsAt: new Date(data.startsAt), endsAt: data.endsAt ? new Date(data.endsAt) : null, currency: data.currency, checkinPin: pin(), communityId,
      tiers: { create: tiers.length ? tiers : [{ name: "general", priceMinor: 0, order: 0 }] },
    },
  });
  redirect(`/host/${e.id}`);
}
