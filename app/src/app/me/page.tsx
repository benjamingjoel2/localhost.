import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { fmtDate } from "@/lib/util";

export default async function Me() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/me");
  const uid = session.user.id;
  const [tickets, communities] = await Promise.all([
    prisma.ticket.findMany({ where: { order: { OR: [{ userId: uid }, { email: session.user.email! }] } }, include: { event: true, tier: true }, orderBy: { createdAt: "desc" } }),
    prisma.community.findMany({ where: { OR: [{ ownerId: uid }, { members: { some: { userId: uid } } }] }, include: { events: { orderBy: { startsAt: "desc" } } } }),
  ]);
  return (
    <main className="wrap">
      <div className="split"><h1>{session.user.email}</h1><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="btn ghost">log out</button></form></div>
      <section className="sec"><h2>your tickets</h2>
        <div className="list" style={{ marginTop: 14 }}>
          {tickets.length === 0 && <div><span className="dim">no tickets yet.</span></div>}
          {tickets.map((t) => <Link key={t.id} href={`/t/${t.code}`}><div className="when">{fmtDate(t.event.startsAt)}</div><div className="what"><b>{t.event.title}</b><span>{t.tier.name} · <span className="keep">{t.code}</span></span></div><span className="chip">{t.checkedInAt ? "checked in" : "ticket"}</span></Link>)}
        </div>
      </section>
      <section className="sec"><div className="split"><h2>you host</h2><Link className="arrow" href="/create">create event</Link></div>
        <div className="list" style={{ marginTop: 14 }}>
          {communities.length === 0 && <div><span className="dim">no communities yet.</span></div>}
          {communities.flatMap((c) => c.events.map((e) => <Link key={e.id} href={`/host/${e.id}`}><div className="when">{fmtDate(e.startsAt)}</div><div className="what"><b>{e.title}</b><span>{c.name} · {e.published ? "published" : "draft"}</span></div><span className="chip">manage</span></Link>))}
        </div>
      </section>
    </main>
  );
}
