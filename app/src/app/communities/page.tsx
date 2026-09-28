import Link from "next/link";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { cityName } from "@/lib/util";
import { Shell } from "@/components/shell";

export default async function Communities({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "following" } = await searchParams;
  const user = await currentUser();
  const city = user?.city ?? "berlin";
  const where = tab === "following" && user ? { followers: { some: { userId: user.id } } } : tab === "run" && user ? { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] } : { city };
  const list = await prisma.community.findMany({ where, include: { _count: { select: { followers: true, events: true } }, events: { where: { published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 } }, orderBy: { createdAt: "desc" } });
  return (
    <Shell current="/communities" user={user}>
      <div className="h"><div><h1>communities</h1><p>the ones you follow, the ones you run, and the ones in your city.</p></div><Link className="btn ghost" href="/create">claim a community</Link></div>
      <div className="tabs">{[["following", "following"], ["run", "you run"], ["city", `in ${cityName(city)}`]].map(([t, n]) => <Link key={t} href={`/communities?tab=${t}`} aria-current={tab === t ? "page" : undefined}>{n}</Link>)}</div>
      {list.length === 0 && <p className="ok">{tab === "city" ? "no communities here yet." : tab === "run" ? "you don't run one yet." : "you don't follow anyone yet."} <Link href={tab === "city" ? "/create" : "/communities?tab=city"} style={{ textDecoration: "underline" }}>{tab === "city" ? "start one." : "browse your city."}</Link></p>}
      <div className="cardgrid">
        {list.map((c) => <Link key={c.id} className="ecard" href={`/c/${c.slug}`}><div className="ph">{c.events[0]?.cover ? <img src={c.events[0].cover} alt="" /> : null}<span className="chip">{cityName(c.city)}</span></div><div className="b"><b>{c.name}</b><span>{c._count.followers} followers · {c._count.events} events</span><div className="row"><span className="small">{c.events[0] ? `next: ${c.events[0].title}` : "nothing scheduled"}</span></div></div></Link>)}
      </div>
    </Shell>
  );
}
