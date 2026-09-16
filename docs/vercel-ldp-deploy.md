# Deploy ltl26.com on Laughing Dragons (Vercel)

The GitHub repo is ready. Production builds pass (`npm run build`). What’s missing is linking the repo to the **LDP Vercel account** and pointing **ltl26.com** DNS.

## Option A — GitHub import (recommended, auto-deploy on push)

1. Sign in at [vercel.com](https://vercel.com) with **Laughing Dragons Productions** (`laughingdragonsproductions@gmail.com`).
2. **Add New → Project** → import **laughingdragonsproductions/ltl-2026**.
3. Framework: **Next.js** (auto-detected). Root: repo root. Build: `npm run build`.
4. **Environment variables** (Production + Preview):
   - `NEXT_PUBLIC_STRIPE_ENABLED` = `false` (flip to `true` when checkout is ready)
   - `STRIPE_SECRET_KEY` = `sk_test_…` (optional until checkout)
   - `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` = test payment link URL (optional)
5. Deploy. Production URL will be `https://ltl-2026.vercel.app` (or similar).
6. **Project → Settings → Domains** → add `ltl26.com` and `www.ltl26.com`.
7. **DNS (Cloudflare)** — zone `ltl26.com` is already on Cloudflare (`christian.ns.cloudflare.com`, `pat.ns.cloudflare.com`). Add:

   | Type | Name | Content | Proxy |
   |------|------|---------|-------|
   | CNAME | `@` | `c54f8827fb1cb323.vercel-dns-017.com` | DNS only (grey cloud) |
   | CNAME | `www` | `c54f8827fb1cb323.vercel-dns-017.com` | DNS only (grey cloud) |

   Get the current project CNAME from `npx vercel domains verify ltl26.com` if Vercel changes it.

   Dashboard: [Cloudflare DNS for ltl26.com](https://dash.cloudflare.com/d3d0d817a23ee9ca53fc6bbbbf22cc0f/ltl26.com/dns/records)

   Or with an API token (`Zone → DNS → Edit`):

   ```bash
   set CLOUDFLARE_API_TOKEN=your_token
   node scripts/setup-ltl26-dns.mjs
   ```

8. Wait for DNS (often 5–60 min). Vercel will issue HTTPS automatically.

## Option B — Vercel CLI (one-time from this machine)

```bash
cd G:\ltl-2026
npx vercel login
npx vercel link          # pick LDP account/team, project name: ltl-2026
npx vercel deploy --prod
npx vercel domains add ltl26.com
npx vercel domains add www.ltl26.com
```

Then configure DNS as in step 7 above.

## Verify

- https://ltl-2026.vercel.app/ — home loads
- https://ltl-2026.vercel.app/map — tap map
- https://ltl26.com/ — works after DNS + domain added in Vercel

## Current status (Sep 2026)

| Issue | Status |
|-------|--------|
| Code on GitHub `master` | ✅ pushed |
| Vercel project `ltl-2026` under LDP | ✅ live at https://ltl-2026.vercel.app |
| Domains added in Vercel | ✅ `ltl26.com`, `www.ltl26.com` (pending DNS verify) |
| Cloudflare zone | ✅ active |
| DNS CNAME records | ✅ project-specific Vercel CNAME (both `@` and `www`) |
| HTTPS | ✅ after DNS + `vercel deploy --prod` |

Verify: `npx vercel domains verify ltl26.com` → `configured-correctly`.
If HTTPS fails locally, flush DNS (`ipconfig /flushdns`) — home routers cache old A records.
