/** Public Stripe checkout — gated until NEXT_PUBLIC_STRIPE_ENABLED=true */
export const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
export const STRIPE_CHECKOUT_ENABLED =
  process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true" && Boolean(STRIPE_PAYMENT_LINK);
