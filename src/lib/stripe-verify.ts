import type Stripe from "stripe";

const SESSION_ID_RE = /^cs_(test|live)_[a-zA-Z0-9]{8,}$/;

export function isValidCheckoutSessionId(sessionId: string): boolean {
  return sessionId.length <= 256 && SESSION_ID_RE.test(sessionId);
}

function expectedAmountCents(): number {
  const raw = process.env.STRIPE_UNLOCK_AMOUNT_CENTS ?? "500";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 500;
}

function expectedCurrency(): string {
  return (process.env.STRIPE_UNLOCK_CURRENCY ?? "usd").toLowerCase();
}

function maxRedemptions(): number {
  const raw = process.env.STRIPE_MAX_REDEMPTIONS ?? "3";
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 3;
}

export type StripeVerifyFailure =
  | "invalid_session"
  | "not_paid"
  | "wrong_amount"
  | "wrong_payment_link"
  | "redemption_exhausted";

export function validatePaidUnlockSession(session: Stripe.Checkout.Session):
  | { ok: true; redeemCount: number }
  | { ok: false; reason: StripeVerifyFailure } {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not_paid" };
  }

  const amount = session.amount_total;
  if (amount == null || amount !== expectedAmountCents()) {
    return { ok: false, reason: "wrong_amount" };
  }

  const currency = (session.currency ?? "").toLowerCase();
  if (currency !== expectedCurrency()) {
    return { ok: false, reason: "wrong_amount" };
  }

  const expectedLinkId = process.env.STRIPE_PAYMENT_LINK_ID?.trim();
  if (expectedLinkId) {
    const linkId =
      typeof session.payment_link === "string"
        ? session.payment_link
        : session.payment_link?.id;
    if (linkId !== expectedLinkId) {
      return { ok: false, reason: "wrong_payment_link" };
    }
  }

  const redeemCount = Number.parseInt(session.metadata?.ltl26_redeem_count ?? "0", 10);
  const count = Number.isFinite(redeemCount) && redeemCount >= 0 ? redeemCount : 0;
  if (count >= maxRedemptions()) {
    return { ok: false, reason: "redemption_exhausted" };
  }

  return { ok: true, redeemCount: count };
}

export function redemptionMetadata(
  session: Stripe.Checkout.Session,
  redeemCount: number
): Stripe.MetadataParam {
  return {
    ...session.metadata,
    ltl26_redeem_count: String(redeemCount + 1),
    ltl26_last_redeemed_at: new Date().toISOString(),
  };
}
