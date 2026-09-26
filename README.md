# Localhost

**Tech happens IRL.** The event platform built only for tech: meetups, hackathons, conferences, demo days, workshops and launch parties, and the communities behind them, in the cities where people build.

Static prototype, no build step. Open `index.html` or serve the folder:

```sh
python3 -m http.server 8000
```

## Pages

| Page | What it shows |
|---|---|
| `index.html` | Home: photo hero, this week's events, statement, cities, tools, event types, hosts |
| `explore.html` | All events with city and type filters, plus the city grid |
| `city.html` | A city hub (Berlin): stats, this week, communities, venues, weekly email |
| `event.html` | An event page: poster, facts, agenda with open CFP slots, speakers, sponsors, who's going, wall, tickets |
| `checkout.html` | Ticket checkout: tiers, attendee details, guest-list and badge options, EUR/USD/GBP payment, VAT receipt |
| `ticket.html` | Confirmation: QR ticket, wallet and calendar, pre-event options, who else is going, refunds |
| `create.html` | Host flow: type, basics, ticket tiers, programme blocks, publish with live URL preview |
| `dashboard.html` | Host dashboard: sales, check-ins, attendees, blasts, door PIN, payout |
| `community.html` | A community profile (Berlin Builders): follow, upcoming, past, hosts, sponsors |
| `pricing.html` | Free for free events; 3.5% + €0.30 per paid ticket |
| `login.html` | Magic-link sign in |

Shared styles and behaviour live in `assets/`. Photos are free-licensed from Wikimedia Commons and credited in `img/CREDITS.md`.

## Docs

- [`CONCEPT.md`](CONCEPT.md): brand, positioning, product, business model, go-to-market, MVP scope
- [`docs/HOW-IT-WORKS.md`](docs/HOW-IT-WORKS.md): how the product works for hosts and attendees, the money flow, and notes towards a YC application

All events, people, communities and numbers on the pages are sample data.

## Design directions

Four home-page directions to choose from, each a standalone page at the repo root:

| File | Reference | Character |
|---|---|---|
| `design-a-norrsken.html` | norrsken.org | Black, giant Helvetica-style type, photos, outlined cells (the current site) |
| `design-b-partiful.html` | partiful.com | White, pastel blobs, heavy black type, rounded pills, tilted cards |
| `design-c-buildspace.html` | buildspace.so | Near-black with grain, Manrope extra-bold in lowercase, narrow column, lots of space |
| `design-d-founders.html` | f.inc | White, Instrument Serif headlines, blue tag, gray pills, polaroids, essay column |
| `design-e-c-plus-a.html` | C + A, dark | Buildspace's lowercase Manrope voice and grain over Norrsken's giant type, photos and outlined cells |
| `design-f-c-plus-b.html` | C + B, daylight | The same lowercase voice and a faint grain over Partiful's white page, rounded cards, customizer and template fan |
