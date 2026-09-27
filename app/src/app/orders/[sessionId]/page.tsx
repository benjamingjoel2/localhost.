import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function OrderDone({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const order = await prisma.order.findUnique({ where: { stripeSessionId: sessionId }, include: { tickets: true } });
  if (order) redirect(`/t/${order.tickets[0].code}`);
  return (
    <main className="wrap" style={{ maxWidth: 560 }}>
      <h1>payment received.</h1>
      <p className="dim" style={{ marginTop: 8 }}>your ticket is being issued. this page refreshes itself; your ticket is also on its way by email.</p>
      <meta httpEquiv="refresh" content="3" />
      <p style={{ marginTop: 20 }}><Link className="btn ghost" href="/me">your tickets</Link></p>
    </main>
  );
}
