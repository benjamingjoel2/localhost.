// Plain query functions behind the MCP tools. Kept separate from the transport so they can be unit-tested and reused.
import { prisma } from "@/lib/db";
import { CITIES, cityName, money, baseUrl } from "@/lib/util";
import type { EventType, Prisma } from "@prisma/client";

export const TYPE_NAMES: Record<string, EventType> = {
  meetup: "MEETUP", meetups: "MEETUP", hackathon: "HACKATHON", hackathons: "HACKATHON", conference: "CONFERENCE", conferences: "CONFERENCE", summit: "CONFERENCE",
  "demo day": "DEMO_DAY", "demo night": "DEMO_DAY", demo: "DEMO_DAY", demos: "DEMO_DAY", workshop: "WORKSHOP", workshops: "WORKSHOP", launch: "LAUNCH", dinner: "DINNER", dinners: "DINNER", other: "OTHER",
};

const CITY_ALIASES: Record<string, string> = {
  sf: "san-francisco", "san francisco": "san-francisco", "san-francisco": "san-francisco", "bay area": "san-francisco",
  nyc: "new-york", "new york": "new-york", "new-york": "new-york", "new york city": "new-york", manhattan: "new-york", brooklyn: "new-york",
  london: "london", ldn: "london", berlin: "berlin", amsterdam: "amsterdam", paris: "paris", lisbon: "lisbon", austin: "austin", toronto: "toronto",
};
export const resolveCity = (s?: string | null) => (s ? CITY_ALIASES[s.trim().toLowerCase()] ?? (CITIES.some((c) => c.slug === s.trim().toLowerCase()) ? s.trim().toLowerCase() : undefined) : undefined);

// "today" | "tomorrow" | "this week" | "weekend" | "next week" | ISO date | anything Date can parse
export function resolveWindow(when?: string | null, tz = "UTC"): { from: Date; to: Date; label: string } {
  const now = new Date();
  const startOfDay = (d: Date) => { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x; };
  const addDays = (d: Date, n: number) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
  const w = (when ?? "").trim().toLowerCase();
  const today = startOfDay(now);
  if (!w || w === "upcoming" || w === "soon") return { from: now, to: addDays(today, 30), label: "the next 30 days" };
  if (w === "today" || w === "tonight") return { from: now, to: addDays(today, 1), label: "today" };
  if (w === "tomorrow") return { from: addDays(today, 1), to: addDays(today, 2), label: "tomorrow" };
  if (w === "this week" || w === "week") { const dow = (today.getUTCDay() + 6) % 7; return { from: now, to: addDays(today, 7 - dow), label: "this week" }; }
  if (w === "next week") { const dow = (today.getUTCDay() + 6) % 7; const mon = addDays(today, 7 - dow); return { from: mon, to: addDays(mon, 7), label: "next week" }; }
  if (w === "weekend" || w === "this weekend") { const dow = (today.getUTCDay() + 6) % 7; const sat = addDays(today, dow >= 5 ? 0 : 5 - dow); return { from: dow >= 5 ? now : sat, to: addDays(sat, dow === 6 ? 1 : 2), label: "this weekend" }; }
  if (w === "this month") return { from: now, to: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)), label: "this month" };
  const d = new Date(when!);
  if (!isNaN(d.getTime())) { const s = startOfDay(d); return { from: s < now ? now : s, to: addDays(s, 1), label: s.toISOString().slice(0, 10) }; }
  return { from: now, to: addDays(today, 30), label: "the next 30 days" };
}

const include = { community: { select: { name: true, slug: true, source: true } }, tiers: { orderBy: { order: "asc" as const }, select: { priceMinor: true, name: true, capacity: true } }, _count: { select: { tickets: true } } };
type Row = Prisma.EventGetPayload<{ include: typeof include }>;

export function shape(e: Row) {
  const price = e.tiers.length ? Math.min(...e.tiers.map((t) => t.priceMinor)) : e.priceMinor;
  return {
    id: e.id,
    title: e.title,
    type: e.type.toLowerCase().replace("_", " "),
    city: cityName(e.city),
    city_slug: e.city,
    starts_at: e.startsAt.toISOString(),
    ends_at: e.endsAt?.toISOString() ?? null,
    venue: e.venue ?? null,
    address: e.address ?? null,
    host: e.community.name,
    price: price == null ? "see listing" : money(price, e.currency),
    price_minor: price ?? null,
    currency: e.currency,
    going: e.going ?? e._count.tickets,
    source: e.source === "LUMA" ? "luma" : "localhost",
    url: `${baseUrl()}/${e.city}/${e.slug}`,
    register_url: e.source === "LUMA" ? e.externalUrl : `${baseUrl()}/${e.city}/${e.slug}`,
    description: e.description ? e.description.slice(0, 600) : null,
  };
}

