# Localhost — status narrative

Written 27 September 2026, end of the prototype phase. Tomorrow the platform build starts.

## The short version

The marketing site is complete: 26 pages, one design system, every link resolves, every page verified at desktop and phone widths with no console errors or horizontal overflow. It is published at the preview link and pushed to the `claude/youthful-euler-p3fn0e` branch. Alongside it, a working platform scaffold exists in `app/`: Next.js, Postgres, magic-link login, Stripe checkout in USD/EUR/GBP, QR tickets, a phone door scanner, email blasts and communities with followers. It type-checks and builds; it has not yet been run against a database. That is the first job tomorrow.

## What is there (site)

**Core product pages**

| Page | State |
|---|---|
| Home (`index.html`) | Done. Design C foundation with A's photo sections; interactive pictures; uniform type scale; stretched layout. |
| Explore (`explore.html`) | Done. 12 sample events, working city and type filters, photo city grid. |
| Cities (`cities.html`) | New. All 15 cities; six with photos, the rest as tiles; "your city" claim tile. |
| City hub (`city.html`, Berlin) | Done. Photo hero, stats, this week, communities, venues, Monday email. |
| Event page (`event.html`) | Done. Poster, facts, agenda with open CFP slots, speakers, sponsors, who's going, wall, ticket rail with quantities. Add-to-calendar downloads a real `.ics`; maps opens Google Maps; share buttons use real WhatsApp, X and LinkedIn intents; copy link works. |
| Checkout (`checkout.html`) | Done. Tiers, attendee details, guest-list and badge options, EUR/USD/GBP with live recalculation, VAT fields. Simulated; submit lands on the ticket. |
| Ticket (`ticket.html`) | Done. QR, calendar download, wallet buttons (route to FAQ until wallet passes ship), refund request, who else is going. |
| Create event (`create.html`) | Done. Type picker, basics, tier table, programme blocks, publish with live URL preview. Simulated; lands on the event page. |
| Community (`community.html`, Berlin Builders) | Done. Follow toggles in place, upcoming, past, hosts, sponsors. |
| Pricing (`pricing.html`) | Done. Free / 3.5% + 0.30 / sponsor slots, worked example, FAQ. |
| Log in (`login.html`) | Done. Magic-link form; GitHub and Google buttons are simulated and say so. |

**Company pages (all new today)**

| Page | State |
|---|---|
| About | Story, principles, where we are, team (founder name is a placeholder), open roles. |
| Blog + 3 posts | Index and three full articles (recordings, hackathons, Berlin this month). |
| Careers | Four roles, how we work, apply routes to contact with the role prefilled. |
| Contact | Topic-prefilled form (host, sponsor, CFP, refund, press, careers, partners, API). Shows a confirmation; does not send yet. |
| Press | Boilerplate, facts, wordmark downloads (SVG light and dark). |
| Partners | Venues, communities, sponsors. |
| FAQ | Attendee and host questions incl. wallets, receipts, refunds, currencies, fees, tech-only rule, "why not Luma". |
| API | Planned endpoints, webhooks, iCal, curl example, request-access route. |
| Terms, Privacy, Event Policy | Draft legal text, clearly marked as not yet reviewed by counsel. |
| Sitemap | Every page. |

**Shared**: header with explore / cities / communities / pricing / about, full-screen menu, four-column footer with real destinations (social links point at handles we would claim), subscribe forms that confirm in place, `assets/site.css` and `assets/site.js`, Manrope, eight free-licensed Commons photos with credits.

## What was fixed today

- Colour system replaces the monochrome: warm paper, deep ink, electric blue accent, yellow/green/pink tags, colour photography everywhere.
- Photos added to every page that lacked them (about, careers, contact, pricing, FAQ, API, partners, press, explore, create, community, login, event poster); twelve free-licensed photos now.
- Smooth navigation: cross-page fade via the View Transitions API with a JS fallback, staggered section reveals, hover motion on cards, rows, buttons and images.

