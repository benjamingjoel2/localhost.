import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { cityName, fmtDate } from "@/lib/util";
import { Shell } from "@/components/shell";

export default async function Tickets() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/tickets");
  const tickets = await prisma.ticket.findMany({ where: { order: { OR: [{ userId: user.id }, { email: user.email }] } }, include: { event: true, tier: true, order: true }, orderBy: { event: { startsAt: "asc" } } });
  const now = new Date();
  const up = tickets.filter((t) => t.event.startsAt >= now), past = tickets.filter((t) => t.event.startsAt < now).reverse();
  const next = up[0];
  const qr = next ? await QRCode.toDataURL(next.code, { margin: 1, width: 300 }) : null;
  const row = (t: (typeof tickets)[number]) => <Link key={t.id} href={`/t/${t.code}`}><div className="when">{fmtDate(t.event.startsAt)}</div><div className="what"><b>{t.event.title}</b><span>{t.tier.name} · {t.event.venue ?? cityName(t.event.city)} · <span className="keep">{t.code}</span></span></div><span className="chip">{t.checkedInAt ? "checked in" : "qr"}</span></Link>;
  return (
    <Shell current="/tickets" user={user}>
      <div className="h"><div><h1>your tickets</h1><p>{up.length} upcoming · {past.length} past</p></div></div>
      <div className="two-col">
        <div>
          <div className="list">{up.length === 0 && <div><span className="dim">no upcoming tickets. <Link href="/" style={{ textDecoration: "underline" }}>find something.</Link></span></div>}{up.map(row)}</div>
          {past.length > 0 && <><h2 style={{ margin: "28px 0 12px" }}>past</h2><div className="list">{past.map(row)}</div></>}
        </div>
        {next && qr && (
          <div className="panel"><div className="ph"><span>next up</span><span className="small">{fmtDate(next.event.startsAt)}</span></div><div className="pb">
            <div className="wallet"><span className="small" style={{ color: "rgba(244,241,234,.7)" }}>{next.tier.name} · 1 ticket</span><b style={{ fontSize: 20, letterSpacing: "-.03em", lineHeight: 1.1 }}>{next.event.title}</b><span style={{ fontSize: 13 }}>{fmtDate(next.event.startsAt)} · {next.event.venue ?? cityName(next.event.city)}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`qr ${next.code}`} width={180} height={180} style={{ background: "#fff", padding: 6, margin: "8px auto 0" }} /><span className="small keep" style={{ color: "rgba(244,241,234,.7)", textAlign: "center" }}>{next.code}</span></div>
            <div className="chips" style={{ marginTop: 12, gap: 6 }}><Link className="pill" href={`/t/${next.code}`}>open ticket</Link><Link className="pill" href={`/${next.event.city}/${next.event.slug}`}>event page</Link></div>
            <div className="toggle" style={{ marginTop: 10 }}><div>on the guest list<small>{next.order.onGuestList ? `as ${next.order.name}${next.order.role ? " · " + next.order.role : ""}${next.order.company ? " · " + next.order.company : ""}` : "hidden"}</small></div><span className="chip o">{next.order.onGuestList ? "on" : "off"}</span></div>
          </div></div>
        )}
      </div>
    </Shell>
  );
}
