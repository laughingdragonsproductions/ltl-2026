# Stripe on Vercel — games unlock ($5)

Checkout is live when `NEXT_PUBLIC_STRIPE_ENABLED=true` and a Payment Link is set.

## What $5 unlocks

- **All festival games** (one game free — user picks on first visit)
- **Google Calendar export** for My sets on Schedule
- **Ad-free** experience

**Free forever:** tap map, GPS overlay, locators, in-app schedule alerts, one game of your choice.

## Vercel environment variables (Production)

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_…` (or `sk_test_…` for test mode) |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Payment Link URL (`https://buy.stripe.com/…`) |
| `NEXT_PUBLIC_STRIPE_ENABLED` | `true` |
| `STRIPE_PAYMENT_LINK_ID` | Optional `plink_…` — rejects verify for other sessions |
| `STRIPE_UNLOCK_AMOUNT_CENTS` | Optional — default `500` ($5.00) |
| `STRIPE_MAX_REDEMPTIONS` | Optional — default `3` devices per checkout |

Optional: `NEXT_PUBLIC_KOFI_URL` for Ko-fi tips.

## Payment Link success URL

```
https://www.ltl26.com/support/success?session_id={CHECKOUT_SESSION_ID}
```

## Go live checklist (event weekend)

1. Stripe Dashboard → **Live** mode → create **$5** one-time product (e.g. “LTL26 — all games + calendar”).
2. **Payment Links** → set redirect to success URL above.
3. Vercel → **Production** env:
   - `STRIPE_SECRET_KEY` = `sk_live_…`
   - `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` = live link (no `test_` in URL)
   - `NEXT_PUBLIC_STRIPE_ENABLED` = `true`
4. **Deploy** production (`git push` or `npx vercel deploy --prod`).
5. Test: pay with a real card → land on `/support/success` → confetti → all games unlocked.

**Test mode only:** use test card `4242 4242 4242 4242` — no real charges until live keys are set.

## Verify endpoint

`POST /api/verify-payment` confirms `session_id` after redirect:

- Validates paid status, amount (500 USD cents default), optional Payment Link ID
- Max **3** device redemptions per payment (Stripe session metadata)
- Success page strips `session_id` from URL after verify
