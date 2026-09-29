import { Shell } from "@/components/shell";
import { currentUser } from "@/lib/session";
import { baseUrl } from "@/lib/util";

export default async function McpPage() {
  const user = await currentUser();
  const url = `${baseUrl()}/api/mcp`;
  const pre: React.CSSProperties = { background: "var(--ink)", color: "var(--paper)", padding: 14, borderRadius: 8, fontSize: 13, overflowX: "auto", whiteSpace: "pre" };
  return (
    <Shell current="/" user={user}><main>
      <span className="small">localhost/mcp</span>
      <h1>ask your ai what&apos;s on</h1>
      <p className="dim keep" style={{ maxWidth: "60ch" }}>localhost is an mcp server. plug it into claude, cursor or any mcp client and ask &quot;what tech events are on in sf this week?&quot; it searches every event we index: hosted here, and mirrored from luma, meetup and eventbrite.</p>
      <section className="sec"><h2>the url</h2><pre style={pre}>{url}</pre><p className="note">no key needed. read-only. streamable http.</p></section>
      <section className="sec"><h2>claude (web, desktop, mobile)</h2><p className="dim" style={{ marginTop: 6 }}>settings → connectors → add custom connector → paste the url. name it &quot;localhost&quot;.</p></section>
      <section className="sec"><h2>claude code</h2><pre style={pre}>{`claude mcp add --transport http localhost ${url}`}</pre></section>
      <section className="sec"><h2>cursor / windsurf / anything with an mcp.json</h2><pre style={pre}>{JSON.stringify({ mcpServers: { localhost: { url } } }, null, 2)}</pre></section>
      <section className="sec"><h2>tools</h2>
        <div className="list" style={{ marginTop: 14 }}>
          {[["search_events", "city, keywords, type, when (today / this week / weekend / a date), free only"], ["get_event", "full details, agenda, tiers, register link"], ["list_cities", "cities we cover and how many events each has"], ["list_communities", "who runs what in a city, followers, next event"]].map(([n, d]) => <div key={n}><div className="what"><b>{n}</b><span>{d}</span></div></div>)}
        </div>
      </section>
      <section className="sec"><h2>try asking</h2><p className="dim keep">&quot;free ai meetups in berlin this week&quot; · &quot;any hackathons in london next weekend?&quot; · &quot;who runs the biggest founder dinners in nyc&quot; · &quot;what&apos;s on in sf tonight&quot;</p></section>
    </main></Shell>
  );
}
