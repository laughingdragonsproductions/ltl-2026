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

GitHub: `laughingdragonsproductions/ltl-2026` (or as configured)

## Data

Structured festival data lives in `data/` on `G:\ltl-2026`.
