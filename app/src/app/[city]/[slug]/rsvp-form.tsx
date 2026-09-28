"use client";
import { useState } from "react";

type Tier = { id: string; name: string; priceMinor: number; left: number | null; label: string };
export function RsvpForm({ eventId, tiers, stripeOn, defaultEmail, defaults }: { eventId: string; tiers: Tier[]; currency: string; stripeOn: boolean; defaultEmail: string; defaults?: { name: string; company: string; role: string } }) {
  const [tierId, setTierId] = useState(tiers.find((t) => t.left !== 0)?.id ?? "");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const tier = tiers.find((t) => t.id === tierId);
  const paid = (tier?.priceMinor ?? 0) > 0;
  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault(); setBusy(true); setErr("");
    const fd = new FormData(ev.currentTarget);
    const body = { eventId, tierId, qty, name: fd.get("name"), email: fd.get("email"), company: fd.get("company"), role: fd.get("role"), onGuestList: fd.get("guest") === "on" };
    const r = await fetch(paid ? "/api/checkout" : "/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error ?? "something went wrong"); setBusy(false); return; }
    window.location.href = j.url;
  }
  if (tiers.length === 0) return <p className="dim">no tickets yet.</p>;
  return (
    <form onSubmit={submit} className="stack">
      <div>
        {tiers.map((t) => (
          <label key={t.id} className="tier" style={{ cursor: t.left === 0 ? "not-allowed" : "pointer", opacity: t.left === 0 ? 0.5 : 1 }}>
            <div><b>{t.name}</b><small>{t.left === 0 ? "sold out" : t.left == null ? "" : `${t.left} left`}</small></div>
            <span style={{ fontWeight: 700 }}>{t.label}</span>
            <input type="radio" name="tier" checked={tierId === t.id} disabled={t.left === 0} onChange={() => setTierId(t.id)} />
          </label>
        ))}
      </div>
      <div className="field"><label>how many</label><input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Number(e.target.value))} /></div>
      <div className="field"><label>name</label><input name="name" required defaultValue={defaults?.name} placeholder="amara okafor" /></div>
      <div className="field"><label>email · ticket goes here</label><input name="email" type="email" required defaultValue={defaultEmail} placeholder="amara@company.com" /></div>
      <div className="fields2"><div className="field"><label>company</label><input name="company" defaultValue={defaults?.company} /></div><div className="field"><label>role</label><input name="role" defaultValue={defaults?.role} /></div></div>
      <label style={{ display: "flex", gap: 8, fontSize: 14 }}><input type="checkbox" name="guest" defaultChecked /> show me on the guest list</label>
      {paid && !stripeOn && <p className="err">paid tickets need stripe keys on the server. free tiers still work.</p>}
      {err && <p className="err">{err}</p>}
      <button className="btn" disabled={busy || !tier || (paid && !stripeOn)} type="submit">{busy ? "…" : paid ? `pay ${tier?.label} × ${qty}` : "get free ticket"}</button>
      <p className="note">one flat platform fee is included in paid prices. no separate service charge. tickets and receipts are emailed instantly.</p>
    </form>
  );
}
