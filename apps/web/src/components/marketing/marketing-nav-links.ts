/**
 * Public marketing header links — single source passed from Server Components
 * so nav order matches between RSC HTML and client hydration.
 */
/** Order matches Figma `TopNavBar` `196:1410`. */
export const MARKETING_NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/story", key: "story" },
  { href: "/schedule", key: "schedule" },
  { href: "/packages", key: "memberships" },
  { href: "/coaches", key: "coaches" },
  { href: "/explore", key: "explore" },
  { href: "/contact", key: "contact" },
] as const;

export type MarketingNavKey = (typeof MARKETING_NAV_LINKS)[number]["key"];
