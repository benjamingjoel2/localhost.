"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { baseUrl, fmtDate } from "@/lib/util";

export async function hostEvent(eventId: string) {
  const user = await requireUser();
  const e = await prisma.event.findFirst({ where: { id: eventId, community: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] } }, include: { community: { include: { followers: { include: { user: true } } } } } });
  if (!e) throw new Error("not your event");
  return e;
}

export async function publish(eventId: string) {
  const e = await hostEvent(eventId);
  if (e.published) return;
  await prisma.event.update({ where: { id: eventId }, data: { published: true } });
  const url = `${baseUrl()}/${e.city}/${e.slug}`;
  await Promise.all(e.community.followers.map((f) => sendMail(f.user.email, `${e.community.name}: ${e.title}`, `<p>${e.community.name} just posted an event.</p><p><b>${e.title}</b><br>${fmtDate(e.startsAt)}<br>${e.venue ?? ""}</p><p><a href="${url}">${url}</a></p>`)));
  revalidatePath(`/host/${eventId}`);
}

export async function blast(eventId: string, fd: FormData) {
  const e = await hostEvent(eventId);
  const text = String(fd.get("text") ?? "").trim();
  if (!text) return;
  const orders = await prisma.order.findMany({ where: { eventId, paid: true }, select: { email: true }, distinct: ["email"] });
  await Promise.all(orders.map((o) => sendMail(o.email, `${e.title}: update from the host`, `<p>${text.replace(/\n/g, "<br>")}</p><p><a href="${baseUrl()}/${e.city}/${e.slug}">event page</a></p>`)));
  revalidatePath(`/host/${eventId}`);
}

export async function rotatePin(eventId: string) {
  await hostEvent(eventId);
  await prisma.event.update({ where: { id: eventId }, data: { checkinPin: String(Math.floor(1000 + Math.random() * 9000)) } });
  revalidatePath(`/host/${eventId}`);
}
