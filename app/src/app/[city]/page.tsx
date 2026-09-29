import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
import { CITIES, cityName, fmtDate, priceLabel, sourceLabel } from "@/lib/util";

export default async function City({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  if (!CITIES.some((c) => c.slug === city)) notFound();
  const user = await currentUser();
  const [events, communities] = await Promise.all([
    prisma.event.findMany({ where: { city, published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, include: { community: true, tiers: true } }),
    prisma.community.findMany({ where: { city }, include: { _count: { select: { followers: true, events: true } } } }),
  ]);
  return (
    <Shell current="/" user={user}><main>
      <span className="small">localhost/{city}</span>
      <h1>{cityName(city)}</h1>
      <section className="sec"><div className="split"><h2>upcoming</h2><Link className="arrow" href="/create">host one here</Link></div>
        <div className="list">
          {events.length === 0 && <div><span className="dim">no events yet. be the first community to claim {cityName(city)}.</span></div>}
          {events.map((e) => <Link key={e.id} href={`/${city}/${e.slug}`}><div className="when">{fmtDate(e.startsAt)}</div><div className="what"><b>{e.title}</b><span>{e.venue ?? "venue tba"} / {e.community.name}</span></div><div className="chips"><span className="chip">{e.type.toLowerCase().replace("_", " ")}</span>{e.source !== "LOCALHOST" && <span className="chip src">{sourceLabel(e.source)}</span>}<span className="chip">{priceLabel(e)}</span></div></Link>)}
        </div>
      </section>
      <section className="sec"><h2>communities</h2>
        <div className="grid" style={{ marginTop: 18 }}>
          {communities.map((c) => <Link className="cell" key={c.id} href={`/c/${c.slug}`}><span className="small">{c._count.followers} followers · {c._count.events} events</span><h3>{c.name}</h3></Link>)}
          <Link className="cell" href="/create" style={{ borderStyle: "dashed" }}><span className="small">free forever</span><h3>start one</h3></Link>
        </div>
      </section>
    </main></Shell>
  );
}
