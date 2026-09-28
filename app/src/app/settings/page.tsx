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
    await prisma.user.update({ where: { id: u.id }, data: { name: String(fd.get("name") || "") || null, role: String(fd.get("role") || "") || null, company: String(fd.get("company") || "") || null, city: String(fd.get("city") || "berlin"), onGuestList: fd.get("guest") === "on", badge: String(fd.get("badge") || "") || null } });
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
          <button className="btn" type="submit">save</button>
        </div>
        <div className="stack">
          <div className="panel"><div className="ph"><span>payouts</span><span className="chip o">next</span></div><div className="pb"><p style={{ fontSize: 14 }}>stripe connect for host payouts lands in the next build. until then the platform account collects and pays out manually two days after each event.</p></div></div>
          <div className="panel"><div className="ph"><span>notifications</span></div><div className="pb"><div className="toggle"><div>communities i follow post an event<small>email</small></div><span className="chip o">on</span></div><div className="toggle"><div>monday city email<small>{user.city ?? "berlin"}</small></div><span className="chip o">on</span></div><div className="toggle"><div>ticket and receipt emails<small>always</small></div><span className="chip o">on</span></div></div></div>
        </div>
      </form>
    </Shell>
  );
}
