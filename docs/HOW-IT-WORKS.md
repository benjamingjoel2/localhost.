# How Localhost works

Two sides, one object. **Hosts** (communities and organizers) create events. **Attendees** (people buying or claiming tickets) find them, go, and come back. The event page is the object both sides share; everything else hangs off it.

## 1. The host side

### Who hosts
- Community organizers (monthly meetups, hack nights). Most events, zero budget, the wedge.
- Hackathon leads, conference and summit producers, DevRel teams on city tours, founders and funds running demo days and dinners, university clubs.

### The host loop
1. **Claim a community** at `localhost/c/<name>`. Free. Co-hosts can be added. The community page carries followers, upcoming and past events, show-up rate, sponsors.
2. **Create an event** (`create.html`). Pick a type; the type pre-selects the right blocks (agenda, CFP, sponsors, hackathon mode, guest list, wall, recording). Fill basics, set tiers and currency, publish. Every event gets a URL under its city: `localhost/berlin/demo-night-13`.
3. **Distribution happens automatically.** Followers get a text and email first (24h early access if the host wants), then the event lists in the city hub and the Monday city email, with rich previews in Slack, WhatsApp, X and LinkedIn.
4. **Run the room** (`dashboard.html`). Live sales and check-ins, attendee table with role, company and badge flags, blasts to text, email, WhatsApp, Slack and Discord, a door PIN so any crew phone becomes a scanner, badges printed on scan.
5. **After.** Recording, slides and photos drop on the same link. Attendees who ticked the box get them. The community's follower count and show-up rate update. Next month's event can be created from the API or the Slack bot.

### What hosts pay
- Free events: nothing, ever, unlimited.
- Paid tickets and sponsor slots: 3.5% + €0.30 (or $/£ equivalent) per paid item, card processing included, no separate service fee shown to buyers. Payout two days after the event.

## 2. The attendee side

### Who attends
Engineers, designers, founders, PMs, researchers, students. They decide based on three things: who else is going, whether it is worth the evening, and whether they will get the recording if they cannot make it.

### The attendee loop
1. **Discover.** City hub (`localhost/berlin`), the Monday city email, a link shared in Slack or WhatsApp, or a community they follow.
2. **Decide on the page** (`event.html`). Agenda and speakers, who's going with roles and companies, sponsors, the wall with the host's latest notes, the price in their currency.
3. **Get a ticket** (`checkout.html`). Free tickets are one tap. Paid: card, Apple Pay, Google Pay or SEPA in EUR, USD or GBP. They choose whether to appear on the guest list and whether their badge says "hiring" or "looking". Company and VAT go on the receipt so they can expense it.
4. **Hold the ticket** (`ticket.html`). QR in the wallet, calendar entry, a text ten minutes before the first talk, one-tap refund inside the host's window.
5. **At the door.** Scan, badge prints, in. Badges carry a QR: scan another person to swap profiles.
6. **After.** Recording and files on the same link, the attendee directory open for a week, and a follow on the host so the next one arrives first.

## 3. The money

- Attendee pays the ticket price. Localhost keeps 3.5% + €0.30, pays the card fees out of that, and pays the host the rest two days after the event.
- Sponsor slots are sold on the event page the same way. Sponsors get a dashboard with scans and consented leads.
- Free events cost Localhost money (SMS, hosting) and are the acquisition channel. Paid events and sponsor slots pay for them.

## 4. Why it can win

- **Tech only.** Discovery works because the feed is not polluted. A city hub with 97 events is useful when all 97 are for builders.
- **The right blocks.** Speakers, agenda, CFP, sponsors, hackathon teams, badges. Generic tools make hosts fake these in a description field.
- **The guest list is the product.** Who else is going, with role and company, is the reason people show up. It is opt-in and only visible to ticket holders.
- **Communities, not events, are the unit of growth.** A follower gets every future event. Every event grows the community. The city hub aggregates communities.
- **Global from day one.** Three currencies, VAT receipts, and cities on three continents where the tech scene is real but the tooling is not.

## 5. Notes towards a YC application

Answers below are drafts to react to, not final copy.

**What does your company do?** Localhost is the event platform for tech: Partiful's ease with the tools meetups, hackathons and conferences actually need, and a city-by-city hub of tech events only.

**Why now?** In-person tech events came back harder than they left. Luma and Partiful proved people want lightweight event pages; neither knows what a speaker, a sponsor or a hackathon team is. Meetup is a legacy product. Eventbrite is a box office with fees.

**Who is the user, and how do you reach them?** Hosts: community organizers first, since they run the most events and pay nothing. We recruit 3 to 5 anchor communities per city, give them the free tier and badges for their first event, and their followers become the city's first attendees. Attendees arrive through hosts' links and the Monday city email.

**How do you make money?** 3.5% + €0.30 per paid ticket and sponsor slot. Free events are free. Later: a Pro tier for communities (custom domain, CRM sync, analytics) and paid placement in city hubs, clearly labelled.

**What is the wedge and the moat?** The wedge is free, better event pages for meetups. The moat is the follower graph between communities and attendees per city: once a city's communities live on Localhost, the hub is where the scene looks, and a new tool would have to move the whole scene at once.

**What have you built?** This prototype: home, explore, city hub, event page, checkout, ticket, create flow, host dashboard, community profile, pricing, login. The next step is the working MVP in `CONCEPT.md` section 10.

**Metrics to have before applying (targets).** Communities claimed, events created, tickets issued (free and paid), show-up rate, follower growth per event, weekly active cities, and gross ticket volume. One city with 20 active communities and a rising Monday email open rate is a stronger story than five cities with two each.

**Open questions to decide together.**
1. Launch city: one city deep (Berlin or SF) or two (one US, one EU) from day one?
2. Do hosts ever pay a subscription, or is it take-rate only?
3. How strict is "tech only" at review, and who reviews?
4. Native app timing: PWA first, or native for the badge scanner and wallet passes at launch?
5. Sponsor marketplace: is that phase two or a launch feature?
