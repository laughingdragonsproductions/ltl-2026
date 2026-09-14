export type PromoAd = {
  id: string;
  title: string;
  tagline: string;
  href: string;
  cta: string;
  accent: "green" | "purple" | "orange";
};

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
    href: "https://brandonsparks.com",
    cta: "Explore LDP",
    accent: "green",
  },
  {
    id: "ltl26",
    title: "Unlock ad-free LTL26",
    tagline: "$5 support removes promo banners through festival weekend",
    href: "/map",
    cta: "Back to map",
    accent: "orange",
  },
];

export const LITPRINTZ_URL = "https://litprintz.com";