export async function searchEvents(a: { city?: string; query?: string; type?: string; when?: string; free_only?: boolean; limit?: number }) {
  const city = resolveCity(a.city);
  if (a.city && !city) return { error: `unknown city "${a.city}". known: ${CITIES.map((c) => c.name).join(", ")}` };
  const type = a.type ? TYPE_NAMES[a.type.trim().toLowerCase()] : undefined;
  const win = resolveWindow(a.when);
  const terms = (a.query ?? "").split(/[\s,]+/).map((t) => t.trim()).filter((t) => t.length > 1);
  const where: Prisma.EventWhereInput = {
    published: true, startsAt: { gte: win.from, lt: win.to },
    ...(city ? { city } : {}), ...(type ? { type } : {}),
    ...(a.free_only ? { OR: [{ priceMinor: 0 }, { tiers: { some: { priceMinor: 0 } } }, { AND: [{ priceMinor: null }, { tiers: { none: {} } }] }] } : {}),
    ...(terms.length ? { AND: terms.map((t) => ({ OR: [{ title: { contains: t, mode: "insensitive" as const } }, { description: { contains: t, mode: "insensitive" as const } }, { community: { name: { contains: t, mode: "insensitive" as const } } }, { venue: { contains: t, mode: "insensitive" as const } }] })) } : {}),
  };
  const rows = await prisma.event.findMany({ where, orderBy: { startsAt: "asc" }, take: Math.min(Math.max(a.limit ?? 20, 1), 50), include });
  return { window: win.label, city: city ? cityName(city) : "all cities", count: rows.length, events: rows.map(shape) };
}

export async function getEvent(a: { id?: string; url?: string; city?: string; slug?: string }) {
  let e: Row | null = null;
  if (a.id) e = await prisma.event.findUnique({ where: { id: a.id }, include });
  else {
    let city = resolveCity(a.city), slug = a.slug;
    if (a.url) { const m = a.url.match(/\/([a-z-]+)\/([a-z0-9-]+)\/?$/); if (m) { city = m[1]; slug = m[2]; } }
    if (city && slug) e = await prisma.event.findUnique({ where: { city_slug: { city, slug } }, include });
  }
  if (!e || !e.published) return { error: "event not found" };
  const agenda = await prisma.agendaItem.findMany({ where: { eventId: e.id }, orderBy: { order: "asc" } });
  return { ...shape(e), description: e.description, agenda: agenda.map((x) => ({ time: x.time, title: x.title, speaker: x.speaker })), tiers: e.tiers.map((t) => ({ name: t.name, price: money(t.priceMinor, e!.currency), capacity: t.capacity })) };
}

export async function listCities() {
  const counts = await prisma.event.groupBy({ by: ["city"], where: { published: true, startsAt: { gte: new Date() } }, _count: { _all: true } });
  return { cities: CITIES.map((c) => ({ name: c.name, slug: c.slug, upcoming_events: counts.find((x) => x.city === c.slug)?._count._all ?? 0, url: `${baseUrl()}/${c.slug}` })) };
}

export async function listCommunities(a: { city?: string; query?: string; limit?: number }) {
  const city = resolveCity(a.city);
  const rows = await prisma.community.findMany({
    where: { ...(city ? { city } : {}), ...(a.query ? { name: { contains: a.query, mode: "insensitive" } } : {}), events: { some: { published: true, startsAt: { gte: new Date() } } } },
    include: { _count: { select: { followers: true, events: true } }, events: { where: { published: true, startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1, select: { title: true, startsAt: true } } },
    orderBy: { events: { _count: "desc" } }, take: Math.min(Math.max(a.limit ?? 25, 1), 100),
  });
  return { count: rows.length, communities: rows.map((c) => ({ name: c.name, slug: c.slug, city: cityName(c.city), source: c.source === "LUMA" ? "luma" : "localhost", followers: c._count.followers, upcoming_events: c._count.events, next_event: c.events[0] ? { title: c.events[0].title, starts_at: c.events[0].startsAt.toISOString() } : null, url: `${baseUrl()}/c/${c.slug}`, external_url: c.externalUrl })) };
}
