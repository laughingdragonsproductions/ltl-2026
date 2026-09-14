# LTL26 — Louder Than Life 2026 Interactive Map

**https://ltl26.com/map** — unofficial fan festival companion.

Created by [Laughing Dragons Productions](https://brandonsparks.com).

## Live site

- Production: **https://ltl26.com** (Vercel + HTTPS)
- Default share URL: **https://ltl26.com/map**
- Mobile-first: pinch map, live GPS, schedule, VIP guides, 10-min free session

## Local development

```bash
npm install
npm run dev
```

Open **http://localhost:3000/map**

## Deploy (Vercel)

1. Import **laughingdragonsproductions/ltl-2026** on [vercel.com/new](https://vercel.com/new) (LDP account).
2. Add environment variables (see `.env.example`):
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
   - `NEXT_PUBLIC_KOFI_URL` (optional)
3. Deploy — auto-builds on every push to `master`.
4. **Settings → Domains** → `ltl26.com` + `www.ltl26.com`
5. DNS: **A** `@` → `76.76.21.21`, **CNAME** `www` → `cname.vercel-dns.com`

## Stripe setup

1. [Stripe Dashboard](https://dashboard.stripe.com) → Business name → public-safe name (e.g. “LTL Festival Map”).
2. Product → $5 one-time “LTL 2026 Map Support”.
3. Payment Link → redirect to `https://ltl26.com/support/success?session_id={CHECKOUT_SESSION_ID}`.

## Repo

**https://github.com/laughingdragonsproductions/ltl-2026**

## Features

- **2D tap map** — pinch/pan/zoom on official amenity art
- **Live GPS** — OpenStreetMap + your location vs stages
- **Schedule** — NOW/NEXT, overlap hints, shareable `?day=&stage=&tier=` links
- **Session** — 10 min free, then $5 Stripe unlock through Sept 21
- **PWA** — add to home screen (`manifest.json`)

## Viral video (Google Flow)

Bots write Veo 3 prompts from 2025 LTL recap style → ltl26.com promo.

```bash
npm run flow:brief
```

Output: `assets/flow-export/flow-brief.md`  
Bot instructions: `scripts/google-flow/AGENTS.md`  
Drop 2025 reference stills in `assets/flow-ingredients/` before opening Flow.

## Data

Structured festival data lives in `data/` on `G:\ltl-2026`.
