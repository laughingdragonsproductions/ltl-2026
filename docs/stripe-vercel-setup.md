# Stripe on Vercel (test mode, checkout gated)

Public checkout stays hidden until `NEXT_PUBLIC_STRIPE_ENABLED=true`. Until then, the paywall shows **Coming soon**.

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

## Verify endpoint

`POST /api/verify-payment` uses `STRIPE_SECRET_KEY` to confirm `session_id` after redirect. No code changes needed when flipping from test to live keys.
