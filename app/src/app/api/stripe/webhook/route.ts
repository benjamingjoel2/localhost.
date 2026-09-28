import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { fulfilOrder } from "@/lib/orders";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "webhook not configured" }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `bad signature: ${e instanceof Error ? e.message : ""}` }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const m = s.metadata ?? {};
    const exists = await prisma.order.findUnique({ where: { stripeSessionId: s.id } });
    if (!exists && m.eventId && m.tierId) {
      await fulfilOrder(
        { eventId: m.eventId, tierId: m.tierId, qty: Number(m.qty ?? 1), name: m.name ?? "", email: s.customer_details?.email ?? m.email ?? "", company: m.company || null, role: m.role || null, onGuestList: m.onGuestList === "true", userId: m.userId || null },
        { amountMinor: s.amount_total ?? 0, paid: true, stripeSessionId: s.id },
      );
    }
  }
  return NextResponse.json({ received: true });
}
