import { randomBytes } from "crypto";
import type { Currency } from "@prisma/client";

export const CITIES: { slug: string; name: string }[] = [
  { slug: "san-francisco", name: "San Francisco" },
  { slug: "new-york", name: "New York" },
  { slug: "london", name: "London" },
  { slug: "berlin", name: "Berlin" },
  { slug: "amsterdam", name: "Amsterdam" },
  { slug: "paris", name: "Paris" },
  { slug: "lisbon", name: "Lisbon" },
  { slug: "austin", name: "Austin" },
  { slug: "toronto", name: "Toronto" },
];
export const cityName = (slug: string) => CITIES.find((c) => c.slug === slug)?.name ?? slug;

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "event";

export const ticketCode = () => {
  const raw = randomBytes(5).toString("hex").toUpperCase();
  return `LH-${raw.slice(0, 5)}-${raw.slice(5)}`;
};
export const pin = () => String(Math.floor(1000 + Math.random() * 9000));

const symbol: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£" };
export const money = (minor: number, cur: Currency) =>
  minor === 0 ? "free" : `${symbol[cur]}${(minor / 100).toFixed(minor % 100 ? 2 : 0)}`;
export const sum = (minor: number, cur: Currency) => `${symbol[cur]}${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: minor % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

// price chip for a card: cheapest tier, else the price we mirrored from an external source
export const priceLabel = (e: { tiers?: { priceMinor: number }[]; priceMinor?: number | null; currency: Currency; source?: string }) => {
  if (e.tiers && e.tiers.length) return money(Math.min(...e.tiers.map((t) => t.priceMinor)), e.currency);
  if (e.priceMinor != null) return money(e.priceMinor, e.currency);
  return e.source === "LUMA" ? "tickets" : "free";
};
export const goingCount = (e: { going?: number | null; _count?: { tickets: number } }) => e.going ?? e._count?.tickets ?? 0;

export const fmtDate = (d: Date) =>
  d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).toLowerCase();

export const baseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return v ? `https://${v}` : "http://localhost:3000";
};

// platform fee: 3.5% + 0.30 in the event currency, included in the price the buyer sees
export const platformFeeMinor = (amountMinor: number, qty: number) => Math.round(amountMinor * 0.035) + 30 * qty;
