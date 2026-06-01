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
  | "guestUsers";

/** Maps admin sidebar routes to Figma-exported icon assets. */
export const ADMIN_NAV_ICON_BY_HREF: Readonly<Record<string, AdminNavIconSlug>> = {
  "/admin/home": "dashboard",
  "/admin/bookings": "bookings",
  "/admin/waitlists": "waitlists",
  "/admin/waitlist": "waitlists",
  "/admin/clients": "clients",
  "/admin/coaches": "coaches",
  "/admin/schedule": "schedule",
  "/admin/packages": "packages",
  "/admin/gift-cards": "giftCards",
  "/admin/finance": "finance",
  "/admin/analytics": "analytics",
  "/admin/notifications": "notifications",
  "/admin/settings": "settings",
  "/admin/feedback": "feedback",
  "/admin/guest-users": "guestUsers",
};

export function adminNavIconSlugForHref(href: string): AdminNavIconSlug | null {
  return ADMIN_NAV_ICON_BY_HREF[href] ?? null;
}
