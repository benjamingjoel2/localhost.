# Deploy Localhost

Two things get deployed: the **platform** (`app/`, Next.js + Postgres) and the **marketing site** (repo root, static). Both go on Vercel, from this GitHub repo, as two projects. Total time: about ten minutes.

## 1. Database (Neon, free)

1. Go to https://neon.tech, sign in with GitHub, click **New project**. Name it `localhost`, region **Frankfurt** (closest to Berlin and London).
2. Copy the connection string it shows (starts with `postgresql://…neon.tech/neondb?sslmode=require`). Keep it for step 2.

## 2. Platform on Vercel

1. Go to https://vercel.com/new, sign in with GitHub, pick the repo **benjamingjoel2/test**.
2. **Root Directory**: click *Edit* and choose `app`. Framework is detected as Next.js. Leave build settings alone; `app/vercel.json` sets the build to generate the Prisma client, push the schema and build.
3. **Environment variables** (add all four):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon string from step 1 |
   | `AUTH_SECRET` | any long random string, e.g. run `openssl rand -base64 32` |
   | `AUTH_URL` | leave blank for now; set after first deploy to `https://<your-project>.vercel.app` |
   | `NEXT_PUBLIC_BASE_URL` | same as `AUTH_URL` |

4. Click **Deploy**. First build takes 2–3 minutes. You get `https://<project>.vercel.app`.
5. Go to *Settings → Environment Variables*, set `AUTH_URL` and `NEXT_PUBLIC_BASE_URL` to that URL, then *Deployments → Redeploy*.
6. Sample data seeds itself on every Vercel build (the seed is idempotent, so it never duplicates). Host login `host@localhost.events`, door PIN 4821. To seed by hand instead: `cd app && npm run db:seed` with the Neon URL in `app/.env`.

Since the repo is connected, every push to the branch Vercel is watching redeploys automatically. Point it at `main` after the PR merges, or at `claude/youthful-euler-p3fn0e` now (Settings → Git → Production Branch).

## 3. Email and payments (when you want them live)

- **Resend** (magic links, tickets, blasts): https://resend.com → API key → add `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `Localhost <tickets@yourdomain.com>` after verifying the domain). Without it, sign-in links only print to the Vercel function logs, so this is needed for anyone else to log in.
- **Stripe** (paid tiers): add `STRIPE_SECRET_KEY` (test key first). In Stripe → Developers → Webhooks add `https://<project>.vercel.app/api/stripe/webhook` for `checkout.session.completed` and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Redeploy.

## 4. Marketing site on Vercel

1. https://vercel.com/new again, same repo, **Root Directory** left at `/`, Framework **Other**. No build command, no output directory. Deploy.
2. You get a second URL for the static site. Later, put the site on `localhost.events` and the app on `app.localhost.events` (Vercel → Settings → Domains on each project).

## 5. Custom domain

Buy the domain (Namecheap, Cloudflare), then in each Vercel project → Settings → Domains add it and set the DNS records Vercel shows. Update `AUTH_URL` and `NEXT_PUBLIC_BASE_URL` to the final app domain and redeploy.

## If I should do this for you

Give me a Vercel token (vercel.com → Settings → Tokens) and a Neon connection string here, and I'll run the deploy from the CLI. Note: this container's network currently blocks api.vercel.com, so it may still have to be from your machine.
