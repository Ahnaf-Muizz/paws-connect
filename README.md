# PAWS Connect

**Pets And Their Worlds Connected.** Shelters around Lubbock are often full, and when there's no room, pets can end up on the streets. PAWS Connect links pets who need a new home directly with safe, screened families, so they go from one home to the next without a shelter stop.

It's an installable web app (PWA) built for phones and desktops, deployed on Vercel.

## Features

- **Directory:** Pets, Shelters (with live capacity), Vets (including 24/7 emergency), Owners, a Resources hub (insurance, food, clinics, groomers, medicine), and Nonprofits (Houston SPCA plus Lubbock and South Plains organizations).
- **Matching:** adopters fill in a lifestyle profile and get a weighted match score with reasons for each pet. They can like or pass, then apply. Applications move through screening steps (identity, home, references) before a decision.
- **Rehoming:** logged-in owners post their own pets with photos, health records, and the kind of home they need.
- **Shop and checkout:** cart (works logged out and merges on login), simulated card payment, and order receipts.
- **Community:** favorites, owner-to-adopter messaging, lost and found reports, foster sign-ups, events with RSVP and calendar export, donations to shelters, reviews, a map of shelters and vets, care guides, and a cost-of-ownership estimator.
- **Light and dark mode**, a bottom tab bar on mobile, and an offline fallback page.

> **Demo data.** Pets, owners, products, and reviews are fictional ("Sample listing"). Real organizations link to their official sites. Payments are simulated and no card is ever charged.

## Demo login

| Email | Password |
| --- | --- |
| `demo@pawsconnect.org` | `paws1234` |

Test cards: `4242 4242 4242 4242` succeeds and `4000 0000 0000 0002` is declined. Any future expiry and any CVC work.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4
- [Neon](https://neon.tech) Postgres with [Drizzle ORM](https://orm.drizzle.team)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for photo uploads (sent straight from the browser)
- Session auth with bcrypt and a signed `jose` JWT cookie
- [Serwist](https://serwist.pages.dev) service worker, plus Leaflet and OpenStreetMap for the map

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed: without `DATABASE_URL` the app runs on an in-memory Postgres (PGlite) that is migrated and seeded on startup, and uploaded photos go to `.data/uploads`. **This data resets every time the server restarts.**

To use your Neon database locally instead, copy `.env.example` to `.env.local` and fill it in, or run `vercel env pull .env.local` once the project is linked.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and server (the service worker only runs in production) |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks |
| `npm run db:generate` | Generate a new migration after editing `lib/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to `DATABASE_URL` |
| `npm run db:seed` | Seed demo data (skipped if users already exist) |
| `npm run db:reset` | Wipe every table and reseed |
| `npm run icons` | Regenerate the logo, PWA icons, and favicon from `Paws Connect.png` |

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production | Neon connection string. Added by the Vercel Neon integration. |
| `AUTH_SECRET` | Production | Signs session cookies. The app refuses to start on Vercel without it. |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob token for photo uploads. Added when you create a Blob store. |

## Deploy to Vercel

1. Push this repository to GitHub (or GitLab or Bitbucket) and import it at [vercel.com/new](https://vercel.com/new). The framework preset is detected as Next.js, so no build settings need changing.
2. In the project, open **Storage**:
   - **Create Database → Neon** and connect it to all environments. This adds `DATABASE_URL`.
   - **Create → Blob** and connect it. This adds `BLOB_READ_WRITE_TOKEN`.
3. In **Settings → Environment Variables**, add `AUTH_SECRET` with a long random value:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

4. Create the tables and demo data from your machine:

   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npm run db:migrate
   npm run db:seed
   ```

5. Redeploy from the dashboard (or run `vercel --prod`) so the new environment variables take effect.

After deploying, check that you can log in with the demo account, upload a photo on **Rehome**, and complete a test checkout. On a phone, use **Add to Home Screen** to install the app.

## Project layout

```
app/(site)/        Pages (directory, matching, rehoming, commerce, community)
app/api/           Route handlers (auth, pets, matches, cart, checkout, messages, ...)
app/sw.ts          Service worker source (bundled by Serwist at /serwist/sw.js)
components/        UI, providers (session, cart, favorites), and feature components
lib/db/            Drizzle schema, migrations runner, and seed data
lib/               Queries, matching, payments simulation, validators, guides, costs
proxy.ts           Redirects logged-out visitors away from account pages
drizzle/           SQL migrations
```
