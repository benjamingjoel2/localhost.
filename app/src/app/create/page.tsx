import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { CITIES } from "@/lib/util";
import { createEvent } from "./actions";

export default async function Create() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/create");
  const communities = await prisma.community.findMany({ where: { OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }] } });
  return (
    <main className="wrap" style={{ maxWidth: 820 }}>
      <h1>create event</h1>
      <p className="dim" style={{ marginTop: 8 }}>free events are free. paid tiers carry 3.5% + 0.30. you can edit after publishing.</p>
      <form action={createEvent} className="stack" style={{ marginTop: 24, gap: 24 }}>
        <div className="box stack">
          <b>community (host)</b>
          <div className="field"><label>host as</label>
            <select name="communityId" defaultValue={communities[0]?.id ?? "new"}>{communities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="new">+ new community</option></select></div>
          <div className="field"><label>new community name (if new)</label><input name="communityName" placeholder="berlin builders" /></div>
        </div>
        <div className="box stack">
          <b>basics</b>
          <div className="field"><label>title</label><input name="title" required placeholder="demo night #13 — agents that ship" /></div>
          <div className="fields2">
            <div className="field"><label>city</label><select name="city" defaultValue="berlin">{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
            <div className="field"><label>type</label><select name="type" defaultValue="MEETUP"><option value="MEETUP">meetup</option><option value="HACKATHON">hackathon</option><option value="CONFERENCE">conference</option><option value="DEMO_DAY">demo day</option><option value="WORKSHOP">workshop</option><option value="LAUNCH">launch party</option><option value="DINNER">founder dinner</option><option value="OTHER">other tech</option></select></div>
          </div>
          <div className="fields2"><div className="field"><label>starts</label><input name="startsAt" type="datetime-local" required /></div><div className="field"><label>ends</label><input name="endsAt" type="datetime-local" /></div></div>
          <div className="fields2"><div className="field"><label>venue</label><input name="venue" placeholder="factory berlin" /></div><div className="field"><label>address</label><input name="address" placeholder="lohmühlenstraße 65" /></div></div>
          <div className="field"><label>description</label><textarea name="description" placeholder="what happens, who it's for, what to bring." /></div>
        </div>
        <div className="box stack">
          <div className="row"><b>tickets</b><div className="field" style={{ width: 120 }}><label>currency</label><select name="currency" defaultValue="EUR"><option>EUR</option><option>USD</option><option>GBP</option></select></div></div>
          {[["general", "", ""], ["early bird", "", ""], ["student", "0", ""]].map(([n, p, c], i) => (
            <div className="fields2" key={i} style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
              <div className="field"><label>tier {i + 1} name</label><input name="tierName" defaultValue={i === 0 ? n : ""} placeholder={n} /></div>
              <div className="field"><label>price (0 = free)</label><input name="tierPrice" type="number" min={0} step="0.01" defaultValue={p} placeholder="15" /></div>
              <div className="field"><label>capacity</label><input name="tierCap" type="number" min={1} defaultValue={c} placeholder="∞" /></div>
            </div>
          ))}
          <p className="note">leave a tier name blank to skip it. paid tiers need stripe keys on the server.</p>
        </div>
        <button className="btn" type="submit">save draft</button>
      </form>
    </main>
  );
}
