# Localhost — the event platform built only for tech

> Working name. "Localhost" is where every developer's work runs before it ships.
> It also reads as *local host*: the person running the room in your city.
> Every URL doubles as a joke developers already get: `localhost/berlin`, `localhost/kigali/build-night-23`.

## 1. The idea in one paragraph

Partiful made hosting a party feel like sending a text: one link, a good-looking page, a guest list you can stalk, group blasts, and now tickets. Nobody has done that for the tech scene. Tech events today are scattered across Luma (clean but generic), Eventbrite (fees, corporate), Meetup (dated), and a hundred Notion pages and Google Forms. Localhost takes the Partiful playbook, aims it strictly at tech events (meetups, hackathons, conferences, summits, demo days, workshops, launch parties, founder dinners) and adds the parts those events actually need: speakers and agendas, calls for proposals, sponsor slots, hackathon teams and judging, badges, and ticketing that works for people expensing on a company card in San Francisco *and* paying with mobile money in Kigali.

## 2. Positioning

| | Partiful | Luma | Eventbrite | Meetup | **Localhost** |
|---|---|---|---|---|---|
| Vibe | House party | Clean, neutral | Corporate box office | 2012 forum | House party for people who ship |
| Niche | Everything social | Everything | Everything | Everything | **Tech only** |
| Discovery | City explore | Calendars | Search | Groups | City hubs + topic filters, tech only |
| Speakers / agenda | No | Basic | Basic | No | **First class, multi-track, CFP** |
| Hackathon tooling | No | No | No | No | **Teams, submissions, judging, prizes** |
| Sponsors | No | No | No | No | **Sponsor tiers sold on the page** |
| Badges + scan-to-connect | No | No | No | No | **Yes** |
| Payments | US-centric | Stripe | Global-ish | Stripe | **Cards, Apple Pay, Google Pay, SEPA · USD, EUR, GBP** |
| Receipts for expensing | No | Basic | Yes | No | **Company + VAT on every receipt** |
| API | No | Yes | Yes | Limited | **API + webhooks + embed, dev-first** |

One line: **"Tech happens IRL."** Sub-line: *The event platform built only for tech.*

## 3. Who it is for

**Hosts (the customer)**
- Meetup organizers: monthly, same 200 people, zero budget. Free forever. They are the wedge.
- Hackathon leads: need teams, submissions, judging, prizes. Today: six spreadsheets.
- Conference and summit producers: tracks, speakers, sponsors, multi-currency sales, a real door.
- DevRel teams: city tours and launch events, want lead sync and a CRM webhook.
- Founders, funds, accelerators: demo days, founder dinners, invite-only with approvals.
- University tech clubs and student hackathons: free tier, student verification.

**Attendees (the audience)**
- Engineers, designers, founders, PMs, researchers, students. They want to know *who else is going*, whether it is worth the evening, and to get the recording after.

## 4. Product

### 4.1 Event page (the core object)
- One link. Rich previews everywhere (Slack, WhatsApp, X, LinkedIn, iMessage).
- Poster looks: `terminal`, `neon`, `paper`, `circuit`, plus custom. Tech-flavoured equivalents of Partiful's backgrounds, fonts and animations.
- Blocks the host can toggle: about, agenda, speakers, sponsors, CFP, tickets, who's going, wall, venue, hybrid/stream link, files (slides, recording, album).
- Types: meetup, hackathon, conference, demo day, workshop, launch party, dinner. Each type pre-selects the right blocks.

### 4.2 Ticketing (the revenue)
- Tiers: early bird, general, student, startup, corporate, sponsor, hidden, invite-only, plus capacity and sale windows per tier.
- Promo codes, community early access (followers get the link first), waitlists, approvals.
- Group / team purchase: one checkout, many names, one receipt.
- Receipts carry company name and VAT / tax ID so attendees can expense them.
- Currencies: USD, EUR and GBP. Hosts price in one of the three; buyers pay by card from anywhere. Payouts in the host's currency.
- Payment methods: cards, Apple Pay, Google Pay, SEPA. Local rails for other regions are a later addition, not a launch requirement.
- QR tickets, QR check-in from any phone, a scanner-only login for door staff, badge printing with name / company / role / "hiring" or "looking" flags.
- Refund policy set per event; automatic refunds on cancellation.

### 4.3 Tech-specific blocks
- **Speakers & agenda**: multi-track schedule, session pages, personal agenda, "starts in 10 min" pings.
- **CFP**: submissions on the page, host voting, accept → auto-publish to the agenda.
- **Sponsor tiers**: slots with price and perks, paid on-page, logos placed automatically, sponsor dashboard (scans, leads with consent).
- **Hackathon mode**: team formation board, project submission, judging rubric and scores, live leaderboard, demo slot picker, prize payouts.
- **Who's going**: opt-in list with role and company; filters for hiring / looking / founders / "from my company".
- **Scan to connect**: badge QR swaps profiles; contacts export to CSV or CRM.
- **The after**: recording, slides and shared album on the same link; attendee directory open for seven days.

### 4.4 Communication
- Text blasts and email, plus WhatsApp, Slack, Discord and Telegram broadcast channels.
- Schedule changes update the page, every calendar entry and every channel at once.

