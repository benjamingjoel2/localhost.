import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
import { cityName, fmtDate } from "@/lib/util";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const user = await currentUser();
  const c = await prisma.community.findUnique({ where: { slug }, include: { events: { where: { published: true }, orderBy: { startsAt: "desc" } }, _count: { select: { followers: true, events: true } }, followers: session?.user?.id ? { where: { userId: session.user.id } } : false } });
  if (!c) notFound();
  const following = Array.isArray(c.followers) && c.followers.length > 0;
  const upcoming = c.events.filter((e) => e.startsAt >= new Date()).reverse();
  const past = c.events.filter((e) => e.startsAt < new Date());
  async function toggle() {
    "use server";
    const s = await auth();
    if (!s?.user?.id) redirect(`/login?next=/c/${slug}`);
    const key = { communityId_userId: { communityId: c!.id, userId: s.user.id } };
    const ex = await prisma.follow.findUnique({ where: key });
    if (ex) await prisma.follow.delete({ where: key }); else await prisma.follow.create({ data: { communityId: c!.id, userId: s.user.id } });
    revalidatePath(`/c/${slug}`);
  }
  return (
    <Shell current="/communities" user={user}><main>
      <span className="small">localhost/c/{c.slug} · {cityName(c.city)}</span>
      <div className="h"><h1>{c.name}</h1><form action={toggle}><button className={following ? "btn ghost" : "btn"}>{following ? "following" : `follow · ${c._count.followers}`}</button></form></div>
      {c.description && <p className="dim keep" style={{ maxWidth: "60ch" }}>{c.description}</p>}
      {c.source === "LUMA" && <p className="note" style={{ marginTop: 8 }}>mirrored from <a href={c.externalUrl ?? "https://luma.com"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>luma</a>. run this community? <a href="mailto:hello@localhost.events?subject=claim%20my%20community" style={{ textDecoration: "underline" }}>claim it</a> and host your next one here for free.</p>}
      <p className="note" style={{ marginTop: 8 }}>followers get an email the moment {c.name} publishes an event.</p>
      <section className="sec"><h2>upcoming</h2><div className="list" style={{ marginTop: 14 }}>{upcoming.length === 0 && <div><span className="dim">nothing scheduled.</span></div>}{upcoming.map((e) => <Link key={e.id} href={`/${e.city}/${e.slug}`}><div className="when">{fmtDate(e.startsAt)}</div><div className="what"><b>{e.title}</b><span>{e.venue ?? cityName(e.city)}</span></div><span className="chip">{e.type.toLowerCase().replace("_", " ")}</span></Link>)}</div></section>
      {past.length > 0 && <section className="sec"><h2>past</h2><div className="list" style={{ marginTop: 14 }}>{past.map((e) => <Link key={e.id} href={`/${e.city}/${e.slug}`}><div className="when">{fmtDate(e.startsAt)}</div><div className="what"><b>{e.title}</b></div><span className="small">past</span></Link>)}</div></section>}
    </main></Shell>
  );
}
