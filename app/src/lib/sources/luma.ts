import { prisma } from "@/lib/db";
import { slugify, pin } from "@/lib/util";
import type { EventType, Currency } from "@prisma/client";

// Luma "discover" places we mirror, mapped onto Localhost city slugs.
export const LUMA_PLACES: { city: string; place: string; slug: string; currency: Currency }[] = [
  { city: "san-francisco", place: "discplace-BDj7GNbGlsF7Cka", slug: "sf", currency: "USD" },
  { city: "new-york", place: "discplace-Izx1rQVSh8njYpP", slug: "nyc", currency: "USD" },
  { city: "london", place: "discplace-QCcNk3HXowOR97j", slug: "london", currency: "GBP" },
  { city: "berlin", place: "discplace-gCfX0s3E9Hgo3rG", slug: "berlin", currency: "EUR" },
];

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36 localhost-events-bot/1.0";

type LumaEntry = {
  api_id: string;
  event: { api_id: string; name: string; start_at: string; end_at?: string | null; timezone?: string; url: string; cover_url?: string | null; location_type?: string; geo_address_info?: { address?: string; full_address?: string; city?: string } | null };
  calendar?: { api_id: string; name: string; slug?: string | null; avatar_url?: string | null; description_short?: string | null; website?: string | null } | null;
  hosts?: { first_name?: string | null; last_name?: string | null; name?: string | null }[] | null;
  guest_count?: number | null;
  ticket_info?: { is_free?: boolean; price?: { cents?: number; currency?: string } | null; is_sold_out?: boolean } | null;
};

// what counts as "tech". scored, not a single regex: one strong signal, or two weak ones.
const STRONG = /\b(ai|a\.i\.|ml|llm|llms|gpt|agent|agents|agentic|startup|startups|founder|founders|co-?founder|dev|devs|developer|developers|engineer|engineers|engineering|hack|hacks|hackathon|hackathons|hacker|hackers|coding|coder|coders|software|saas|b2b|data|analytics|crypto|web3|blockchain|defi|ethereum|solana|bitcoin|robot|robots|robotics|hardware|infra|infrastructure|cloud|kubernetes|k8s|open[- ]source|python|rust|golang|typescript|javascript|react|node\.js|gpu|gpus|cuda|quantum|biotech|fintech|healthtech|climate ?tech|deep ?tech|[a-z]*tech|technology|technologists|builders|buildathon|yc|y combinator|venture|ventures|vc|vcs|angel investor|angels|pre-seed|seed round|api|apis|mcp|compute|inference|neural|nlp|cyber|cybersecurity|devops|sre|no[- ]code|low[- ]code|vibe coding|indie hacker|indie hackers|product manager|product managers|design systems?|design engineering|ux|frontend|backend|full[- ]stack|database|databases|postgres|sql|reliability|observability|semiconductor|chips|physical intelligence|embodied|autonomy|autonomous|drone|drones|space ?tech|papers we love|demo day|demo night|demos)\b/i;
const WEAK = /\b(build|building|ship|shipping|launch|product|design|growth|platform|model|models|vision|security|demo|pitch|pitches|investor|investors|fundraising|funding|scale|scaling|automation|automate|workshop|innovation|founder-led|technical)\b/i;
const NOT_TECH = /\b(yoga|marathon|hike|hiking|wine tasting|cooking class|salsa|bachata|tango|church|worship|bible|pilates|crossfit|singles|speed dating|dating|toddler|baby|karaoke|comedy night|improv|book club|romantasy|premiere|film screening|jewelry|jewellery|pop-up shop|fashion show|gala|festival|concert|dj set|rave|yacht party|brunch party|pottery|painting class|reading & celebration)\b/i;
// hosts we know are tech even when the title says nothing (companies, funds, communities)
const KNOWN_TECH_HOSTS = /\b(supabase|workos|vercel|ramp design|ramp for startups|squarespace|braintrust|motherduck|work-bench|cognition|granola|e2b|openrouter|fireworks|cerebras|clickhouse|mercury|n8n|copilotkit|imbue|unikraft|hexa|alpic|novita|fastino|air street|hardware fyi|major league hacking|mlh|pensar|reasoning project|tokens&|conception x|claude|stripe|cloudflare|nvidia|mongodb|datadog|metabase|baseten|brex|goodfire|anthropic|openai|mistral|hugging ?face|github|gitlab|google|microsoft|aws|amazon web services|meta|apple|notion|figma|linear|retool|replit|cursor|south park commons|hustle fund|a16z|andreessen|sequoia|y combinator|yc|techstars|antler|entrepreneur first|ef\b|founders inc|f\.inc|betaworks|prolific|zalando|n26|octopus ventures|seedcamp|localglobe|index ventures|balderton|atomico|accel|lightspeed|general catalyst|first round|betahaus|factory berlin|merantix|nebius|solana|ethereum foundation|consensys|coinbase|revolut|monzo|wise|deliveroo|uber|airbnb|shopify|twilio|resend|neon|planetscale|turso|fly\.io|render|railway|modal|together ai|weights & biases|wandb|scale ai|cohere|perplexity|elevenlabs|runway|pika|midjourney|stability|databricks|snowflake|dbt|fivetran|airbyte|posthog|sentry|grafana|honeycomb|pagerduty|incident\.io|prolific)\b/i;

export const isTech = (title: string, host = "", blurb = "") => {
  const th = `${title} ${host}`;
  if (NOT_TECH.test(th)) return false;            // the title or host says it's not for us
  if (KNOWN_TECH_HOSTS.test(th)) return true;      // a host we know
  if (STRONG.test(th)) return true;                // the title or host says tech
  // otherwise the blurb has to carry it: a strong word there counts as one weak signal
  const weak = new Set((`${th} ${blurb}`.match(new RegExp(WEAK.source, "gi")) ?? []).map((w) => w.toLowerCase())).size;
  return (STRONG.test(blurb) && weak >= 1) || weak >= 3;
};

