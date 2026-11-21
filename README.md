# BarathGo

Ride-hailing platform for **BarathGo**, launched under NFTCI (National Federation of Tourism & Transport Co-operatives of India): marketing site, rider app, driver app and admin dashboard. Next.js static export served by a Cloudflare Worker, with the API on Cloudflare D1.

## What's in it

| Path | What it is |
| --- | --- |
| `/` and `/services`, `/drive`, `/business`, `/safety`, `/about`, `/contact`, `/privacy`, `/terms` | Marketing site |
| `/ride` | **Rider app**: search places → route + upfront fares for Auto/Mini/Sedan/SUV/EV with live ETAs → phone login → request → live driver tracking → trip PIN → rating |
| `/driver` | **Driver app**: sign up (vehicle + licence) → approval → go online with GPS → accept requests → arrived → start with rider's PIN → complete → earnings |
| `/admin` | **Admin**: 24 h stats, live map of drivers and rides, ride log, driver approvals and suspensions |

Installable as a home-screen app (web manifest, opens to `/ride`).

### How it works

- **API** — [worker/](worker/) on Cloudflare D1 ([migrations/](migrations/)). Phone OTP login with HttpOnly session cookies; rides go `requested → accepted → arrived → started → completed` (or `cancelled`). Accepting is a conditional update, so only one driver can win a request. Riders and drivers poll every 3–4 s.
- **Pricing** — [lib/fares.ts](lib/fares.ts): base + per-km + per-minute, computed server-side from the real road route. Platform fee 10%.
- **Maps** — MapLibre GL with [OpenFreeMap](https://openfreemap.org) tiles (OpenStreetMap, free, no key). Place search via [Photon](https://photon.komoot.io), routing via OSRM.

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars     # DEV_MODE=1: login codes shown on screen, drivers auto-approved
npm run db:migrate:local
npm run preview                    # builds and serves everything at http://localhost:8787
```

For UI work with hot reload, run `npm run dev:api` (API on :8787) and `npm run dev` (site on :3000, proxies `/api`).

To try a full trip on one computer: open `/driver` in one browser profile and `/ride` in another (any 10-digit mobile starting 6–9; the code is filled in for you in dev mode). Admin: log in at `/admin` with `9999999999` (set in `.dev.vars`).

## Deploy (Cloudflare)

```bash
npx wrangler d1 create barathgo          # paste the database_id into wrangler.jsonc
npm run db:migrate
npx wrangler secret put ADMIN_PHONES     # e.g. 98xxxxxxxx,97xxxxxxxx
npx wrangler secret put TWILIO_ACCOUNT_SID
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put TWILIO_FROM
npx wrangler secret put RESEND_API_KEY   # optional: website enquiry emails
npx wrangler secret put MAIL_TO
npm run deploy
```

Then attach `barathgo.com` and `www.barathgo.com` as custom domains on the `barathgo-web` Worker. **Never set `DEV_MODE` in production.**

## Before launch

- **SMS provider** for login codes. Twilio is wired in; for India you'll likely want an Indian DLT-registered provider (MSG91, 2Factor, Gupshup). Swap `sendSms` in [worker/auth.ts](worker/auth.ts).
- **Routing**: the default OSRM server is the public demo (testing only). Host your own OSRM, or set `OSRM_URL`, or switch to a commercial router.
- **Place search**: Photon is fair-use. At scale, use Ola Maps, MapmyIndia or Google Places behind [lib/places.ts](lib/places.ts).
- **Payments**: riders pay drivers directly by UPI or cash. In-app payments (Razorpay / UPI intent) are not built yet.
- **Confirm with the team**: fares and the 10% platform fee ([lib/fares.ts](lib/fares.ts)), support email ([lib/site.ts](lib/site.ts)), driver benefit claims on `/drive`, and legal review of privacy and terms (DPDP Act 2023).
- Native Android/iOS apps and push notifications are not built; the web apps poll and work in any phone browser.
