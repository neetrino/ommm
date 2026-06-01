/**
 * Public marketing header links — single source passed from Server Components
 * so nav order matches between RSC HTML and client hydration.
 */
export const MARKETING_NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/story", key: "story" },
  { href: "/coaches", key: "coaches" },
  { href: "/packages", key: "memberships" },
  { href: "/explore", key: "explore" },
  { href: "/schedule", key: "schedule" },
  { href: "/contact", key: "contact" },
] as const;

export type MarketingNavKey = (typeof MARKETING_NAV_LINKS)[number]["key"];
