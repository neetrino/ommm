import type { DashboardNavDefinition } from "@/lib/dashboard-nav";
import { USER_DASHBOARD_PATH } from "@/lib/role-home";

/** Member account hub rows — workspace shortcuts (sheet backdrop / account menu). */
export const MEMBER_ACCOUNT_HUB_NAV: readonly DashboardNavDefinition[] = [
  { href: USER_DASHBOARD_PATH, icon: "layoutDashboard", labelKey: "dashboard", oliveIconSlug: "dashboard" },
  { href: "/user/bookings", icon: "calendar", labelKey: "bookings", oliveIconSlug: "bookings" },
  { href: "/user/waitlists", icon: "listOrdered", labelKey: "waitlists", oliveIconSlug: "waitlists" },
  { href: "/user/packages", icon: "tag", labelKey: "packages", oliveIconSlug: "packages" },
  { href: "/user/payments", icon: "wallet", labelKey: "payments", oliveIconSlug: "finance" },
  { href: "/user/gift-cards", icon: "gift", labelKey: "giftCards", oliveIconSlug: "giftCards" },
  { href: "/user/profile", icon: "user", labelKey: "profile", oliveIconSlug: "clients" },
] as const;
