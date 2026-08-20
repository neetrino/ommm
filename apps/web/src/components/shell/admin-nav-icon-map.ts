/** Figma admin sidebar icon slugs — assets in `/public/icons/admin/`. */
export type AdminNavIconSlug =
  | "dashboard"
  | "bookings"
  | "waitlists"
  | "clients"
  | "coaches"
  | "schedule"
  | "packages"
  | "giftCards"
  | "finance"
  | "analytics"
  | "notifications"
  | "settings"
  | "feedback"
  | "guestUsers"
  | "calls"
  | "managers";

/** Maps admin sidebar routes to Figma-exported icon assets. */
export const ADMIN_NAV_ICON_BY_HREF: Readonly<Record<string, AdminNavIconSlug>> = {
  "/admin/dashboard": "dashboard",
  "/admin/bookings": "bookings",
  "/admin/waitlists": "waitlists",
  "/admin/clients": "clients",
  "/admin/calls": "calls",
  "/admin/coaches": "coaches",
  "/admin/managers": "managers",
  "/admin/schedule": "schedule",
  "/admin/packages": "packages",
  "/admin/gift-cards": "giftCards",
  "/admin/finance": "finance",
  "/admin/analytics": "analytics",
  "/admin/notifications": "notifications",
  "/admin/content": "feedback",
  "/admin/settings": "settings",
  "/admin/feedback": "feedback",
  "/admin/guest-users": "guestUsers",
  "/admin/profile": "clients",
};

/**
 * Manager operational routes use the same Figma olive icons as Admin.
 * Kept separate from Finance / Analytics / Guest users (not on Manager nav).
 */
export const MANAGER_NAV_ICON_BY_HREF: Readonly<Record<string, AdminNavIconSlug>> = {
  "/manager/dashboard": "dashboard",
  "/manager/bookings": "bookings",
  "/manager/waitlists": "waitlists",
  "/manager/clients": "clients",
  "/manager/calls": "calls",
  "/manager/coaches": "coaches",
  "/manager/schedule": "schedule",
  "/manager/packages": "packages",
  "/manager/gift-cards": "giftCards",
  "/manager/notifications": "notifications",
  "/manager/content": "feedback",
  "/manager/settings": "settings",
  "/manager/profile": "clients",
};

export function adminNavIconSlugForHref(href: string): AdminNavIconSlug | null {
  return ADMIN_NAV_ICON_BY_HREF[href] ?? MANAGER_NAV_ICON_BY_HREF[href] ?? null;
}
