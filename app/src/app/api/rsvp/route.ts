import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { assertAvailable, fulfilOrder } from "@/lib/orders";

const Body = z.object({ eventId: z.string(), tierId: z.string(), qty: z.number().int().min(1).max(10), name: z.string().min(1), email: z.string().email(), company: z.string().nullish(), role: z.string().nullish(), onGuestList: z.boolean() });

export async function POST(req: Request) {
  try {
    const input = Body.parse(await req.json());
    const tier = await assertAvailable(input.tierId, input.qty);
    if (tier.priceMinor > 0) return NextResponse.json({ error: "this tier is paid; use checkout" }, { status: 400 });
    const session = await auth();
    const order = await fulfilOrder({ ...input, userId: session?.user?.id }, { amountMinor: 0, paid: true });
    return NextResponse.json({ url: `/t/${order.tickets[0].code}` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "invalid request" }, { status: 400 });
  }
}
