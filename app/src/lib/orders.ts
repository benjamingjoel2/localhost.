import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { baseUrl, fmtDate, ticketCode } from "@/lib/util";

export type OrderInput = { eventId: string; tierId: string; qty: number; name: string; email: string; company?: string | null; role?: string | null; onGuestList: boolean; userId?: string | null };

export async function assertAvailable(tierId: string, qty: number) {
  const tier = await prisma.ticketTier.findUnique({ where: { id: tierId }, include: { _count: { select: { tickets: true } }, event: true } });
  if (!tier || !tier.event.published) throw new Error("this tier is not on sale");
  if (tier.capacity != null && tier._count.tickets + qty > tier.capacity) throw new Error("not enough tickets left in this tier");
  return tier;
}

export async function fulfilOrder(input: OrderInput, opts: { amountMinor: number; paid: boolean; stripeSessionId?: string }) {
  const tier = await prisma.ticketTier.findUniqueOrThrow({ where: { id: input.tierId }, include: { event: true } });
  const order = await prisma.order.create({
    data: {
      eventId: input.eventId, userId: input.userId ?? undefined, email: input.email, name: input.name, company: input.company ?? undefined, role: input.role ?? undefined,
      onGuestList: input.onGuestList, amountMinor: opts.amountMinor, currency: tier.event.currency, paid: opts.paid, stripeSessionId: opts.stripeSessionId,
      tickets: { create: Array.from({ length: input.qty }, () => ({ code: ticketCode(), eventId: input.eventId, tierId: input.tierId })) },
    },
    include: { tickets: true, event: true },
  });
  const links = order.tickets.map((t) => `<li><a href="${baseUrl()}/t/${t.code}">${t.code}</a></li>`).join("");
  await sendMail(order.email, `your ticket: ${order.event.title}`, `<p>you're in.</p><p><b>${order.event.title}</b><br>${fmtDate(order.event.startsAt)}<br>${order.event.venue ?? ""}</p><p>your ticket${order.tickets.length > 1 ? "s" : ""}:</p><ul>${links}</ul><p>show the qr at the door.</p>`);
  return order;
}
