# localhost — app

The working product behind the marketing site in the repo root. Next.js (App Router), Prisma + Postgres, Auth.js magic links, Stripe Checkout in USD/EUR/GBP, QR tickets, a phone door scanner, email blasts, communities with followers.

## Run it

```sh
cp .env.example .env        # fill DATABASE_URL and AUTH_SECRET at minimum
npm install                 # also runs prisma generate
npm run db:push             # creates the tables
npm run db:seed             # sample communities and events (door pin 4821)
npm run dev                 # http://localhost:3000
```

Without `RESEND_API_KEY`, magic links and ticket emails are printed to the server console. Without Stripe keys, free tiers work and paid tiers are disabled with a visible note.

Free hosted Postgres: Neon or Supabase. Deploy: Vercel, set the same env vars, add a Stripe webhook for `checkout.session.completed` pointing at `/api/stripe/webhook`.

## Design

Design A from the platform preview: paper and ink, one terracotta accent, Manrope, lowercase, sidebar on desktop and a five-tab bar on phones. Shell lives in `src/components/shell.tsx`, tokens and components in `src/app/globals.css`.

## What works

| Route | What |
|---|---|
| `/` | upcoming events across cities, city list |
| `/[city]` | city hub: upcoming events and communities |
| `/[city]/[slug]` | event page: tiers, RSVP (free) or Stripe checkout (paid), agenda, guest list |
| `/t/[code]` | ticket with QR |
| `/c/[slug]` | community: follow, upcoming, past |
| `/create` | create a community and an event with tiers (login required) |
| `/host/[id]` | host view: stats, attendees, email blast, door pin, publish (emails followers) |
| `/host/[id]/scan` | door scanner: pin + camera (BarcodeDetector) or typed code |
| `/tickets` | your tickets, next-up wallet card with QR |
| `/host` | host home: KPIs, upcoming / drafts / past, orders sparkline, your communities |
| `/communities` | following · you run · in your city |
| `/settings` | profile, home city, guest-list defaults, badge flag, log out |
| `/notifications` | events posted by communities you follow, your tickets |

## Money

Platform fee 3.5% + 0.30 per paid ticket, included in the displayed price (`platformFeeMinor` in `src/lib/util.ts`). Payouts via Stripe Connect are the next step; today the platform account collects.

## Next

Stripe Connect for host payouts · CFP and sponsor slots · WhatsApp/SMS blasts · iCal feeds · a public API · the marketing site's design on the app shell.

## the city index (luma, meetup, eventbrite)

`src/lib/sources/` mirrors public listings into the same `Event` table with `source = LUMA | MEETUP | EVENTBRITE`. Each upstream
host or calendar becomes a `Community` with the same `source`, so "hosted by", follow and the digest work unchanged. Mirrored
events show an "on luma / meetup / eventbrite" badge and link out for registration; nothing is sold here for them.

- `common.ts`: the tech filter (`isTech`: one strong signal in title or host keeps an event, a short deny list drops it, a blurb
  alone needs several signals), `classify` (title → event type), and the shared upsert / unpublish logic.
- `luma.ts`: Luma's discover feed per city. `meetup.ts`: Meetup's public GraphQL (`recommendedEvents`, topic 546 = technology,
  25 km radius). `eventbrite.ts`: the science-and-tech city listing pages (results are embedded as JSON).
- runs on every Vercel build (`npm run import:sources`, never fails the build) and daily at 05:00 UTC via the cron in
  `vercel.json` calling `GET /api/import` (`?only=luma,meetup` to limit). Set `CRON_SECRET` in Vercel to lock the route.
- events that disappear upstream before they happen are unpublished, not deleted.
- locally: `npm run import:sources [luma|meetup|eventbrite]`. In a proxied container set `NODE_USE_ENV_PROXY=1`.

## interests and the monday digest

Users write what they care about in plain english under settings → "what to watch for" (`User.interests`) and opt in to the
monday email (`User.digest`). `src/lib/digest.ts` scores the coming week's events in their city against that text
(keyword hits, exclusions like "skip crypto", weeknight/weekend hints, followed communities) and emails the top eight.
With `ANTHROPIC_API_KEY` set, Claude re-ranks the shortlist and adds a one-line reason per pick.

- cron: mondays 07:00 UTC → `GET /api/digest` (locked by `CRON_SECRET`).
- `GET /api/digest?preview=<email>` renders one user's digest as html; `?dry=1` lists who would receive one without sending.

## mcp server

`GET|POST /api/mcp` is a streamable-http MCP server (`mcp-handler`) with `search_events`, `get_event`, `list_cities`,
`list_communities` and a `whats_on` prompt. `/mcp` is the public how-to-connect page. Read-only, no auth.
