import Link from "next/link";

const NAV = [
  ["/", "explore", "⌂"],
  ["/tickets", "tickets", "▣"],
  ["/host", "host", "✦"],
  ["/communities", "communities", "◎"],
  ["/settings", "settings", "⚙"],
] as const;

export function Shell({ children, current, user }: { children: React.ReactNode; current: string; user?: { email: string; name?: string | null } | null }) {
  const initials = (user?.name ?? user?.email ?? "?").slice(0, 2);
  return (
    <div className="app">
      <aside className="side">
        <Link className="logo" href="/">&gt;localhost</Link>
        {NAV.map(([h, n, i]) => <Link key={h} className="nav" href={h} aria-current={current === h ? "page" : undefined}><i>{i}</i>{n}</Link>)}
        <div className="grow" />
        <Link className="btn" href="/create" style={{ margin: "0 8px 12px" }}>create event</Link>
        {user ? <div className="me"><span className="avatar">{initials}</span><div><b>{user.name ?? user.email.split("@")[0]}</b>{user.email}</div></div> : <Link className="me" href="/login"><span className="avatar">?</span><div><b>log in</b>tickets, hosting, follows</div></Link>}
      </aside>
      <div className="main">
        <div className="topbar">
          <form action="/" method="get"><input name="q" placeholder="search events, communities, people" aria-label="search" /></form>
          <div className="actions"><Link className="btn ghost sm" href="/notifications">🔔</Link><Link className="btn sm" href="/create">create</Link></div>
        </div>
        <div className="content reveal">{children}</div>
      </div>
      <nav className="tabbar">{NAV.map(([h, n, i]) => <Link key={h} href={h} aria-current={current === h ? "page" : undefined}><i>{i}</i>{n}</Link>)}</nav>
    </div>
  );
}
