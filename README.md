# LTL26 — Louder Than Life 2026 Interactive Map

**https://ltl26.com** — unofficial fan festival companion.

Created by [Laughing Dragons Productions](https://brandonsparks.com).

## Live site

- Production: **https://ltl26.com** (Vercel + HTTPS)
- Coming soon landing → full map, schedule, VIP guides rolling out before Sept 17, 2026

## Local development

```bash
npm install
npm run dev
```

Open **http://localhost:3000** → **Preview map** → `/map` for the base build test.

### Map base build (current scope)

- **Home** (`/`) — coming soon landing with **Preview map** link
- **Map** (`/map`) — official amenity image + tap pins (stages, entrances, VIP, POIs)
- **Pass tier** toggle in header (GA / VIP / Top Shelf) filters VIP-only pins
- **Layer chips** toggle categories on/off
- Satellite overlay and other routes exist in repo but are not linked yet

Test on your phone: run dev with `npm run dev -- -H 0.0.0.0` and open your PC's LAN IP on the same Wi‑Fi.

## Deploy

```bash
npx vercel --prod
```

### Custom domain (ltl26.com)

1. Vercel project → Settings → Domains → add `ltl26.com` and `www.ltl26.com`
2. At your registrar, point DNS to Vercel:
   - **A** `@` → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
3. Vercel provisions HTTPS automatically.

## Repo

**https://github.com/laughingdragonsproductions/ltl-2026**

### First-time Vercel setup

1. [Import the GitHub repo](https://vercel.com/new) into Vercel (Laughing Dragons account).
2. Framework preset: **Next.js** — defaults are fine; `vercel.json` is included.
3. Deploy once on the default `*.vercel.app` URL to confirm the build.
4. **Settings → Domains** → add `ltl26.com` and `www.ltl26.com`.
5. At your domain registrar, set:
   - **A** `@` → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
6. Wait for Vercel to show **Valid Configuration** and issue HTTPS (usually a few minutes).

## Data

Structured festival data lives in `data/` on `G:\ltl-2026`.
