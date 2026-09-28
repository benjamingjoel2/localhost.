import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { fmtDate, sum } from "@/lib/util";
import { Shell } from "@/components/shell";

export default async function HostHome({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "upcoming" } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login?next=/host");
  const communities = await prisma.community.findMany({ where: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] }, include: { _count: { select: { followers: true, events: true } }, events: { include: { _count: { select: { tickets: true } }, tiers: true, orders: { where: { paid: true }, select: { amountMinor: true, createdAt: true } }, tickets: { select: { checkedInAt: true } } }, orderBy: { startsAt: "asc" } } } });
  const events = communities.flatMap((c) => c.events.map((e) => ({ ...e, communityName: c.name })));
  const now = new Date(), month = new Date(now.getTime() - 30 * 864e5);
  const recent = events.flatMap((e) => e.orders).filter((o) => o.createdAt >= month && o.amountMinor > 0);
  const gross = recent.reduce((a, o) => a + o.amountMinor, 0);
  const tickets30 = events.reduce((a, e) => a + e._count.tickets, 0);
  const pastEvents = events.filter((e) => e.startsAt < now);
  const showup = pastEvents.length ? Math.round(100 * pastEvents.reduce((a, e) => a + e.tickets.filter((t) => t.checkedInAt).length, 0) / Math.max(1, pastEvents.reduce((a, e) => a + e.tickets.length, 0))) : null;
  const followers = communities.reduce((a, c) => a + c._count.followers, 0);
  const shown = events.filter((e) => tab === "drafts" ? !e.published : tab === "past" ? e.startsAt < now : e.published && e.startsAt >= now);
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(now.getTime() - (13 - i) * 864e5); return recent.filter((o) => o.createdAt.toDateString() === d.toDateString()).length; });
  const max = Math.max(1, ...days);
  return (
    <Shell current="/host" user={user}>
      <div className="h"><div><h1>host</h1><p>{communities.length ? communities.map((c) => c.name).join(" · ") : "you don't run a community yet"}{communities.length ? ` · ${followers} followers` : ""}</p></div><div className="chips" style={{ gap: 8 }}><Link className="btn" href="/create">create event</Link>{communities[0] && <Link className="btn ghost" href={`/c/${communities[0].slug}`}>community page</Link>}</div></div>
      <div className="kpis"><div className="kpi"><div className="k">tickets issued</div><div className="v">{tickets30}</div><div className="d">all events</div></div><div className="kpi"><div className="k">gross · 30d</div><div className="v">{communities[0]?.events[0] ? sum(gross, communities[0].events[0].currency) : "—"}</div><div className="d">{recent.length} paid orders</div></div><div className="kpi"><div className="k">show-up rate</div><div className="v">{showup == null ? "—" : `${showup}%`}</div><div className="d">past events</div></div><div className="kpi"><div className="k">followers</div><div className="v">{followers}</div><div className="d">across your communities</div></div></div>
      <div className="tabs" style={{ marginTop: 22 }}>{["upcoming", "drafts", "past"].map((t) => <Link key={t} href={`/host?tab=${t}`} aria-current={tab === t ? "page" : undefined}>{t}</Link>)}</div>
      <div className="list">
        {shown.length === 0 && <div><span className="dim">nothing here. <Link href="/create" style={{ textDecoration: "underline" }}>create an event.</Link></span></div>}
        {shown.map((e) => <Link key={e.id} href={`/host/${e.id}`}><div className="when">{fmtDate(e.startsAt)}</div><div className="what"><b>{e.title}</b><span>{e.published ? "published" : "draft"} · {e._count.tickets} tickets · {e.communityName}</span></div><div className="chips"><span className={"chip" + (e.published ? "" : " o")}>{e.published ? "live" : "draft"}</span><span className="chip o">manage</span></div></Link>)}
      </div>
      <div className="two-col" style={{ marginTop: 22 }}>
        <div className="panel"><div className="ph"><span>paid orders, last 14 days</span><span className="small">daily</span></div><div className="pb"><div className="spark">{days.map((d, i) => <i key={i} style={{ height: `${Math.max(4, (d / max) * 100)}%` }} />)}</div></div></div>
        <div className="panel"><div className="ph"><span>communities</span><Link className="small" href="/communities">all</Link></div><div className="pb">{communities.map((c) => <div className="person" key={c.id}><span className="avatar">{c.name.slice(0, 2)}</span><div><b>{c.name}</b><span>{c._count.followers} followers · {c._count.events} events</span></div><Link className="pill" href={`/c/${c.slug}`}>manage</Link></div>)}{communities.length === 0 && <p className="note">create an event and a community comes with it.</p>}</div></div>
      </div>
    </Shell>
  );
}
