export type PromoAd = {
  id: string;
  title: string;
  tagline: string;
  href: string;
  cta: string;
  accent: "green" | "purple" | "orange";
  /** Opens $5 unlock flow instead of navigating href */
  action?: "unlock" | "install";
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

/** Rotates in the promo carousel when user is eligible to install the PWA */
export const INSTALL_PROMO_AD: PromoAd = {
  id: "install-pwa",
  title: "Add to Home Screen",
  tagline:
    "Save LTL26 for quick access in the crowd — Share → Add to Home Screen (iOS) or Install app (Android).",
  href: "#",
  cta: "Dismiss",
  accent: "green",
  action: "install",
};

/** Every 4th rotation slot — remove ads + unlock all games for $5 */
export const UNLOCK_PROMO_AD: PromoAd = {
  id: "unlock-premium",
  title: "Want to remove ads and unlock all games and more features?",
  tagline: "$5 unlocks all games, Google Calendar export, and an ad-free experience.",
  href: "#",
  cta: "Unlock for $5",
  accent: "green",
  action: "unlock",
};

/** Regular promos (×3, or ×4 with install), then unlock ad, repeating. */
export function getPromoAdAtRotationIndex(index: number, installEligible = false): PromoAd {
  const promos = installEligible ? [...PROMO_ADS, INSTALL_PROMO_AD] : PROMO_ADS;
  const cycleLen = promos.length + 1;
  const slot = ((index % cycleLen) + cycleLen) % cycleLen;
  if (slot === promos.length) return UNLOCK_PROMO_AD;
  return promos[slot];
}

export const LITPRINTZ_URL = "https://litprintz.com";
