import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { fmtDate, money } from "@/lib/util";
import { blast, publish, rotatePin } from "./actions";

export default async function Host({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/host/${id}`);
  const e = await prisma.event.findFirst({
    where: { id, community: { OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }] } },
    include: { community: true, tiers: { include: { _count: { select: { tickets: true } } } }, tickets: { include: { order: true, tier: true }, orderBy: { createdAt: "desc" } }, orders: { where: { paid: true }, select: { amountMinor: true } } },
  });
  if (!e) redirect("/me");
  const paidTickets = e.tickets.filter((t) => t.order.amountMinor > 0);
  const gross = e.orders.reduce((a, o) => a + o.amountMinor, 0);
  const checked = e.tickets.filter((t) => t.checkedInAt).length;
  const publishBound = publish.bind(null, e.id), blastBound = blast.bind(null, e.id), rotateBound = rotatePin.bind(null, e.id);
  return (
    <main className="wrap">
      <span className="small">host view · {e.community.name}</span>
      <div className="split"><h1>{e.title}</h1><div className="chips" style={{ gap: 8 }}><Link className="btn ghost" href={`/${e.city}/${e.slug}`}>view page</Link><Link className="btn ghost" href={`/host/${e.id}/scan`}>scan</Link>{!e.published && <form action={publishBound}><button className="btn">publish</button></form>}</div></div>
      {!e.published && <p className="ok">draft. publishing lists it in {e.city} and emails your followers.</p>}
      <div className="stats" style={{ marginTop: 20 }}>
        <div className="stat"><div className="k">tickets</div><div className="v">{e.tickets.length}</div></div>
        <div className="stat"><div className="k">checked in</div><div className="v">{checked}</div></div>
        <div className="stat"><div className="k">paid tickets</div><div className="v">{paidTickets.length}</div></div>
        <div className="stat"><div className="k">gross</div><div className="v">{money(Math.round(gross), e.currency)}</div></div>
      </div>
      <div className="side" style={{ marginTop: 24 }}>
        <div className="box" style={{ padding: 0 }}>
          <div className="row" style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)" }}><b>attendees</b><span className="small">{fmtDate(e.startsAt)}</span></div>
          <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>name</th><th>tier</th><th>code</th><th>check-in</th></tr></thead><tbody>
            {e.tickets.map((t) => <tr key={t.id}><td><b>{t.order.name}</b><br /><span className="dim">{[t.order.role, t.order.company].filter(Boolean).join(" · ")}</span></td><td>{t.tier.name}</td><td className="keep">{t.code}</td><td>{t.checkedInAt ? fmtDate(t.checkedInAt) : <span className="dim">not yet</span>}</td></tr>)}
            {e.tickets.length === 0 && <tr><td colSpan={4} className="dim">no tickets yet.</td></tr>}
          </tbody></table></div>
        </div>
        <div className="stack">
          <form action={blastBound} className="box stack"><b>send a blast</b><div className="field"><textarea name="text" placeholder="doors are on the side entrance. wi-fi: factory / tinkerers" /></div><div className="row"><span className="small">to {new Set(e.tickets.map((t) => t.order.email)).size} people by email</span><button className="btn" type="submit">send</button></div></form>
          <div className="box fill"><b>door check-in</b><p style={{ fontSize: 14, marginTop: 6 }}>your crew opens <span className="keep">/host/{e.id}/scan</span> on any phone and enters the pin.</p><div className="row" style={{ marginTop: 12 }}><span style={{ fontSize: 30, fontWeight: 800, letterSpacing: ".1em" }}>{e.checkinPin}</span><form action={rotateBound}><button className="chip" style={{ background: "var(--bg)", color: "var(--fg)" }}>rotate pin</button></form></div></div>
          <div className="box"><b>tiers</b>{e.tiers.map((t) => <div className="row" key={t.id} style={{ marginTop: 8, fontSize: 14 }}><span>{t.name} · {money(t.priceMinor, e.currency)}</span><span className="dim">{t._count.tickets}{t.capacity ? ` / ${t.capacity}` : ""}</span></div>)}</div>
        </div>
      </div>
    </main>
  );
}
