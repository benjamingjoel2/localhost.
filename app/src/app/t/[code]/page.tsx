import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
import { cityName, fmtDate } from "@/lib/util";

export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await currentUser();
  const t = await prisma.ticket.findUnique({ where: { code }, include: { event: { include: { community: true } }, tier: true, order: true } });
  if (!t) notFound();
  const qr = await QRCode.toDataURL(t.code, { margin: 1, width: 320 });
  return (
    <Shell current="/tickets" user={user}><main style={{ maxWidth: 720 }}>
      <h1>you&apos;re in.</h1>
      <div className="wallet" style={{ marginTop: 20, gridTemplateColumns: "1fr auto", alignItems: "center" }}>
        <div>
          <span className="small" style={{ color: "rgba(245,244,240,.7)" }}>{t.tier.name} · 1 ticket</span>
          <h2 style={{ marginTop: 6 }}>{t.event.title}</h2>
          <p style={{ marginTop: 12, fontSize: 14 }}>{fmtDate(t.event.startsAt)}<br />{t.event.venue ?? cityName(t.event.city)}{t.event.address ? `, ${t.event.address}` : ""}</p>
          <p style={{ marginTop: 12, fontSize: 14 }}>{t.order.name}{t.order.role ? ` · ${t.order.role}` : ""}{t.order.company ? ` · ${t.order.company}` : ""}</p>
          <p className="small keep" style={{ marginTop: 12, color: "rgba(245,244,240,.6)" }}>{t.code}{t.checkedInAt ? " · checked in" : ""}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`qr for ${t.code}`} width={160} height={160} style={{ background: "#fff", padding: 6 }} />
      </div>
      <p className="note" style={{ marginTop: 14 }}>show this at the door. hosted by {t.event.community.name}.</p>
    </main></Shell>
  );
}
