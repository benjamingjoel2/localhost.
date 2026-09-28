import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
import { fmtDate, money, sum } from "@/lib/util";
import { blast, publish, rotatePin } from "./actions";

export default async function Host({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/host/${id}`);
  const user = await currentUser();
  const e = await prisma.event.findFirst({
    where: { id, community: { OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }] } },
    include: { community: true, tiers: { include: { _count: { select: { tickets: true } } } }, tickets: { include: { order: true, tier: true }, orderBy: { createdAt: "desc" } }, orders: { where: { paid: true }, select: { amountMinor: true } } },
  });
  if (!e) redirect("/host");
  const paidTickets = e.tickets.filter((t) => t.order.amountMinor > 0);
  const gross = e.orders.reduce((a, o) => a + o.amountMinor, 0);
  const checked = e.tickets.filter((t) => t.checkedInAt).length;
  const publishBound = publish.bind(null, e.id), blastBound = blast.bind(null, e.id), rotateBound = rotatePin.bind(null, e.id);
  return (
    <Shell current="/host" user={user}><main>
      <Link className="small" href="/host">← host</Link>
      <div className="h"><h1>{e.title}</h1><div className="chips" style={{ gap: 8 }}><Link className="btn ghost" href={`/${e.city}/${e.slug}`}>view page</Link><Link className="btn ghost" href={`/host/${e.id}/scan`}>scan</Link>{!e.published && <form action={publishBound}><button className="btn">publish</button></form>}</div></div>
      {!e.published && <p className="ok">draft. publishing lists it in {e.city} and emails your followers.</p>}
      <div className="kpis" style={{ marginTop: 8 }}>
        <div className="kpi"><div className="k">tickets</div><div className="v">{e.tickets.length}</div></div>
        <div className="kpi"><div className="k">checked in</div><div className="v">{checked}</div></div>
        <div className="kpi"><div className="k">paid tickets</div><div className="v">{paidTickets.length}</div></div>
        <div className="kpi"><div className="k">gross</div><div className="v">{sum(Math.round(gross), e.currency)}</div></div>
      </div>
      <div className="two-col" style={{ marginTop: 24 }}>
        <div className="panel">
          <div className="ph"><b>attendees</b><span className="small">{fmtDate(e.startsAt)}</span></div>
          <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>name</th><th>tier</th><th>code</th><th>check-in</th></tr></thead><tbody>
            {e.tickets.map((t) => <tr key={t.id}><td><b>{t.order.name}</b><br /><span className="dim">{[t.order.role, t.order.company].filter(Boolean).join(" · ")}</span></td><td>{t.tier.name}</td><td className="keep">{t.code}</td><td>{t.checkedInAt ? fmtDate(t.checkedInAt) : <span className="dim">not yet</span>}</td></tr>)}
            {e.tickets.length === 0 && <tr><td colSpan={4} className="dim">no tickets yet.</td></tr>}
          </tbody></table></div>
        </div>
        <div className="stack">
          <form action={blastBound} className="panel"><div className="ph"><b>send a blast</b></div><div className="pb stack"><div className="field"><textarea name="text" placeholder="doors are on the side entrance. wi-fi: factory / tinkerers" /></div><div className="row"><span className="small">to {new Set(e.tickets.map((t) => t.order.email)).size} people by email</span><button className="btn" type="submit">send</button></div></div></form>
          <div className="wallet"><b>door check-in</b><p style={{ fontSize: 14, marginTop: 6 }}>your crew opens <span className="keep">/host/{e.id}/scan</span> on any phone and enters the pin.</p><div className="row" style={{ marginTop: 12 }}><span style={{ fontSize: 30, fontWeight: 800, letterSpacing: ".1em" }}>{e.checkinPin}</span><form action={rotateBound}><button className="chip" style={{ background: "var(--bg)", color: "var(--fg)" }}>rotate pin</button></form></div></div>
          <div className="panel"><div className="ph"><b>tiers</b></div><div className="pb">{e.tiers.map((t) => <div className="row" key={t.id} style={{ marginTop: 8, fontSize: 14 }}><span>{t.name} · {money(t.priceMinor, e.currency)}</span><span className="dim">{t._count.tickets}{t.capacity ? ` / ${t.capacity}` : ""}</span></div>)}</div></div>
        </div>
      </div>
    </main></Shell>
  );
}
