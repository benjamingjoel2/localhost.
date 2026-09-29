import { prisma } from "@/lib/db";
import type { Currency } from "@prisma/client";
import { UA, isTech, systemUser, upsertExternal, unpublishGone, type ImportResult } from "./common";

// Luma "discover" places we mirror, mapped onto Localhost city slugs.
export const LUMA_PLACES: { city: string; place: string; slug: string; currency: Currency }[] = [
  { city: "san-francisco", place: "discplace-BDj7GNbGlsF7Cka", slug: "sf", currency: "USD" },
  { city: "new-york", place: "discplace-Izx1rQVSh8njYpP", slug: "nyc", currency: "USD" },
  { city: "london", place: "discplace-QCcNk3HXowOR97j", slug: "london", currency: "GBP" },
  { city: "berlin", place: "discplace-gCfX0s3E9Hgo3rG", slug: "berlin", currency: "EUR" },
];

type LumaEntry = {
  api_id: string;
  event: { api_id: string; name: string; start_at: string; end_at?: string | null; timezone?: string; url: string; cover_url?: string | null; location_type?: string; geo_address_info?: { address?: string; full_address?: string; city?: string } | null };
  calendar?: { api_id: string; name: string; slug?: string | null; avatar_url?: string | null; description_short?: string | null; website?: string | null } | null;
  hosts?: { first_name?: string | null; last_name?: string | null; name?: string | null }[] | null;
  guest_count?: number | null;
  ticket_info?: { is_free?: boolean; price?: { cents?: number; currency?: string } | null; is_sold_out?: boolean } | null;
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

export async function importLumaCity(cfg: (typeof LUMA_PLACES)[number], opts: { maxPages?: number } = {}): Promise<ImportResult> {
  const entries = await fetchLumaCity(cfg.place, opts.maxPages);
  const owner = await systemUser("LUMA");
  const now = new Date();
  let imported = 0, skipped = 0;
  for (const en of entries) {
    const ev = en.event;
    if (!ev?.api_id || !ev.name || !ev.start_at) continue;
    if (ev.location_type === "online" || ev.location_type === "virtual") { skipped++; continue; }
    if (!isTech(ev.name, en.calendar?.name ?? "", en.calendar?.description_short ?? "")) { skipped++; continue; }
    const hostName = en.calendar?.name ?? (en.hosts?.[0] ? [en.hosts[0].first_name, en.hosts[0].last_name].filter(Boolean).join(" ") || en.hosts[0].name || "independent hosts" : "independent hosts");
    await upsertExternal({
      source: "LUMA", sourceId: ev.api_id, title: ev.name, startsAt: new Date(ev.start_at), endsAt: ev.end_at ? new Date(ev.end_at) : null,
      venue: ev.geo_address_info?.address ?? null, address: ev.geo_address_info?.full_address ?? null, cover: ev.cover_url ?? null,
      priceMinor: en.ticket_info?.is_free ? 0 : en.ticket_info?.price?.cents ?? null, going: en.guest_count ?? null,
      externalUrl: `https://luma.com/${ev.url}`, city: cfg.city, currency: cfg.currency,
      host: { sourceId: en.calendar?.api_id ?? `luma-independent-${cfg.city}`, name: hostName, description: en.calendar?.description_short ?? null, avatar: en.calendar?.avatar_url ?? null, externalUrl: en.calendar?.slug ? `https://luma.com/${en.calendar.slug}` : null },
    }, owner.id, now);
    imported++;
  }
  const unpublished = await unpublishGone("LUMA", cfg.city, now);
  return { source: "luma", city: cfg.city, fetched: entries.length, imported, skipped, unpublished };
}

export async function importAllLuma(opts: { maxPages?: number } = {}) {
  const results: ImportResult[] = [];
  for (const cfg of LUMA_PLACES) {
    try { results.push(await importLumaCity(cfg, opts)); }
    catch (e) { results.push({ source: "luma", city: cfg.city, error: (e as Error).message }); }
  }
  return results;
}
