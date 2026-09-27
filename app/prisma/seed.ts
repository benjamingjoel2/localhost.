import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const inDays = (d: number, h = 18, m = 30) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return x; };

async function main() {
  const host = await prisma.user.upsert({ where: { email: "host@localhost.events" }, update: {}, create: { email: "host@localhost.events", name: "lena m." } });
  const mk = async (slug: string, name: string, city: string, description: string) =>
    prisma.community.upsert({ where: { slug }, update: {}, create: { slug, name, city, description, ownerId: host.id } });
  const bb = await mk("berlin-builders", "berlin builders", "berlin", "monthly demo nights and hack nights for people who ship.");
  const rl = await mk("rust-london", "rust london", "london", "the london rust meetup. monthly since 2019.");
  const sf = await mk("sf-demo-night", "sf demo night", "san-francisco", "six demos, no pitches.");

  const ev = async (c: { id: string; city: string }, slug: string, title: string, type: "MEETUP" | "HACKATHON" | "CONFERENCE" | "DEMO_DAY", startsAt: Date, currency: "USD" | "EUR" | "GBP", venue: string, tiers: [string, number, number | null][], agenda: [string, string, string][] = []) => {
    const exists = await prisma.event.findUnique({ where: { city_slug: { city: c.city, slug } } });
    if (exists) return exists;
    return prisma.event.create({ data: { slug, city: c.city, title, type, startsAt, currency, venue, published: true, checkinPin: "4821", communityId: c.id, description: "six short demos of things people actually built this month. then pizza, then the good conversations.",
      tiers: { create: tiers.map(([name, priceMinor, capacity], order) => ({ name, priceMinor, capacity, order })) },
      agenda: { create: agenda.map(([time, title, speaker], order) => ({ time, title, speaker, order })) } } });
  };
  await ev(bb, "demo-night-12", "demo night #12 — ai agents in production", "DEMO_DAY", inDays(5), "EUR", "factory berlin", [["general", 0, 200], ["supporter", 1200, null]], [["18:30", "doors, badges, drinks", "crew"], ["19:00", "agents in prod: what broke", "tobi a."], ["19:20", "local-first rag on a laptop", "maya r."], ["21:00", "open mic + pizza", "everyone"]]);
  await ev(bb, "agents-hack-night", "agents hack night — build an agent that ships", "HACKATHON", inDays(7, 10, 0), "EUR", "betahaus kreuzberg", [["hacker", 1200, 96], ["student", 0, 30]]);
  await ev(rl, "rust-london-october", "london rust meetup — inference servers in rust", "MEETUP", inDays(3, 19, 0), "GBP", "shoreditch", [["general", 0, 140]]);
  await ev(sf, "sf-demo-night-hardware", "sf demo night — hardware edition", "DEMO_DAY", inDays(5, 18, 0), "USD", "soma", [["general", 1500, 150], ["founder", 0, 20]]);
  console.log("seeded. host login: host@localhost.events (magic link prints to console in dev). door pin: 4821");
}
main().finally(() => prisma.$disconnect());
