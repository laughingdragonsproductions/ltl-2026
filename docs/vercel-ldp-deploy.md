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
7. At your domain registrar, set:
   - **A** record `@` → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
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

## Current blockers (as of last check)

| Issue | Status |
|-------|--------|
| Code on GitHub `master` | ✅ pushed |
| Vercel CLI logged in on dev machine | ❌ needs `vercel login` |
| GitHub ↔ Vercel project under LDP account | ❌ import at vercel.com/new |
| `ltl26.com` DNS | ❌ NXDOMAIN — no A/CNAME records yet |

The old `ltl-2026.vercel.app` URL may be a temporary/orphan deploy not tied to your LDP account. Re-importing the repo under LDP fixes that.
