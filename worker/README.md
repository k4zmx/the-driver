# Driver Services — Cloudflare Worker

Receives booking submissions from the Astro static site and sends two emails
via Resend: a French branded notification to the chauffeur and an English
auto-confirmation to the customer.

The Worker is independent of the static site — deploy it once, the URL is
permanent, the static site fetches that URL.

## One-time setup

```bash
cd worker

# 1. Install Wrangler
npm install

# 2. Log in to Cloudflare (opens your browser)
npx wrangler login

# 3. Add the Resend API key as a server-side secret.
#    Paste the key when Wrangler prompts (it never lands in the repo).
npx wrangler secret put RESEND_API_KEY

# 4. Deploy
npx wrangler deploy
```

Wrangler will print the public URL, e.g.:

```
Deployed driver-services-form
https://driver-services-form.your-subdomain.workers.dev
```

Copy that URL into the project root `.env`:

```
PUBLIC_WORKER_URL=https://driver-services-form.your-subdomain.workers.dev
```

Then rebuild the Astro site (`npm run build`) — the Worker URL gets baked into
the booking form's submit handler.

## Updating the Worker later

If you change `worker.js` or any template:

```bash
cd worker
npm run deploy
```

The Worker updates instantly on Cloudflare's edge. The URL doesn't change, so
no site rebuild is required unless the email TEMPLATE was changed (templates
live inside the Worker — not in the Astro project).

## Sender domain

The Worker sends both emails from `Driver Services <noreply@fix-and-go.eu>`.
The `fix-and-go.eu` domain is verified in Resend, so the Worker can deliver
to any recipient — `the.driver@hotmail.com` for the chauffeur notification
and arbitrary customer addresses for the auto-confirmation.

To change the sender (or move to a different verified domain), edit
`FROM_ADDRESS` at the top of `worker.js` and redeploy with `npm run deploy`.

## Local development

```bash
npm run dev
```

Wrangler starts a local Worker on `http://localhost:8787`. You can `curl` it:

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "phone": "612345678",
    "countryCode": "+33",
    "pickup": "CDG",
    "dropoff": "Paris",
    "date": "2026-03-28",
    "time": "14:30",
    "pax": 4,
    "tripType": "one-way",
    "totalPrice": 95,
    "vehicleSummary": "1× Vito",
    "flightNumber": "AF1234",
    "locale": "fr"
  }'
```

Local dev needs `RESEND_API_KEY` available — Wrangler reads it from a `.dev.vars`
file at this directory's root (which is gitignored):

```
# worker/.dev.vars (NOT committed)
RESEND_API_KEY=re_your_actual_key_here
```

## Files

| File | Purpose |
|---|---|
| `worker.js` | Entry point — handles fetch, validates, calls Resend |
| `wrangler.toml` | Deployment config (name, compatibility date) |
| `templates/clientEmail.js` | French branded HTML — chauffeur notification |
| `templates/customerEmail.js` | English branded HTML — customer auto-confirmation |
| `package.json` | Wrangler dependency only |

## Architecture quick view

```
[Astro static site] ── POST JSON ──> [Cloudflare Worker]
                                          ├─> [Resend API] ─> the.driver@hotmail.com (FR HTML)
                                          └─> [Resend API] ─> customer email (EN HTML)
```

Worker free tier: 100,000 requests/day. Resend free tier: 3,000 emails/month.
For a chauffeur business, both limits are effectively infinite.
