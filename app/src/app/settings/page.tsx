import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { signOut } from "@/auth";
import { CITIES } from "@/lib/util";
import { Shell } from "@/components/shell";

export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login?next=/settings");
  async function save(fd: FormData) {
    "use server";
    const u = await currentUser(); if (!u) return;
    await prisma.user.update({ where: { id: u.id }, data: { name: String(fd.get("name") || "") || null, role: String(fd.get("role") || "") || null, company: String(fd.get("company") || "") || null, city: String(fd.get("city") || "berlin"), onGuestList: fd.get("guest") === "on", badge: String(fd.get("badge") || "") || null, interests: String(fd.get("interests") || "").trim().slice(0, 500) || null, digest: fd.get("digest") === "on" } });
    revalidatePath("/settings"); redirect("/settings?saved=1");
  }
  return (
    <Shell current="/settings" user={user}>
      <div className="h"><div><h1>settings</h1><p>one account for tickets, communities and hosting.</p></div><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="btn ghost">log out</button></form></div>
      {saved && <p className="ok" style={{ marginBottom: 14 }}>saved.</p>}
      <form action={save} className="two-col">
        <div className="stack">
          <div className="panel"><div className="ph"><span>profile</span></div><div className="pb stack">
            <div className="fields2"><div className="field"><label>name</label><input name="name" defaultValue={user.name ?? ""} /></div><div className="field"><label>email</label><input value={user.email} readOnly /></div></div>
            <div className="fields2"><div className="field"><label>role</label><input name="role" defaultValue={user.role ?? ""} placeholder="staff engineer" /></div><div className="field"><label>company</label><input name="company" defaultValue={user.company ?? ""} placeholder="pendel" /></div></div>
            <div className="field"><label>home city</label><select name="city" defaultValue={user.city ?? "berlin"}>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
          </div></div>
          <div className="panel"><div className="ph"><span>guest list defaults</span></div><div className="pb stack">
            <label className="check"><input type="checkbox" name="guest" defaultChecked={user.onGuestList} /> show me on guest lists, with role and company, to ticket holders of the same event</label>
            <div className="field"><label>badge flag</label><select name="badge" defaultValue={user.badge ?? ""}><option value="">none</option><option value="hiring">hiring</option><option value="looking">looking</option><option value="founder">founder</option></select></div>
          </div></div>
        </div>
        <div className="stack">
          <div className="panel"><div className="ph"><span>what to watch for</span><span className="chip o">new</span></div><div className="pb stack">
            <div className="field"><label>your interests, in your own words</label><textarea name="interests" rows={4} defaultValue={user.interests ?? ""} placeholder="ai infra and agents, rust, hardware, founder dinners. weeknights only. skip crypto." /></div>
            <label className="check"><input type="checkbox" name="digest" defaultChecked={user.digest} /> monday email: this week&apos;s events in {CITIES.find((c) => c.slug === (user.city ?? "berlin"))?.name ?? "your city"}, ranked by these interests</label>
            <p className="note">we read every event we index (localhost, luma, meetup, eventbrite) against this text each monday and send the ones that match. plain english works. it is also what your ai sees when you connect the <a href="/mcp" style={{ textDecoration: "underline" }}>mcp server</a>.</p>
          </div></div>
          <button className="btn" type="submit">save</button>
          <div className="panel"><div className="ph"><span>payouts</span><span className="chip o">next</span></div><div className="pb"><p style={{ fontSize: 14 }}>stripe connect for host payouts lands in the next build. until then the platform account collects and pays out manually two days after each event.</p></div></div>
          <div className="panel"><div className="ph"><span>notifications</span></div><div className="pb"><div className="toggle"><div>communities i follow post an event<small>email</small></div><span className="chip o">on</span></div><div className="toggle"><div>monday city email<small>{user.city ?? "berlin"}</small></div><span className="chip o">{user.digest ? "on" : "off"}</span></div><div className="toggle"><div>ticket and receipt emails<small>always</small></div><span className="chip o">on</span></div></div></div>
        </div>
      </form>
    </Shell>
  );
}
