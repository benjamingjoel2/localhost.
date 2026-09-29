import type { Currency } from "@prisma/client";
import { UA, isTech, systemUser, upsertExternal, unpublishGone, type ImportResult } from "./common";

// Eventbrite's public "science & tech" city listings embed the search results as JSON on the page.
export const EVENTBRITE_CITIES: { city: string; path: string; currency: Currency }[] = [
  { city: "san-francisco", path: "ca--san-francisco", currency: "USD" },
  { city: "new-york", path: "ny--new-york", currency: "USD" },
  { city: "london", path: "united-kingdom--london", currency: "GBP" },
  { city: "berlin", path: "germany--berlin", currency: "EUR" },
];

type EbEvent = {
  id: string; eventbrite_event_id?: string; name: string; url: string; start_date: string; start_time?: string | null; end_date?: string | null; end_time?: string | null; timezone?: string | null;
  is_online_event?: boolean; is_cancelled?: boolean; summary?: string | null; full_description?: string | null;
  primary_venue?: { name?: string | null; address?: { localized_address_display?: string | null; city?: string | null } | null } | null;
  primary_organizer?: { id?: string; name?: string | null; url?: string | null; image?: { url?: string } | null } | null; primary_organizer_id?: string | null;
  ticket_availability?: { is_free?: boolean; minimum_ticket_price?: { major_value?: string; value?: number; currency?: string } | null } | null;
  image?: { url?: string | null } | null; tags?: { display_name?: string; prefix?: string }[] | null;
};

// "2026-10-12" + "17:00" in an IANA zone -> Date. Good enough without a tz library: use Intl to find the zone's offset at that wall time.
function zoned(date: string, time: string | null | undefined, tz: string | null | undefined): Date {
  const naive = new Date(`${date}T${time ?? "18:00"}:00Z`);
  if (!tz) return naive;
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(naive);
    const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const asIfUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
    return new Date(naive.getTime() - (asIfUtc - naive.getTime()));
  } catch { return naive; }
}

export async function fetchEventbriteCity(cfg: (typeof EVENTBRITE_CITIES)[number], maxPages = 3): Promise<EbEvent[]> {
  const out: EbEvent[] = [];
  for (let p = 1; p <= maxPages; p++) {
    const r = await fetch(`https://www.eventbrite.com/d/${cfg.path}/science-and-tech--events/?page=${p}`, { headers: { "user-agent": UA, accept: "text/html" }, cache: "no-store" });
    if (!r.ok) throw new Error(`eventbrite ${cfg.city} p${p} ${r.status}`);
    const html = await r.text();
    const m = html.match(/window\.__SERVER_DATA__\s*=\s*(\{[\s\S]*?\});\s*\n/);
    if (!m) break;
    const data = JSON.parse(m[1]);
    const ev = data?.search_data?.events;
    const results: EbEvent[] = ev?.results ?? [];
    out.push(...results);
    const pg = ev?.pagination;
    if (!pg || p >= (pg.page_count ?? 1)) break;
  }
  return out;
}

export async function importEventbriteCity(cfg: (typeof EVENTBRITE_CITIES)[number], opts: { maxPages?: number } = {}): Promise<ImportResult> {
  const events = await fetchEventbriteCity(cfg, opts.maxPages);
  const owner = await systemUser("EVENTBRITE");
  const now = new Date();
  let imported = 0, skipped = 0;
  const seen = new Set<string>();
  for (const e of events) {
    const id = e.eventbrite_event_id ?? e.id;
    if (!id || !e.name || !e.start_date || seen.has(id)) continue;
    seen.add(id);
    if (e.is_online_event || e.is_cancelled) { skipped++; continue; }
    const tags = (e.tags ?? []).map((t) => t.display_name).filter(Boolean).join(" ");
    const host = e.primary_organizer?.name ?? "";
    if (!isTech(e.name, host, `${tags} ${(e.summary ?? "").slice(0, 300)}`)) { skipped++; continue; }
    const ta = e.ticket_availability;
    const price = ta?.is_free ? 0 : ta?.minimum_ticket_price?.major_value != null ? Math.round(Number(ta.minimum_ticket_price.major_value) * 100) : null;
    const startsAt = zoned(e.start_date, e.start_time, e.timezone);
    if (startsAt < now) { skipped++; continue; }
    const orgId = e.primary_organizer?.id ?? e.primary_organizer_id ?? null;
    await upsertExternal({
      source: "EVENTBRITE", sourceId: `eventbrite-${id}`, title: e.name, startsAt, endsAt: e.end_date ? zoned(e.end_date, e.end_time, e.timezone) : null,
      venue: e.primary_venue?.name ?? null, address: e.primary_venue?.address?.localized_address_display ?? null,
      cover: e.image?.url ?? null, description: (e.summary ?? e.full_description ?? null)?.slice(0, 2000) ?? null,
      priceMinor: price, going: null, externalUrl: e.url.split("?")[0], city: cfg.city, currency: cfg.currency,
      host: { sourceId: orgId ? `eventbrite-org-${orgId}` : `eventbrite-independent-${cfg.city}`, name: host || "eventbrite hosts", avatar: e.primary_organizer?.image?.url ?? null, externalUrl: e.primary_organizer?.url ?? null },
    }, owner.id, now);
    imported++;
  }
  const unpublished = await unpublishGone("EVENTBRITE", cfg.city, now);
  return { source: "eventbrite", city: cfg.city, fetched: events.length, imported, skipped, unpublished };
}

export async function importAllEventbrite(opts: { maxPages?: number } = {}) {
  const results: ImportResult[] = [];
  for (const cfg of EVENTBRITE_CITIES) {
    try { results.push(await importEventbriteCity(cfg, opts)); }
    catch (e) { results.push({ source: "eventbrite", city: cfg.city, error: (e as Error).message }); }
  }
  return results;
}
