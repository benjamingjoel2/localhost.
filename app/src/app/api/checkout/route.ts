import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { assertAvailable } from "@/lib/orders";
import { baseUrl } from "@/lib/util";

const Body = z.object({ eventId: z.string(), tierId: z.string(), qty: z.number().int().min(1).max(10), name: z.string().min(1), email: z.string().email(), company: z.string().nullish(), role: z.string().nullish(), onGuestList: z.boolean() });

export async function POST(req: Request) {
  try {
    const input = Body.parse(await req.json());
    const tier = await assertAvailable(input.tierId, input.qty);
    const session = await auth();
    const s = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: input.email,
      line_items: [{ quantity: input.qty, price_data: { currency: tier.event.currency.toLowerCase(), unit_amount: tier.priceMinor, product_data: { name: `${tier.event.title} — ${tier.name}` } } }],
      metadata: { ...input, qty: String(input.qty), onGuestList: String(input.onGuestList), userId: session?.user?.id ?? "", company: input.company ?? "", role: input.role ?? "" },
      success_url: `${baseUrl()}/orders/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl()}/${tier.event.city}/${tier.event.slug}`,
    });
    return NextResponse.json({ url: s.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "invalid request" }, { status: 400 });
  }
}
