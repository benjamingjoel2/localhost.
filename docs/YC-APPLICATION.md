# YC application — Localhost (working draft)

Status: draft. `[ ]` marks something only the founder can fill in. Answers are written to be pasted into the form, so they are short and plain.
Check the current batch deadline, terms and question list on ycombinator.com/apply before submitting; do not trust this file for dates.

---

## Company

**Company name**
Localhost

**Describe what your company does in 50 characters or less.**
Event pages and tickets, built only for tech.

**Company URL**
[ ] production URL once deployed (the prototype is at the artifact link for now)

**Demo video**
[ ] 1–3 minute screen recording: create an event in Abuja, share the link to WhatsApp, buy a ticket on a phone, scan it at the door. Narrate, don't read.

**What is your company going to make? Please describe your product and what it does or will do.**
Localhost is the event platform for the tech scene: meetups, hackathons, demo days, workshops and conferences, and the communities behind them. A host creates a page in a minute, sells tickets or gives them away, and runs the door from any phone. The page knows what a tech event needs: speakers and an agenda, a call for proposals, sponsor slots sold on the page, hackathon teams and judging, a guest list that shows role and company. Every event lives under its city (localhost/abuja/…), every community has a profile with followers who hear first, and each city gets one curated hub of tech events only. We are launching in Abuja, then Lagos, then Nairobi and Kigali, then London and Berlin.

**Where do you live now, and where would the company be based after YC?**
Abuja, Nigeria. After YC: Lagos or Abuja for operations, with the company incorporated in the US.

**Explain your decision regarding location.**
The tech scenes we serve first are in African cities where the incumbents are weakest. Luma and Eventbrite are US products: no local payment methods, no local currency payouts, no curated city discovery. I am in Abuja and can be at every event we host in the first months. The team stays where the users are while the company is US-incorporated for YC and investors.

---

## Progress

**How far along are you?**
[ ] Update before submitting. Today: a complete clickable prototype (home, explore, city hub, event page, checkout, ticket, create flow, community profile, pricing). [ ] Working MVP live? [ ] Number of events hosted, tickets issued, communities onboarded, show-up rate.

**How long have each of you been working on this? How much of that has been full-time?**
[ ] e.g. "Six weeks, full-time since [date]."

**What tech stack are you using, or planning to use, to build this product?**
[ ] Planned: Next.js and TypeScript, Postgres via Supabase, Stripe for USD/EUR/GBP, Paystack for NGN, WhatsApp Business API and Termii for blasts, Resend for email, Vercel. Static prototype today.

**Are people using your product?**
[ ] Yes/No. If yes: who, how many events, how many tickets.

**Do you have revenue?**
[ ] Free events are free. First paid tickets planned for [event]. Take rate 3.5% + a fixed fee per paid ticket.

**If you are applying with the same idea as a previous batch, did anything change?**
Not applicable.

**If you have already participated or committed to participate in an incubator, accelerator or pre-accelerator program, please tell us about it.**
[ ] None / details.

---

## Idea

**Why did you pick this idea to work on? Do you have domain expertise in this area? How do you know people need what you're making?**
[ ] This is the most important answer in the form and it has to be yours. Fill in: have you organized tech events in Abuja? Run a community? Sat in a WhatsApp group of 300 people trying to coordinate a meetup with a Google Form and a bank transfer? Name the events, the numbers, the pain. If the honest answer is "I noticed the gap but haven't hosted yet", then host three events before submitting and write about those.

**Who are your competitors? What do you understand about your business that they don't?**
Luma is the real competitor; Eventbrite and Meetup are legacy, Partiful is consumer parties. Luma is a good page maker for everything, which means it is a mediocre home for tech events: no speakers, no CFP, no sponsors, no hackathon tooling, no curated discovery, and no local payments or payouts in Nigeria, Kenya or Rwanda. What we understand: (1) discovery only works when the feed is one kind of event, so a tech-only city hub beats a general calendar; (2) the unit of growth is the community, not the event, because a follower gets every future event; (3) in our launch markets the door, the payment and the group chat are the product, and all three run on the phone and on WhatsApp; (4) tech hosts will move for free tooling that removes their spreadsheets, and their attendees follow.

**How do or will you make money? How much could you make?**
Free events are free forever; that is how meetups adopt us. Paid tickets and sponsor slots carry one flat platform fee (3.5% plus a small fixed amount in local currency), card processing included. Later: a Pro tier for communities (custom domain, CRM sync, analytics) and clearly labelled placement in city hubs. [ ] Size: estimate paid tech-event ticket volume in the first ten cities and apply the take rate; add sponsor-slot volume; be specific and show the arithmetic.

**Which category best applies to your company?**
B2B / Marketplace — events and ticketing.

**If you had any other ideas you considered applying with, please list them.**
[ ] Optional.

---

## Equity

**Have you formed any legal entity yet?**
[ ] No / details. YC will incorporate a US Delaware C-corp on acceptance.

**Have you taken any investment yet?**
[ ] No.

**Are you currently fundraising?**
[ ] No, this is the first raise.

---

## Founders

**Founder name, role, background**
[ ] Name. Founder and CEO. [ ] Education, past roles, what you shipped, links (GitHub, LinkedIn, X).

**Please tell us in one or two sentences about the most impressive thing other than this startup that you have built or achieved.**
[ ] One concrete thing with a number in it.

**Are you looking for a cofounder?**
[ ] Recommended answer if true: "Yes, a technical cofounder. I am building the MVP myself / with contractors, and I would rather find the right person than a fast one." If you are technical, say so and say you are open to a cofounder on the business side.

**Why is it just you? (asked in interviews)**
[ ] Prepare: honest, short, no defensiveness. What you cover, what you don't, what you're doing about it.

**Founder video (1 minute)**
[ ] Face to camera, phone is fine. Script: who you are (10s), what Localhost is in one sentence (10s), why you and why Abuja (20s), what you've done so far with numbers (15s), what you'll do with the batch (5s). No slides, no music.

---

## Numbers to have before submitting (targets, not claims)

| Metric | Why it matters |
|---|---|
| Communities onboarded in Abuja | Proves hosts switch |
| Events hosted on Localhost | Proves the product works |
| Tickets issued (free + paid) | Proves attendees come |
| Show-up rate | Proves the guest list and blasts work |
| Follower growth per event | Proves the community loop |
| First paid event and first payout in NGN | Proves the money moves |

One city with 10 active communities and rising Monday-email open rates is a stronger story than five cities with two each.

---

## Open decisions

1. **NGN at checkout.** The site says USD, EUR, GBP. An Abuja launch needs naira via Paystack or Flutterwave. Recommendation: add NGN to checkout, keep the global three.
2. **Launch sequence.** Abuja → Lagos → Nairobi/Kigali → London/Berlin. Recommendation: yes; own one city before the second.
3. **Technical capacity.** Solo founder building the MVP, or technical cofounder first. Recommendation: start building now regardless; keep looking.
4. **Name.** "Localhost" is generic and hard to trademark or search. Decide before submitting; changing later is fine but costs momentum.
5. **Timeline.** Which batch, and does the 30–45 day traction sprint fit before its deadline.
