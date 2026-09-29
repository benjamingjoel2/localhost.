import type { Currency } from "@prisma/client";
import { UA, isTech, systemUser, upsertExternal, unpublishGone, type ImportResult } from "./common";

// Meetup's public GraphQL endpoint, the same one its own "find events" page calls. Topic 546 = Technology.
export const MEETUP_CITIES: { city: string; lat: number; lon: number; currency: Currency; tz: string }[] = [
  { city: "san-francisco", lat: 37.78, lon: -122.42, currency: "USD", tz: "US/Pacific" },
  { city: "new-york", lat: 40.7128, lon: -74.006, currency: "USD", tz: "US/Eastern" },
  { city: "london", lat: 51.5074, lon: -0.1278, currency: "GBP", tz: "Europe/London" },
  { city: "berlin", lat: 52.52, lon: 13.405, currency: "EUR", tz: "Europe/Berlin" },
];

type Node = { id: string; title: string; dateTime: string; endTime?: string | null; eventUrl: string; eventType?: string | null; description?: string | null; going?: { totalCount?: number } | null; venue?: { name?: string | null; address?: string | null; city?: string | null } | null; group?: { name: string; urlname: string; description?: string | null; keyGroupPhoto?: { highResUrl?: string | null } | null } | null; feeSettings?: { amount?: number | null; currency?: string | null } | null; featuredEventPhoto?: { highResUrl?: string | null; baseUrl?: string | null } | null };

const QUERY = `query($f: RecommendedEventsFilter!, $s: RecommendedEventsSort, $first: Int, $after: String) {
  recommendedEvents(filter:$f, sort:$s, first:$first, after:$after) {
    pageInfo { hasNextPage endCursor }
    edges { node { id title dateTime endTime eventUrl eventType description going { totalCount } venue { name address city } group { name urlname } feeSettings { amount currency } featuredEventPhoto { highResUrl baseUrl } } }
  } }`;

async function page(cfg: (typeof MEETUP_CITIES)[number], first: number, after?: string) {
  const startDateRange = new Date().toISOString().slice(0, 19) + `Z[UTC]`;
  const r = await fetch("https://www.meetup.com/gql2", {
    method: "POST", headers: { "content-type": "application/json", "user-agent": UA, accept: "application/json" }, cache: "no-store",
    body: JSON.stringify({ query: QUERY, variables: { f: { lat: cfg.lat, lon: cfg.lon, topicCategoryId: "546", radius: 25, startDateRange, doConsolidateEvents: true }, s: { sortField: "DATETIME" }, first, after } }),
  });
  if (!r.ok) throw new Error(`meetup ${cfg.city} ${r.status}`);
  const j = await r.json();
  if (j.errors) throw new Error(`meetup ${cfg.city}: ${JSON.stringify(j.errors).slice(0, 200)}`);
  const d = j.data.recommendedEvents as { pageInfo: { hasNextPage: boolean; endCursor?: string }; edges: { node: Node }[] };
  return d;
}

export async function fetchMeetupCity(cfg: (typeof MEETUP_CITIES)[number], maxPages = 3): Promise<Node[]> {
  const out: Node[] = []; let after: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const d = await page(cfg, 50, after);
    out.push(...d.edges.map((e) => e.node));
    if (!d.pageInfo.hasNextPage || !d.pageInfo.endCursor) break;
    after = d.pageInfo.endCursor;
  }
  return out;
}

export async function importMeetupCity(cfg: (typeof MEETUP_CITIES)[number], opts: { maxPages?: number } = {}): Promise<ImportResult> {
  const nodes = await fetchMeetupCity(cfg, opts.maxPages);
  const owner = await systemUser("MEETUP");
  const now = new Date();
  let imported = 0, skipped = 0;
  const seen = new Set<string>();
  for (const n of nodes) {
    if (!n?.id || !n.title || !n.dateTime || seen.has(n.id)) continue;
    seen.add(n.id);
    if (n.eventType && n.eventType !== "PHYSICAL") { skipped++; continue; }
    if (!isTech(n.title, n.group?.name ?? "", (n.description ?? "").slice(0, 400))) { skipped++; continue; }
    const fee = n.feeSettings?.amount;
    await upsertExternal({
      source: "MEETUP", sourceId: `meetup-${n.id}`, title: n.title, startsAt: new Date(n.dateTime), endsAt: n.endTime ? new Date(n.endTime) : null,
      venue: n.venue?.name ?? null, address: [n.venue?.address, n.venue?.city].filter(Boolean).join(", ") || null,
      cover: n.featuredEventPhoto?.highResUrl ?? n.featuredEventPhoto?.baseUrl ?? null, description: n.description ? n.description.replace(/\*\*/g, "").slice(0, 2000) : null,
      priceMinor: fee == null ? 0 : Math.round(fee * 100), going: n.going?.totalCount ?? null,
      externalUrl: n.eventUrl, city: cfg.city, currency: cfg.currency,
      host: { sourceId: `meetup-${n.group?.urlname ?? "independent-" + cfg.city}`, name: n.group?.name ?? "meetup hosts", externalUrl: n.group?.urlname ? `https://www.meetup.com/${n.group.urlname}/` : null },
    }, owner.id, now);
    imported++;
  }
  const unpublished = await unpublishGone("MEETUP", cfg.city, now);
  return { source: "meetup", city: cfg.city, fetched: nodes.length, imported, skipped, unpublished };
}

export async function importAllMeetup(opts: { maxPages?: number } = {}) {
  const results: ImportResult[] = [];
  for (const cfg of MEETUP_CITIES) {
    try { results.push(await importMeetupCity(cfg, opts)); }
    catch (e) { results.push({ source: "meetup", city: cfg.city, error: (e as Error).message }); }
  }
  return results;
}
