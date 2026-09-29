import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { searchEvents, getEvent, listCities, listCommunities } from "@/lib/mcp-tools";
import { CITIES } from "@/lib/util";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const text = (o: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(o, null, 2) }] });
const cityHint = `city name or slug: ${CITIES.map((c) => c.name).join(", ")}. aliases like "sf", "nyc" work. omit for all cities.`;

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "search_events",
      {
        title: "Search tech events",
        description: "Find upcoming tech events (meetups, hackathons, demo days, conferences, workshops, founder dinners) in a city. Covers events hosted on Localhost and events mirrored from Luma, Meetup and Eventbrite. Returns title, time, venue, host, price, headcount and a link to register. Use `when` for natural windows like today, tomorrow, this week, weekend, next week, or an ISO date.",
        inputSchema: z.object({
          city: z.string().optional().describe(cityHint),
          query: z.string().optional().describe("free-text keywords matched against title, description, host and venue, e.g. 'rust', 'ai agents', 'founders'"),
          type: z.string().optional().describe("one of: meetup, hackathon, conference, demo day, workshop, launch, dinner"),
          when: z.string().optional().describe("today | tomorrow | this week | weekend | next week | this month | YYYY-MM-DD. default: next 30 days"),
          free_only: z.boolean().optional().describe("only free events"),
          limit: z.number().int().min(1).max(50).optional().describe("max results, default 20"),
        }),
      },
      async (a) => text(await searchEvents(a)),
    );
    server.registerTool(
      "get_event",
      {
        title: "Get event details",
        description: "Full details for one event: description, agenda, ticket tiers, venue, registration link. Pass the event id from search_events, or its Localhost url, or city + slug.",
        inputSchema: z.object({ id: z.string().optional(), url: z.string().optional(), city: z.string().optional(), slug: z.string().optional() }),
      },
      async (a) => text(await getEvent(a)),
    );
    server.registerTool(
      "list_cities",
      { title: "List cities", description: "Cities Localhost covers, with the number of upcoming tech events in each.", inputSchema: z.object({}) },
      async () => text(await listCities()),
    );
    server.registerTool(
      "list_communities",
      {
        title: "List communities",
        description: "Tech communities and hosts with upcoming events in a city, with follower counts and their next event. Useful for 'who runs AI meetups in Berlin'.",
        inputSchema: z.object({ city: z.string().optional().describe(cityHint), query: z.string().optional().describe("name filter"), limit: z.number().int().min(1).max(100).optional() }),
      },
      async (a) => text(await listCommunities(a)),
    );
    server.registerPrompt(
      "whats_on",
      { title: "What's on", description: "Brief on tech events in a city for a time window.", argsSchema: z.object({ city: z.string().describe(cityHint), when: z.string().optional().describe("today, this week, weekend…") }) },
      ({ city, when }) => ({ messages: [{ role: "user", content: { type: "text", text: `Use search_events for ${city}${when ? ` (${when})` : ""}. Group by day, one line per event: time, title, host, price, and the register link. Flag anything free and anything with a hackathon or demo format.` } }] }),
    );
  },
  { serverInfo: { name: "localhost-events", version: "0.1.0" } },
);

export { handler as GET, handler as POST, handler as DELETE };
