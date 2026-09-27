import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
import { cityName, fmtDate, money } from "@/lib/util";
import { stripeEnabled } from "@/lib/stripe";
import { RsvpForm } from "./rsvp-form";

export default async function EventPage({ params }: { params: Promise<{ city: string; slug: string }> }) {
  const { city, slug } = await params;
  const session = await auth();
  const user = await currentUser();
  const e = await prisma.event.findUnique({
    where: { city_slug: { city, slug } },
    include: { community: { include: { _count: { select: { followers: true } } } }, tiers: { orderBy: { order: "asc" }, include: { _count: { select: { tickets: true } } } }, agenda: { orderBy: { order: "asc" } }, orders: { where: { onGuestList: true, paid: true }, select: { name: true, company: true, role: true }, take: 12 }, _count: { select: { tickets: true } } },
  });
  if (!e || (!e.published && !session)) notFound();
  const isHost = session?.user?.id === e.community.ownerId;
  return (
    <Shell current="/" user={user}><main className="two-col">
      <div>
        <span className="small">localhost/{city}/{slug} · hosted by <Link href={`/c/${e.community.slug}`} style={{ textDecoration: "underline" }}>{e.community.name}</Link></span>
        <div className="wallet" style={{ marginTop: 10, minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}>{e.cover && <img src={e.cover} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .5 }} />}<div style={{ position: "relative" }}>
          <h1>{e.title}</h1>
          <div className="chips" style={{ marginTop: 12 }}><span className="chip">{e.type.toLowerCase().replace("_", " ")}</span><span className="chip">{cityName(e.city)}</span>{!e.published && <span className="chip">draft</span>}</div></div>
        </div>
        {isHost && <p className="ok" style={{ marginTop: 12 }}>you host this event. <Link href={`/host/${e.id}`} style={{ textDecoration: "underline" }}>open the host view</Link></p>}
        <div className="fields2" style={{ marginTop: 16 }}>
          <div className="panel"><div className="pb"><span className="small">when</span><b style={{ display: "block", fontSize: 17, marginTop: 4 }}>{fmtDate(e.startsAt)}</b>{e.endsAt && <span className="dim">until {fmtDate(e.endsAt)}</span>}</div></div>
          <div className="panel"><div className="pb"><span className="small">where</span><b style={{ display: "block", fontSize: 17, marginTop: 4 }}>{e.venue ?? "venue announced to ticket holders"}</b><span className="dim">{e.address}</span></div></div>
        </div>
        {e.description && <p style={{ margin: "24px 0", maxWidth: "66ch", whiteSpace: "pre-wrap" }} className="keep">{e.description}</p>}
        {e.agenda.length > 0 && <section className="sec"><h2>agenda</h2><div className="list" style={{ marginTop: 14 }}>{e.agenda.map((a) => <div key={a.id}><div className="when">{a.time}</div><div className="what"><b>{a.title}</b></div><span className="small">{a.speaker}</span></div>)}</div></section>}
        <section className="sec"><h2>who&apos;s going</h2><p className="dim" style={{ marginTop: 6 }}>{e._count.tickets} going</p>
          <div className="list" style={{ marginTop: 14 }}>{e.orders.map((o, i) => <div key={i} style={{ gridTemplateColumns: "1fr auto" }}><div className="what"><b>{o.name}</b><span>{[o.role, o.company].filter(Boolean).join(" · ") || "attendee"}</span></div></div>)}{e.orders.length === 0 && <div><span className="dim">be the first.</span></div>}</div>
        </section>
      </div>
      <aside>
        <div className="panel">
          <div className="row" style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}><b className="small">tickets</b><span className="small">{e.published ? "selling" : "draft"}</span></div>
          <div style={{ padding: 16 }}>
            <RsvpForm eventId={e.id} currency={e.currency} stripeOn={stripeEnabled()} defaultEmail={user?.email ?? ""} defaults={{ name: user?.name ?? "", company: user?.company ?? "", role: user?.role ?? "" }} tiers={e.tiers.map((t) => ({ id: t.id, name: t.name, priceMinor: t.priceMinor, left: t.capacity == null ? null : Math.max(0, t.capacity - t._count.tickets), label: money(t.priceMinor, e.currency) }))} />
          </div>
        </div>
      </aside>
    </main></Shell>
  );
}
