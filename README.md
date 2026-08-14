# SpotlightIt

A directory for discovering and cheering on independent creators, by niche.
Support is public encouragement, not money — v1 has no payments.

## Screens

1. `/` — Landing page
2. `/browse` — Browse/search approved creators, filter by niche
3. `/creator/[id]` — Creator profile: bio, Instagram link, support wall
4. `/submit` — Submit a creator (self or friend)
5. `/claim/[token]` — Where a creator confirms (or rejects) a listing made about them

## Consent flow

- Every submission is inserted as `status = 'pending'` and is **not** visible on `/browse` or `/creator/[id]` (enforced by Row Level Security, not just app logic).
- The submitter gets a private `claim_token` link. If they're submitting for a friend, they're shown that link to pass along; if a contact email was given, `/api/claim/notify` fires (currently a console-log stub — wire up a real email provider, see below).
- Only visiting `/claim/[token]` and clicking "Yes, this is me" flips the row to `approved`, via the `/api/claim` route, which looks the row up **by token** using the service-role key — this is the only path that can change status.
- The same page lets a creator reject/remove a listing at any time.

**Note:** this is the simple v1 version — the same link stays valid indefinitely rather than rotating after use, and there's no in-app edit form yet (a creator who needs to fix something re-submits or removes and starts over). That's a deliberate simplification to get the core flow tested first; the rotation + edit-form version can be layered back in once this is confirmed working.

## Setup

1. **Create a Supabase project** (free tier is fine).
2. In the SQL Editor, run `supabase/schema.sql`. This creates tables, seeds niches, and sets up Row Level Security policies.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Project Settings > API
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, **keep this secret**, never commit it or expose it client-side
   - `NEXT_PUBLIC_SITE_URL` — your deployed URL (or `http://localhost:3000` for dev)
4. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## Deploy (Vercel free tier)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the four env vars from `.env.example` in Vercel's Project Settings > Environment Variables.
4. Deploy. Update `NEXT_PUBLIC_SITE_URL` to your real Vercel URL afterward.

## Wiring real email for the claim link

`app/api/claim/notify/route.ts` currently just logs the claim URL. To send actual email, the simplest options on free tiers:

- **Resend** (resend.com) — generous free tier, a few lines of SDK code to replace the `console.log`.
- **Supabase Auth email** — if you instead require creators to sign in with a magic link before claiming, Supabase can send that email for you at no extra setup, but that changes the flow (adds a login step before claim).

Until email is wired up, the app still works end-to-end: submitters just need to copy/paste the claim link to the creator themselves (DM, text, etc.), which is the flow the MVP leans on by default.

## PWA

`public/manifest.json` is included so the site is installable on a phone home screen. Add `icon-192.png` and `icon-512.png` to `/public` (any square logo works) — Next.js's App Router handles the manifest link automatically via `app/layout.tsx` metadata.

## Notable design choices

- **RLS does the consent enforcement**, not just UI logic: the `creators` table's `select` policy only returns rows where `status = 'approved'`, so even a bug in the frontend can't leak an unconfirmed listing.
- **The service-role key never touches the browser** — it's only used in the two `app/api/claim/*` server routes.
- Kept intentionally to 5 screens and no auth system for browsing/cheering, per the v1 scope — creators don't need an account to be listed, only to eventually manage edits (a lightweight "owner_user_id" column is in the schema for when you add that later).
