import { prisma } from "@/lib/db";
import { createHash } from "crypto";
import { slugify, pin } from "@/lib/util";
import type { EventType, Currency, Source } from "@prisma/client";

export const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36 localhost-events-bot/1.0";

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


export async function systemUser(source: Source) {
  const email = `${source.toLowerCase()}-import@localhost.events`;
  return prisma.user.upsert({ where: { email }, update: {}, create: { email, name: `${source.toLowerCase()} import` } });
}

export type ExternalEvent = {
  source: Source;
  sourceId: string;            // stable id at the source
  title: string;
  startsAt: Date;
  endsAt?: Date | null;
  venue?: string | null;
  address?: string | null;
  cover?: string | null;
  description?: string | null;
  priceMinor?: number | null;  // 0 = free, null = unknown
  going?: number | null;
  externalUrl: string;
  city: string;
  currency: Currency;
  host: { sourceId: string; name: string; description?: string | null; avatar?: string | null; externalUrl?: string | null };
};

const short = (id: string) => createHash("sha1").update(id).digest("hex").slice(0, 6);
const communitySlug = (name: string, id: string) => `${slugify(name).slice(0, 40)}-${short(id)}`;
const eventSlug = (title: string, id: string) => `${slugify(title).slice(0, 50)}-${short(id)}`;

export async function upsertExternal(ev: ExternalEvent, ownerId: string, seenAt: Date) {
  const community = await prisma.community.upsert({
    where: { sourceId: ev.host.sourceId },
    update: { name: ev.host.name, avatar: ev.host.avatar ?? undefined, externalUrl: ev.host.externalUrl ?? undefined },
    create: { slug: communitySlug(ev.host.name, ev.host.sourceId), name: ev.host.name, city: ev.city, description: ev.host.description ?? null, ownerId, source: ev.source, sourceId: ev.host.sourceId, avatar: ev.host.avatar ?? null, externalUrl: ev.host.externalUrl ?? null },
  });
  const data = {
    title: ev.title.trim().slice(0, 140), type: classify(ev.title), startsAt: ev.startsAt, endsAt: ev.endsAt ?? null,
    venue: ev.venue ?? null, address: ev.address ?? null, cover: ev.cover ?? null, description: ev.description ?? null,
    currency: ev.currency, priceMinor: ev.priceMinor ?? null, going: ev.going ?? null, externalUrl: ev.externalUrl,
    published: true, lastSeenAt: seenAt, communityId: community.id,
  };
  await prisma.event.upsert({
    where: { sourceId: ev.sourceId },
    update: data,
    create: { ...data, city: ev.city, slug: eventSlug(ev.title, ev.sourceId), checkinPin: pin(), source: ev.source, sourceId: ev.sourceId },
  });
}

// anything we no longer see upstream and that hasn't happened yet: unpublish (cancelled, moved, or made private)
export async function unpublishGone(source: Source, city: string, seenAt: Date) {
  const r = await prisma.event.updateMany({ where: { source, city, startsAt: { gte: seenAt }, lastSeenAt: { lt: seenAt } }, data: { published: false } });
  return r.count;
}

export type ImportResult = { source: string; city: string; fetched: number; imported: number; skipped: number; unpublished: number } | { source: string; city: string; error: string };
