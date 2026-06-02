import type { AdminNavIconSlug } from "@/components/shell/admin-nav-icon-map";

/** Member sidebar routes mapped to the same Figma icon set as Admin where applicable. */
const MEMBER_NAV_ICON_BY_HREF: Readonly<Record<string, AdminNavIconSlug>> = {
  "/dashboard": "dashboard",
  "/user/home": "dashboard",
  "/user/bookings": "bookings",
  "/user/classes": "schedule",
  "/user/gift-cards": "giftCards",
  "/user/profile": "clients",
  "/user/settings": "settings",
};

export function memberNavIconSlugForHref(href: string): AdminNavIconSlug | null {
  return MEMBER_NAV_ICON_BY_HREF[href] ?? null;
}
