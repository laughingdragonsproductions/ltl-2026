export type PromoAd = {
  id: string;
  title: string;
  tagline: string;
  href: string;
  cta: string;
  accent: "green" | "purple" | "orange";
  /** Opens $5 unlock flow instead of navigating href */
  action?: "unlock";
};

const UNLOCK_EVERY = 4;

/** In-browser promo units for LDP network — hidden after Stripe unlock */
export const PROMO_ADS: PromoAd[] = [
  {
    id: "litprintz",
    title: "LitPrintz.com",
    tagline: "Custom prints & festival merch — in association with LTL26",
    href: "https://litprintz.com",
    cta: "Visit LitPrintz",
    accent: "purple",
  },
  {
    id: "ldp",
    title: "Laughing Dragons Productions",
    tagline: "Games, sites, and creative tools from the LDP studio",
    href: "/",
    cta: "Explore LTL26",
    accent: "green",
  },
  {
    id: "ltl26",
    title: "Virtual Overlay",
    tagline: "Live GPS on the grounds — free overlay with tap locators",
    href: "/overlay/live",
    cta: "Try overlay",
    accent: "orange",
  },
];

/** Every 4th rotation slot — remove ads + unlock all games for $5 */
export const UNLOCK_PROMO_AD: PromoAd = {
  id: "unlock-premium",
  title: "Want to remove ads and unlock all games and more features?",
  tagline: "$5 unlocks the 3D walk, all games, and an ad-free experience.",
  href: "#",
  cta: "Unlock for $5",
  accent: "green",
  action: "unlock",
};

/** Regular promos ×3, then unlock ad, repeating (0–2 promo, 3 unlock, …). */
export function getPromoAdAtRotationIndex(index: number): PromoAd {
  const slot = ((index % UNLOCK_EVERY) + UNLOCK_EVERY) % UNLOCK_EVERY;
  if (slot === UNLOCK_EVERY - 1) return UNLOCK_PROMO_AD;
  return PROMO_ADS[slot % PROMO_ADS.length];
}

export const LITPRINTZ_URL = "https://litprintz.com";
