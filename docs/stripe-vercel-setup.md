# Stripe on Vercel (test mode, checkout gated)

Public checkout stays hidden until `NEXT_PUBLIC_STRIPE_ENABLED=true`. Until then, premium gates show **Coming soon**.

## What $5 unlocks

- Walking 3D map (`/walkthrough`)
- All festival games (one game free — user picks on first visit)
- Ad-free experience

**Free forever:** basic tap map (`/map`), GPS overlay (`/overlay`), locators, Flappy Skull.

## Vercel environment variables

Add these in **Project → Settings → Environment Variables** for Preview and Production:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_test_…` from [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys) |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Test Payment Link URL (`https://buy.stripe.com/test_…`) |
| `NEXT_PUBLIC_STRIPE_ENABLED` | `false` until ready to expose checkout publicly |

Optional: `NEXT_PUBLIC_KOFI_URL` for Ko-fi tips.

## Payment Link success URL

Until `ltl26.com` DNS is live, set the Payment Link success redirect to:

```
https://ltl-2026.vercel.app/support/success?session_id={CHECKOUT_SESSION_ID}
```

After DNS is fixed, update to:

```
https://ltl26.com/support/success?session_id={CHECKOUT_SESSION_ID}
```

## Enabling checkout

1. Confirm test purchases work with `NEXT_PUBLIC_STRIPE_ENABLED=true` on a Preview deployment.
2. Set `NEXT_PUBLIC_STRIPE_ENABLED=true` on Production when ready.
3. For live charges, swap to `sk_live_…` and a live Payment Link, then redeploy.

### Go live (after Stripe “account ready” email)

1. [Stripe Dashboard](https://dashboard.stripe.com) → toggle **Live** (top right).
2. **Product catalog** → create or reuse a **$5** one-time product (e.g. “LTL26 unlock — 3D walk + all games”).
3. **Payment Links** → create link for that product. Set **After payment** redirect to:
   ```
   https://www.ltl26.com/support/success?session_id={CHECKOUT_SESSION_ID}
   ```
4. **Developers → API keys** → copy **Secret key** (`sk_live_…`).
5. **Vercel → ltl-2026 → Settings → Environment Variables** (Production):
   - `STRIPE_SECRET_KEY` = `sk_live_…`
   - `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` = live link (`https://buy.stripe.com/…` — no `test_` in URL)
   - `NEXT_PUBLIC_STRIPE_ENABLED` = `true`
6. **Redeploy** production (`npx vercel deploy --prod` or push to `master`).

Until step 5 uses live keys, checkout runs in **Stripe test mode** (test card `4242 4242 4242 4242`).

## Verify endpoint

`POST /api/verify-payment` uses `STRIPE_SECRET_KEY` to confirm `session_id` after redirect. No code changes needed when flipping from test to live keys.