export const classify = (name: string): EventType => {
  const n = name.toLowerCase();
  if (/hackathon|hack ?night|hack ?day|build ?(weekend|day|night)|buildathon/.test(n)) return "HACKATHON";
  if (/demo ?(day|night)|showcase|pitch/.test(n)) return "DEMO_DAY";
  if (/conference|summit|conf\b|convention|expo/.test(n)) return "CONFERENCE";
  if (/workshop|bootcamp|class|course|tutorial|hands[- ]on/.test(n)) return "WORKSHOP";
  if (/dinner|supper|brunch|breakfast|lunch/.test(n)) return "DINNER";
  if (/launch|release party/.test(n)) return "LAUNCH";
  return "MEETUP";
};

async function fetchPage(place: string, cursor?: string): Promise<{ entries: LumaEntry[]; has_more: boolean; next_cursor?: string }> {
  const u = new URL("https://api.luma.com/discover/get-paginated-events");
  u.searchParams.set("discover_place_api_id", place);
  u.searchParams.set("pagination_limit", "50");
  if (cursor) u.searchParams.set("pagination_cursor", cursor);
  const r = await fetch(u, { headers: { "user-agent": UA, accept: "application/json" }, cache: "no-store" });
  if (!r.ok) throw new Error(`luma ${place} ${r.status}`);
  return r.json();
}

export async function fetchLumaCity(place: string, maxPages = 4): Promise<LumaEntry[]> {
  const out: LumaEntry[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const page = await fetchPage(place, cursor);
    out.push(...page.entries);
    if (!page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return out;
}

async function systemUser() {
  return prisma.user.upsert({ where: { email: "luma-import@localhost.events" }, update: {}, create: { email: "luma-import@localhost.events", name: "luma import" } });
}

export async function importLumaCity(cfg: (typeof LUMA_PLACES)[number], opts: { maxPages?: number } = {}) {
  const entries = await fetchLumaCity(cfg.place, opts.maxPages);
  const owner = await systemUser();
  const now = new Date();
  let imported = 0, skipped = 0;
  for (const en of entries) {
    const ev = en.event;
    if (!ev?.api_id || !ev.name || !ev.start_at) continue;
    if (ev.location_type === "online" || ev.location_type === "virtual") { skipped++; continue; }
    if (!isTech(ev.name, en.calendar?.name ?? "", en.calendar?.description_short ?? "")) { skipped++; continue; }

    // community per luma calendar (falls back to a per-city "independent hosts" community)
    const calId = en.calendar?.api_id ?? `luma-independent-${cfg.city}`;
    const calName = en.calendar?.name ?? (en.hosts?.[0] ? `${[en.hosts[0].first_name, en.hosts[0].last_name].filter(Boolean).join(" ") || en.hosts[0].name}` : "independent hosts");
    const community = await prisma.community.upsert({
      where: { sourceId: calId },
      update: { name: calName, avatar: en.calendar?.avatar_url ?? undefined, externalUrl: en.calendar?.slug ? `https://luma.com/${en.calendar.slug}` : undefined },
      create: { slug: uniqueCommunitySlug(calName, calId), name: calName, city: cfg.city, description: en.calendar?.description_short ?? null, ownerId: owner.id, source: "LUMA", sourceId: calId, avatar: en.calendar?.avatar_url ?? null, externalUrl: en.calendar?.slug ? `https://luma.com/${en.calendar.slug}` : null },
    });

    const price = en.ticket_info?.is_free ? 0 : en.ticket_info?.price?.cents ?? null;
    const data = {
      title: ev.name.trim().slice(0, 140),
      type: classify(ev.name),
      startsAt: new Date(ev.start_at),
      endsAt: ev.end_at ? new Date(ev.end_at) : null,
      venue: ev.geo_address_info?.address ?? null,
      address: ev.geo_address_info?.full_address ?? null,
      cover: ev.cover_url ?? null,
      currency: cfg.currency,
      priceMinor: price,
      going: en.guest_count ?? null,
      externalUrl: `https://luma.com/${ev.url}`,
      published: true,
      lastSeenAt: now,
      communityId: community.id,
    };
    await prisma.event.upsert({
      where: { sourceId: ev.api_id },
      update: data,
      create: { ...data, city: cfg.city, slug: `${slugify(ev.name)}-${ev.api_id.replace("evt-", "").slice(0, 6).toLowerCase()}`, checkinPin: pin(), source: "LUMA", sourceId: ev.api_id },
    });
    imported++;
  }
  // anything we no longer see upstream and that hasn't happened yet: unpublish (cancelled or made private)
  const gone = await prisma.event.updateMany({ where: { source: "LUMA", city: cfg.city, startsAt: { gte: now }, lastSeenAt: { lt: now } }, data: { published: false } });
  return { city: cfg.city, fetched: entries.length, imported, skipped, unpublished: gone.count };
}

const uniqueCommunitySlug = (name: string, id: string) => `${slugify(name).slice(0, 40)}-${id.replace(/^cal-|^luma-/, "").slice(0, 6).toLowerCase()}`;

export async function importAllLuma(opts: { maxPages?: number } = {}) {
  const results = [];
  for (const cfg of LUMA_PLACES) {
    try { results.push(await importLumaCity(cfg, opts)); }
    catch (e) { results.push({ city: cfg.city, error: (e as Error).message }); }
  }
  return results;
}