- Every placeholder `#` link on the ten original pages, roughly 170 of them, now goes somewhere real.
- Host dashboard removed from the site as asked.
- Statement block shrunk; all headings on one scale.
- Lowercase voice applied to buttons, labels and blog titles that had slipped through.
- Team cells on About no longer overlap their labels.
- Link checker now understands query strings and mailto links.

## What is not there, and knows it

These are honest limits of a static prototype. Each one is labelled on the page.

1. **No backend.** Checkout, create, login, follow, subscribe and contact all confirm in place and route onward; nothing is stored or sent. The `app/` scaffold is where this becomes real.
2. **Sample data.** Events, communities, people, counts, venues and the 75,000-subscriber line are invented. Footers say so.
3. **Founder name and bio** on About are placeholders.
4. **Social handles** in the footer are the ones we would register; they are not live accounts yet.
5. **Wallet passes, PDF receipts, sponsor dashboard, hackathon mode** are described, not built.
6. **Legal pages** are drafts, not reviewed.
7. **The eight `design-*.html` explorations** remain in the repo root for reference and are not linked from the site. They still contain placeholder links; they are not part of the product.
8. **Photos** are Wikimedia Commons stand-ins. Real event photography should replace the hero and hackathon images before launch.

## What is there (platform scaffold, `app/`)

Built today, type-checks and `next build` passes. Not yet run against a database.

- Next.js 16 App Router, TypeScript, Prisma 6 on Postgres.
- Auth.js magic links (Resend); in development without a key the link prints to the console.
- Data model: users, communities, members, follows, events, agenda items, ticket tiers, orders, tickets, check-ins.
- Routes: home, city hub, event page with free RSVP or Stripe Checkout (USD/EUR/GBP), Stripe webhook that issues tickets, ticket page with QR, community page with follow, create event with tiers, host view (stats, attendees, email blast, door PIN, publish which emails followers), door scanner (PIN + camera via BarcodeDetector or typed code), account page.
- Seed script with three communities and four events; door PIN 4821.
- README with setup and deploy notes.

## Platform build, day one

Design A chosen. The app now wears it: shell with sidebar and tab bar, explore with city and type filters, tickets with a wallet card, host home with KPIs and a sparkline, communities in three tabs, settings that save, notifications, and every existing page (city, event, ticket, community, create, manage, door, login) moved into the shell. Schema gained `User.city`, `onGuestList`, `badge` and `Event.cover`; the create flow assigns a cover by type. Type-checks and builds. Still not run against a live database in this environment (no Postgres here); that is the first thing to do on a machine with one.

## What needs to be there next (tomorrow onward)

**Week 1: make it real**
1. Provision Postgres (Neon or Supabase), run `db:push` and `db:seed`, run the app locally, fix what only a live database reveals.
2. Deploy to Vercel with Resend and Stripe test keys; register the webhook; buy a test ticket end to end; scan it.
3. Port the marketing design system onto the app shell so the product looks like the site.

**Week 2: what hosts will ask for on day one**
4. Edit event after creation; cancel with automatic refunds.
5. Stripe Connect so hosts receive payouts directly.
6. Agenda and speaker editing in the create flow; CFP submissions.
7. Real contact form and subscribe list (Resend audiences).
8. Domain, DNS, email sending domain, social handles.

**Week 3–4: the wedge**
9. Onboard the first three to five communities in one launch city, remotely; host the first event yourself.
10. City email every Monday.
11. Sponsor slots sold on the page.
12. WhatsApp and SMS blasts.

**Before the YC application**
13. Real numbers: communities, events, tickets, show-up rate.
14. Founder bio, video, and the open questions in `docs/YC-APPLICATION.md`.

## Where everything lives

- Site: repo root, `index.html` and the other 25 pages, `assets/`, `img/`, `fonts/`.
- Platform: `app/`.
- Docs: `CONCEPT.md`, `docs/HOW-IT-WORKS.md`, `docs/YC-APPLICATION.md`, this file.
- Preview: https://claude.ai/artifact/2WU9BLP2SfRgCkFuFRkd8U
