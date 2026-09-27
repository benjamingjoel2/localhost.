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
| `/me` | your tickets and events you host |

## Money

Platform fee 3.5% + 0.30 per paid ticket, included in the displayed price (`platformFeeMinor` in `src/lib/util.ts`). Payouts via Stripe Connect are the next step; today the platform account collects.

## Next

Stripe Connect for host payouts · CFP and sponsor slots · WhatsApp/SMS blasts · iCal feeds · a public API · the marketing site's design on the app shell.
