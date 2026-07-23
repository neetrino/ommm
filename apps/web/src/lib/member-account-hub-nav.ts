import type { DashboardNavDefinition } from "@/lib/dashboard-nav";
import { PUBLIC_HOME_PATH } from "@/lib/role-home";

/** Member account hub rows — workspace shortcuts (excludes `/user` itself). */
export const MEMBER_ACCOUNT_HUB_NAV: readonly DashboardNavDefinition[] = [
  { href: PUBLIC_HOME_PATH, icon: "home", labelKey: "home" },
  { href: "/user/bookings", icon: "calendar", labelKey: "bookings", oliveIconSlug: "bookings" },
  { href: "/user/waitlists", icon: "listOrdered", labelKey: "waitlists", oliveIconSlug: "waitlists" },
  { href: "/user/packages", icon: "tag", labelKey: "packages", oliveIconSlug: "packages" },
  { href: "/user/payments", icon: "wallet", labelKey: "payments", oliveIconSlug: "finance" },
  { href: "/user/gift-cards", icon: "gift", labelKey: "giftCards", oliveIconSlug: "giftCards" },
  { href: "/user/profile", icon: "user", labelKey: "profile", oliveIconSlug: "clients" },
] as const;

export const MEMBER_ACCOUNT_HUB_CHANGE_PASSWORD_HREF = "/user/profile";
