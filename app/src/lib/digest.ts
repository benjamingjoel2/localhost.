// Weekly digest: the coming week's events in a user's city, ranked against the interests they wrote in settings.
// Keyword scoring always runs. When ANTHROPIC_API_KEY is set, Claude re-ranks the shortlist and writes a one-line reason per pick.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import { cityName, money, baseUrl, sourceLabel } from "@/lib/util";
import type { Prisma } from "@prisma/client";

const include = { community: { select: { id: true, name: true } }, tiers: { select: { priceMinor: true } } };
type Row = Prisma.EventGetPayload<{ include: typeof include }>;

const STOP = new Set(["and", "or", "the", "a", "an", "of", "in", "on", "for", "to", "with", "only", "skip", "no", "not", "please", "i", "me", "my", "im", "i'm", "like", "stuff", "things", "events", "event", "meetups", "meetup", "anything", "everything", "mostly"]);
const terms = (s: string) => Array.from(new Set(s.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").split(/\s+/).map((t) => t.replace(/^-|-$/g, "")).filter((t) => t.length > 1 && !STOP.has(t))));
const negatives = (s: string) => { const out: string[] = []; for (const m of s.toLowerCase().matchAll(/\b(?:skip|no|not|avoid|without|except)\s+([a-z0-9+#.-]+)/g)) out.push(m[1]); return out; };

export function scoreEvent(e: Row, interests: string, followed: Set<string>) {
  const hay = `${e.title} ${e.description ?? ""} ${e.community.name} ${e.type}`.toLowerCase();
  const neg = negatives(interests);
  if (neg.some((n) => hay.includes(n))) return -1;
  let s = 0;
  for (const t of terms(interests)) { if (e.title.toLowerCase().includes(t)) s += 3; else if (hay.includes(t)) s += 1; }
  if (followed.has(e.community.id)) s += 4;
  if (/weeknight|weekday/.test(interests) && [0, 6].includes(e.startsAt.getUTCDay())) s -= 2;
  if (/weekend/.test(interests) && ![0, 6].includes(e.startsAt.getUTCDay())) s -= 1;
  if (/\bfree\b/.test(interests) && (e.tiers.some((t) => t.priceMinor === 0) || e.priceMinor === 0)) s += 1;
  return s;
}

const Picks = z.object({ picks: z.array(z.object({ id: z.string(), why: z.string().max(140) })).max(8) });

async function rankWithClaude(interests: string, city: string, candidates: Row[]): Promise<Map<string, string> | null> {
  if (!process.env.ANTHROPIC_API_KEY || candidates.length === 0) return null;
  const client = new Anthropic();
  const list = candidates.map((e) => `- id=${e.id} | ${e.startsAt.toISOString().slice(0, 16)} | ${e.title} | host: ${e.community.name} | ${e.type.toLowerCase()} | ${e.description?.slice(0, 200).replace(/\s+/g, " ") ?? ""}`).join("\n");
  try {
    const r = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: zodOutputFormat(Picks) },
      system: "You pick tech events for one person's weekly email. Read their interests literally, including exclusions and timing preferences. Choose at most 8 events that fit, best first, and write one short plain-English reason each (under 140 characters, lowercase, no hype). If nothing fits, return an empty list.",
      messages: [{ role: "user", content: `City: ${city}\nInterests: ${interests}\n\nCandidate events:\n${list}` }],
    });
    if (r.stop_reason === "refusal") return null;
    const text = r.content.find((b) => b.type === "text")?.text ?? "";
    const parsed = Picks.safeParse(JSON.parse(text));
    if (!parsed.success) return null;
    return new Map(parsed.data.picks.map((p) => [p.id, p.why]));
  } catch (e) { console.error("digest: claude ranking failed:", (e as Error).message); return null; }
}

export async function buildDigest(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { follows: { select: { communityId: true } } } });
  if (!user) return null;
  const city = user.city ?? "berlin";
  const from = new Date(); const to = new Date(from.getTime() + 8 * 864e5);
  const events = await prisma.event.findMany({ where: { city, published: true, startsAt: { gte: from, lt: to } }, orderBy: { startsAt: "asc" }, include, take: 120 });
  const followed = new Set(user.follows.map((f) => f.communityId));
  const interests = user.interests?.trim() ?? "";
  let scored = events.map((e) => ({ e, s: interests ? scoreEvent(e, interests, followed) : followed.has(e.community.id) ? 4 : 0 })).filter((x) => x.s >= 0);
  scored.sort((a, b) => b.s - a.s || a.e.startsAt.getTime() - b.e.startsAt.getTime());
  const why = new Map<string, string>();
  if (interests) {
    const ranked = await rankWithClaude(interests, cityName(city), scored.slice(0, 40).map((x) => x.e));
    if (ranked && ranked.size) {
      const byId = new Map(scored.map((x) => [x.e.id, x]));
      const top = Array.from(ranked.keys()).map((id) => byId.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
      const rest = scored.filter((x) => !ranked.has(x.e.id));
      scored = [...top, ...rest];
      ranked.forEach((v, k) => why.set(k, v));
    }
  }
  const picks = scored.slice(0, 8).map((x) => x.e);
  const more = Math.max(0, events.length - picks.length);
  return { user, city, picks, more, why, total: events.length };
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const price = (e: Row) => e.tiers.length ? money(Math.min(...e.tiers.map((t) => t.priceMinor)), e.currency) : e.priceMinor != null ? money(e.priceMinor, e.currency) : "tickets";
const when = (d: Date) => d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).toLowerCase() + " utc";

export function renderDigest(d: NonNullable<Awaited<ReturnType<typeof buildDigest>>>) {
  const base = baseUrl();
  const rows = d.picks.map((e) => `
    <tr><td style="padding:14px 0;border-top:1px solid #e6e3da;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
      <div style="font-size:12px;color:#6b6a63">${when(e.startsAt)} · ${esc(e.community.name)} · ${price(e)}${e.source !== "LOCALHOST" ? ` · on ${sourceLabel(e.source)}` : ""}</div>
      <div style="font-size:17px;font-weight:700;color:#17160f;margin:4px 0"><a href="${base}/${e.city}/${e.slug}" style="color:#17160f;text-decoration:none">${esc(e.title)}</a></div>
      ${d.why.get(e.id) ? `<div style="font-size:14px;color:#a53812">${esc(d.why.get(e.id)!)}</div>` : ""}
      ${e.venue ? `<div style="font-size:13px;color:#6b6a63">${esc(e.venue)}</div>` : ""}
    </td></tr>`).join("");
  const empty = `<tr><td style="padding:14px 0;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#6b6a63">nothing matched this week. <a href="${base}/settings" style="color:#c8471d">widen your interests</a> or <a href="${base}/?city=${d.city}">browse everything in ${esc(cityName(d.city))}</a>.</td></tr>`;
  return `<!doctype html><body style="margin:0;background:#f4f1ea;padding:24px"><table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#f4f1ea">
  <tr><td style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;padding-bottom:12px"><div style="font-weight:800;font-size:22px;color:#17160f">this week in ${esc(cityName(d.city))}</div><div style="font-size:14px;color:#6b6a63">${d.total} tech events indexed. ${d.picks.length ? `${d.picks.length} picked for you${d.user.interests ? " from your interests" : ""}.` : ""}</div></td></tr>
  ${rows || empty}
  <tr><td style="padding-top:18px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:13px;color:#6b6a63">${d.more ? `<a href="${base}/?city=${d.city}" style="color:#c8471d">${d.more} more in ${esc(cityName(d.city))} →</a> · ` : ""}<a href="${base}/settings" style="color:#6b6a63">change interests or stop these</a> · <a href="${base}/mcp" style="color:#6b6a63">ask your ai instead</a></td></tr>
  </table></body>`;
}

export async function sendDigests(opts: { dryRun?: boolean; onlyEmail?: string } = {}) {
  const users = await prisma.user.findMany({ where: { digest: true, ...(opts.onlyEmail ? { email: opts.onlyEmail } : {}), email: { not: { endsWith: "@localhost.events" }, ...(opts.onlyEmail ? { equals: opts.onlyEmail } : {}) } }, select: { id: true, email: true } });
  const out: { email: string; picks: number; sent: boolean }[] = [];
  for (const u of users) {
    const d = await buildDigest(u.id);
    if (!d) continue;
    if (!opts.dryRun) {
      await sendMail(u.email, `this week in ${cityName(d.city)}: ${d.picks.length ? d.picks.length + " tech events for you" : "nothing matched, " + d.total + " indexed"}`, renderDigest(d));
      await prisma.user.update({ where: { id: u.id }, data: { digestSentAt: new Date() } });
    }
    out.push({ email: u.email, picks: d.picks.length, sent: !opts.dryRun });
  }
  return out;
}