### 4.5 Communities (org profiles)
- `localhost/c/<community>`: profile, followers, upcoming and past events, co-hosts, recurring-event template.
- Followers are notified the moment an event is posted. Show-up rate shown to the host.
- City hubs are curated: a community "claims" a city to open it.

### 4.6 Explore
- `localhost/<city>`: San Francisco, New York, London, Berlin, Kigali, Cape Town, Lagos, Nairobi at launch; then Amsterdam, Paris, Lisbon, Austin, Toronto, Bangalore, Singapore.
- Topic filters: AI / ML, dev tools, founders, fintech, security, design, hardware, web3, data, mobile.
- Strictly tech. Hosts pick a category; anything else is declined at review.

### 4.7 Developers
- REST API, webhooks (ticket.sold, attendee.checked_in, cfp.submitted, …), iCal feeds, embed widget, Slack and Discord bots, Zapier, HubSpot, Notion, GitHub Discussions sync. CSV export of everything, always.
- Example: create next month's meetup from CI (shown on the landing page).

## 5. Business model

- **Free events: free.** No platform fee, no cap. This is how meetups adopt it.
- **Paid tickets:** one flat platform fee per paid ticket (proposal: 3.5% + a small fixed amount in local currency, host can pass it to the buyer). No surprise "service fee" pages.
- **Sponsor tier sales:** same flat fee.
- **Pro for communities** (later): custom domain, advanced analytics, CRM sync, priority city placement, badge hardware kits.
- **Featured placement in a city hub** (later, carefully): only for tech events, clearly labelled.

## 6. Go-to-market

1. **Land with communities, not venues.** Recruit 3–5 anchor meetup groups per launch city and give them the free tier plus badges for their first event. Their followers become the city's first users.
2. **City hubs open on demand.** A community claims a city; we help them fill the first month.
3. **Hackathon season.** Sponsor student hackathons with the hackathon mode; every participant becomes a user.
4. **DevRel teams** on tour (SF → NYC → London → Berlin) are the first paid customers: multiple cities, multi-currency, CRM sync.
5. **Launch where the scenes are.** SF, NYC, London and Berlin first; Kigali, Cape Town, Lagos and Nairobi open as soon as an anchor community claims them.

## 7. Brand

- **Name:** Localhost. Domain idea: `localhost.events` (also `lclhst.app`). Alternates considered: *Offline* ("go offline"), *Commit*, *Standup*, *Stackd*. Localhost wins because the URLs are the brand.
- **Wordmark:** `>localhost_` in a monospace with a blinking cursor. Black on white.
- **Voice:** Partiful's warmth and cheek, minus the party-girl register; dev humour without gatekeeping. Short sentences. Emoji allowed, sparingly. "Tech happens IRL." "Sell out. Not just RSVP." "Everything is a link. Everything has an API."
- **Look:** follows Partiful's language: white page, soft pastel blobs, black type, black and white rounded buttons, white cards with soft shadows, tilted poster fans. The tech flavour comes from content and small touches, not from a dark neon palette.
- **Type:** Inter (heavy weights, tight tracking) for display and body, IBM Plex Mono for paths, small labels and numbers.
- **Colour:** white `#ffffff`, black `#000000`, gray `#6f6f6f`; pastel blobs lavender `#e4dcff`, sky `#d7ecff`, pink `#ffe0ee`, mint `#dbf7ec`. Poster colours are flat: black, yellow `#ffd23f`, blue `#1a73e8`, paper `#f7f3ea`, pink `#ff5c8a`. Dark mode is opt-in.
- **Motifs:** URL paths as labels, a prompt in the wordmark, flat typographic posters with dot or stripe patterns.

## 8. App strategy

- Web first: the event page must be perfect in a WhatsApp in-app browser on a mid-range Android in Lagos.
- Installable PWA on day one (tickets and QR offline in the wallet).
- Native iOS / Android after: wallet passes, badge scanning, push for "talk starts in 10 minutes", scan-to-connect.

## 9. What is in this repository

- `index.html` — the Localhost landing page, structured section by section after partiful.com (announcement bar, nav, hero with event card, one-click page customizer, template fan, feature rows, host-needs cards, share and after, explore, communities, app CTA, blog, footer). Original copy and CSS-only artwork.
- `event.html` — a sample event page (AI Tinkerers Berlin) showing agenda, speakers, sponsors, CFP, who's going, wall and the ticket rail.
- `fonts/` — Inter and IBM Plex Mono (both open licence).
- Everything on the pages is sample data. No copy, imagery, scripts or assets from partiful.com are used.

## 10. MVP scope (first 8 weeks)

1. Auth, communities, event create flow with types and looks.
2. Event page with tickets (free + paid via Stripe in USD, EUR, GBP), promo codes, receipts with company + VAT.
3. QR tickets, phone check-in, printable badge PDF.
4. Agenda, speakers, sponsors, CFP blocks. Who's going with opt-in and filters. Wall.
5. Blasts: SMS, email, WhatsApp (Business API), Slack / Discord webhooks.
6. City hubs for the eight launch cities with topic filters.
7. Public API v1: events, tiers, attendees, webhooks, iCal.
8. Hackathon mode as the first post-MVP module.
