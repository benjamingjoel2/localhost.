import Link from "next/link";
import { prisma } from "@/lib/db";
import { CITIES, cityName, fmtDate, money } from "@/lib/util";

export default async function Home() {
  const events = await prisma.event.findMany({
    where: { published: true, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 12,
    include: { community: true, tiers: { orderBy: { order: "asc" } } },
  });
  const counts = await prisma.event.groupBy({ by: ["city"], where: { published: true, startsAt: { gte: new Date() } }, _count: true });
  const count = (slug: string) => counts.find((c) => c.city === slug)?._count ?? 0;
  return (
    <main className="wrap">
      <h1>tech events, irl.</h1>
      <p className="dim" style={{ marginTop: 10, maxWidth: "48ch" }}>meetups, hackathons, demo days and the communities behind them. free if it&apos;s free.</p>
      <section className="sec">
        <div className="split"><h2>this week</h2><Link className="arrow" href="/create">host one</Link></div>
        <div className="list">
          {events.length === 0 && <div><span className="dim">nothing published yet.</span></div>}
          {events.map((e) => (
            <Link key={e.id} href={`/${e.city}/${e.slug}`}>
              <div className="when">{fmtDate(e.startsAt)}</div>
              <div className="what"><b>{e.title}</b><span>{cityName(e.city)} / {e.community.name}</span></div>
              <div className="chips"><span className="chip">{e.type.toLowerCase().replace("_", " ")}</span><span className="chip">{e.tiers[0] ? money(Math.min(...e.tiers.map((t) => t.priceMinor)), e.currency) : "free"}</span></div>
            </Link>
          ))}
        </div>
      </section>
      <section className="sec">
        <h2>cities</h2>
        <div className="grid" style={{ marginTop: 18 }}>
          {CITIES.map((c) => (
            <Link className="cell" key={c.slug} href={`/${c.slug}`}><span className="small">localhost/{c.slug}</span><h3>{c.name}</h3><span className="dim">{count(c.slug)} upcoming</span></Link>
          ))}
        </div>
      </section>
    </main>
  );
}
