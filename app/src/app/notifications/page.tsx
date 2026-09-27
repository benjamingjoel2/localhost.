import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { fmtDate } from "@/lib/util";
import { Shell } from "@/components/shell";

export default async function Notifications() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/notifications");
  const [posted, tickets] = await Promise.all([
    prisma.event.findMany({ where: { published: true, community: { followers: { some: { userId: user.id } } } }, include: { community: true }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.ticket.findMany({ where: { order: { OR: [{ userId: user.id }, { email: user.email }] } }, include: { event: true }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const items = [
    ...posted.map((e) => ({ at: e.createdAt, icon: "◎", text: <><b>{e.community.name}</b> posted {e.title}</>, sub: `${fmtDate(e.startsAt)} · you follow them`, href: `/${e.city}/${e.slug}` })),
    ...tickets.map((t) => ({ at: t.createdAt, icon: "▣", text: <>your ticket for <b>{t.event.title}</b> is ready</>, sub: t.code, href: `/t/${t.code}` })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  return (
    <Shell current="/" user={user}>
      <div className="h"><div><h1>notifications</h1></div></div>
      <div className="panel" style={{ maxWidth: 720 }}><div className="pb">{items.length === 0 && <p className="dim">nothing yet. follow a community or get a ticket.</p>}{items.map((n, i) => <Link className="notif" key={i} href={n.href}><i>{n.icon}</i><div>{n.text}<small>{n.sub}</small></div></Link>)}</div></div>
    </Shell>
  );
}
