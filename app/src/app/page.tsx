import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { CITIES, cityName, fmtDate, priceLabel, goingCount, sourceLabel } from "@/lib/util";
import { Shell } from "@/components/shell";

const TYPES = [["all", "all"], ["MEETUP", "meetups"], ["HACKATHON", "hackathons"], ["DEMO_DAY", "demo days"], ["CONFERENCE", "conferences"], ["WORKSHOP", "workshops"]] as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ city?: string; type?: string; q?: string; free?: string }> }) {
  const sp = await searchParams;
  const user = await currentUser();
  const city = sp.city ?? user?.city ?? "berlin";
  const type = sp.type && sp.type !== "all" ? sp.type : undefined;
  const events = await prisma.event.findMany({
    where: { published: true, startsAt: { gte: new Date() }, ...(city !== "all" ? { city } : {}), ...(type ? { type: type as never } : {}), ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}) },
    orderBy: { startsAt: "asc" }, take: 30,
    include: { community: true, tiers: { orderBy: { order: "asc" } }, _count: { select: { tickets: true } } },
  });
  const follows = user ? await prisma.follow.findMany({ where: { userId: user.id }, include: { community: { include: { events: { where: { published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 } } } } }) : [];
  const q = (o: Record<string, string | undefined>) => "/?" + new URLSearchParams(Object.fromEntries(Object.entries({ city, type: sp.type, q: sp.q, ...o }).filter(([, v]) => v)) as Record<string, string>).toString();
  return (
    <Shell current="/" user={user}>
      <div className="h"><div><h1>this week in {city === "all" ? "every city" : cityName(city)}</h1><p>{events.length} upcoming · every scene · from localhost, luma, meetup and eventbrite{follows.length ? ` · ${follows.length} communities you follow` : ""}</p></div>
        <div className="chips" style={{ gap: 8 }}>{CITIES.slice(0, 4).map((c) => <Link key={c.slug} className={"pill"} href={q({ city: c.slug })} style={city === c.slug ? { background: "var(--ink)", color: "var(--paper)" } : {}}>{c.name}</Link>)}<Link className="pill" href={q({ city: "all" })}>all cities</Link></div></div>
      <div className="seg" style={{ maxWidth: 720, marginBottom: 18 }}>{TYPES.map(([v, n]) => <Link key={v} href={q({ type: v })} aria-current={(sp.type ?? "all") === v ? "page" : undefined}>{n}</Link>)}</div>
      {events.length === 0 && <p className="ok">nothing indexed for that filter yet. we check luma, meetup and eventbrite every morning. <Link href={q({ type: "all", q: undefined })} style={{ textDecoration: "underline" }}>show all types</Link>, <Link href={q({ city: "all" })} style={{ textDecoration: "underline" }}>try every city</Link>, or <Link href="/create" style={{ textDecoration: "underline" }}>host the first one</Link>.</p>}
      <div className="cardgrid">
        {events.map((e) => (
          <Link key={e.id} className="ecard" href={`/${e.city}/${e.slug}`}>
            <div className="ph">{e.cover ? <img src={e.cover} alt="" /> : null}<span className="chip">{e.type.toLowerCase().replace("_", " ")}</span>{e.source !== "LOCALHOST" && <span className="chip src">on {sourceLabel(e.source)}</span>}</div>
            <div className="b"><b>{e.title}</b><span>{cityName(e.city)} · {fmtDate(e.startsAt)} · {e.community.name}</span><div className="row"><span className="small">{goingCount(e)} going</span><span className="chip o">{priceLabel(e)}</span></div></div>
          </Link>
        ))}
      </div>
      {follows.length > 0 && (
        <div className="two-col" style={{ marginTop: 24 }}>
          <div className="panel"><div className="ph"><span>communities you follow</span><Link className="small" href="/communities">all</Link></div><div className="pb">{follows.map((f) => <div className="person" key={f.communityId}><span className="avatar">{f.community.name.slice(0, 2)}</span><div><b>{f.community.name}</b><span>{f.community.events[0] ? `next: ${f.community.events[0].title}` : "nothing scheduled"}</span></div><Link className="pill" href={`/c/${f.community.slug}`}>open</Link></div>)}</div></div>
          <div className="panel"><div className="ph"><span>monday email</span><span className="small">weekly</span></div><div className="pb"><p style={{ fontSize: 14 }}>every monday 08:00: this week&apos;s tech events in {cityName(city)}, from the communities you follow first.</p><Link className="btn ghost sm" href="/settings" style={{ marginTop: 10 }}>manage in settings</Link></div></div>
        </div>
      )}
    </Shell>
  );
}
