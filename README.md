# BarathGo website

Website for **BarathGo**, the cooperative taxi platform launched under NFTCI (National Federation of Tourism & Transport Co-operatives of India). Same stack as the NFTCI site: Next.js static export, served by a Cloudflare Worker.

## Pages

| Path | What it is |
| --- | --- |
| `/` | Home: booking widget, ride types, services, why BarathGo, fare estimator, FAQ |
| `/book` | Ride request form + fare estimator |
| `/services` | City, airport/rail, outstation, rentals, pilgrimage, corporate, EV |
| `/drive` | Driver / fleet / cooperative onboarding + sign-up form |
| `/business` | Corporate, PSU and institutional travel + enquiry form |
| `/safety`, `/about`, `/contact`, `/privacy`, `/terms` | Supporting pages |

## How bookings work (until the passenger app is live)

All forms POST to `/api/request` ([worker/index.ts](worker/index.ts)), which emails the request to the dispatch inbox via [Resend](https://resend.com). The team confirms rides by call/SMS. If email isn't configured (or during `npm run dev`), the form opens the visitor's email app with the details pre-filled.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 (forms fall back to mailto)
npm run build      # static export to out/
npm run preview    # build + run the Worker locally with wrangler
npm run typecheck
```

## Deploy (Cloudflare)

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put MAIL_TO          # e.g. dispatch@barathgo.com,ops@barathgo.com
npm run deploy
```

Then attach `barathgo.com` and `www.barathgo.com` as custom domains on the `barathgo-web` Worker, and verify the `barathgo.com` sending domain in Resend.

## Before launch — confirm with the team

All in [lib/site.ts](lib/site.ts) unless noted:

- Support email (`hello@barathgo.com` is a placeholder)
- Indicative fares per ride type (`rideTypes`)
- Privacy notice and terms ([app/privacy](app/privacy/page.tsx), [app/terms](app/terms/page.tsx)) — need legal review (DPDP Act 2023)
- Driver benefit claims on [/drive](app/drive/page.tsx) (welfare, weekly payouts, 2-day callback) and the rollout phases on [/about](app/about/page.tsx)
