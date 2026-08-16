/**
 * Central navigation for authenticated role dashboards.
 * Each role’s `href` values must stay under that role’s URL namespace.
 * Labels are resolved via next-intl under `dashboard.nav.{ROLE}.{labelKey}`.
 * Source: CRM - Ommm - code.md (member app tabs, coach/manager/admin matrices).
 */
import type { AdminNavIconSlug } from "@/components/shell/admin-nav-icon-map";
import { USER_ACCOUNT_PATH, USER_PROFILE_PATH } from "@/lib/role-home";
export type DashboardNavIcon =
  | "home"
  | "layoutDashboard"
  | "trendingUp"
  | "layoutGrid"
  | "calendar"
  | "ticket"
  | "tag"
  | "gift"
  | "user"
  | "bell"
  | "barChart"
  | "users"
  | "userCheck"
  | "listOrdered"
  | "wallet"
  | "fileText"
  | "send"
  | "pieChart"
  | "settings";

export type DashboardNavDefinition = {
  href: string;
  icon: DashboardNavIcon;
  /** Key under `dashboard.nav.{role}` */
  labelKey: string;
  /** Figma olive-sidebar glyph — serialized with nav props to avoid SSR/client slug drift. */
  oliveIconSlug?: AdminNavIconSlug;
};

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
  oliveIconSlug?: AdminNavIconSlug;
};

/** Member olive sidebar — fallback from {@link DashboardNavIcon} when slug prop is missing after HMR. */
const MEMBER_ICON_TO_OLIVE_SLUG: Partial<Record<DashboardNavIcon, AdminNavIconSlug>> = {
  layoutDashboard: "dashboard",
  calendar: "bookings",
  listOrdered: "waitlists",
  layoutGrid: "schedule",
  tag: "packages",
  wallet: "finance",
  gift: "giftCards",
  user: "clients",
};

/** Resolves Figma member sidebar glyph from serialized nav item fields (SSR-safe). */
export function memberOliveIconSlugForNavItem(
  item: Pick<DashboardNavItem, "oliveIconSlug" | "icon">,
): AdminNavIconSlug | null {
  if (item.oliveIconSlug) {
    return item.oliveIconSlug;
  }
  return MEMBER_ICON_TO_OLIVE_SLUG[item.icon] ?? null;
}

export type DashboardRoleNotificationRoute = {
  href: string;
  labelKey: string;
};

/** Member (USER): dashboard, bookings, packages — account hub on mobile `/user`. */
const USER_NAV: readonly DashboardNavDefinition[] = [
  { href: USER_ACCOUNT_PATH, icon: "layoutDashboard", labelKey: "dashboard", oliveIconSlug: "dashboard" },
  { href: "/user/bookings", icon: "calendar", labelKey: "bookings", oliveIconSlug: "bookings" },
  { href: "/user/waitlists", icon: "listOrdered", labelKey: "waitlists", oliveIconSlug: "waitlists" },
  { href: "/user/packages", icon: "tag", labelKey: "packages", oliveIconSlug: "packages" },
  { href: "/user/payments", icon: "wallet", labelKey: "payments", oliveIconSlug: "finance" },
  { href: "/user/gift-cards", icon: "gift", labelKey: "giftCards", oliveIconSlug: "giftCards" },
  { href: USER_PROFILE_PATH, icon: "user", labelKey: "profile", oliveIconSlug: "clients" },
];

/** Coach panel: Dashboard, My schedule, Bookings, Salary, Analytics, Profile settings. */
const COACH_NAV: readonly DashboardNavDefinition[] = [
  { href: "/coach/home", icon: "layoutDashboard", labelKey: "dashboard" },
  { href: "/coach/schedule", icon: "calendar", labelKey: "schedule" },
  { href: "/coach/groups", icon: "users", labelKey: "groups" },
  { href: "/coach/salary", icon: "wallet", labelKey: "salary" },
  { href: "/coach/analytics", icon: "barChart", labelKey: "analytics" },
  { href: "/coach/profile", icon: "user", labelKey: "profile" },
];

/** Manager: same olive icons/order as Admin ops sections; no Finance, Analytics, Guest users, or Profile. */
const MANAGER_NAV: readonly DashboardNavDefinition[] = [
  { href: "/manager/dashboard", icon: "layoutDashboard", labelKey: "dashboard", oliveIconSlug: "dashboard" },
  { href: "/manager/bookings", icon: "calendar", labelKey: "bookings", oliveIconSlug: "bookings" },
  { href: "/manager/waitlists", icon: "listOrdered", labelKey: "waitlists", oliveIconSlug: "waitlists" },
  { href: "/manager/clients", icon: "users", labelKey: "clients", oliveIconSlug: "clients" },
  { href: "/manager/calls", icon: "users", labelKey: "calls", oliveIconSlug: "calls" },
  { href: "/manager/coaches", icon: "userCheck", labelKey: "coaches", oliveIconSlug: "coaches" },
  { href: "/manager/schedule", icon: "calendar", labelKey: "schedule", oliveIconSlug: "schedule" },
  { href: "/manager/packages", icon: "tag", labelKey: "packages", oliveIconSlug: "packages" },
  { href: "/manager/gift-cards", icon: "gift", labelKey: "giftCards", oliveIconSlug: "giftCards" },
  { href: "/manager/notifications", icon: "bell", labelKey: "notificationManagement", oliveIconSlug: "notifications" },
  { href: "/manager/content", icon: "fileText", labelKey: "content", oliveIconSlug: "feedback" },
  { href: "/manager/settings", icon: "settings", labelKey: "settings", oliveIconSlug: "settings" },
];

const CONTENT_ADMIN_NAV: readonly DashboardNavDefinition[] = [
  { href: "/content-admin/home", icon: "home", labelKey: "home" },
  { href: "/content-admin/content", icon: "fileText", labelKey: "content" },
  { href: "/content-admin/profile", icon: "user", labelKey: "profile" },
];

/** Admin panel section order per CRM (Settings is studio-level; profile remains account). */
const ADMIN_NAV: readonly DashboardNavDefinition[] = [
  { href: "/admin/dashboard", icon: "layoutDashboard", labelKey: "dashboard", oliveIconSlug: "dashboard" },
  { href: "/admin/bookings", icon: "calendar", labelKey: "bookings", oliveIconSlug: "bookings" },
  { href: "/admin/waitlists", icon: "listOrdered", labelKey: "waitlists", oliveIconSlug: "waitlists" },
  { href: "/admin/clients", icon: "users", labelKey: "clients", oliveIconSlug: "clients" },
  { href: "/admin/calls", icon: "users", labelKey: "calls", oliveIconSlug: "calls" },
  { href: "/admin/coaches", icon: "userCheck", labelKey: "coaches", oliveIconSlug: "coaches" },
  { href: "/admin/schedule", icon: "calendar", labelKey: "schedule", oliveIconSlug: "schedule" },
  { href: "/admin/packages", icon: "tag", labelKey: "packages", oliveIconSlug: "packages" },
  { href: "/admin/gift-cards", icon: "gift", labelKey: "giftCards", oliveIconSlug: "giftCards" },
  { href: "/admin/finance", icon: "wallet", labelKey: "finance", oliveIconSlug: "finance" },
  { href: "/admin/analytics", icon: "pieChart", labelKey: "analytics", oliveIconSlug: "analytics" },
  { href: "/admin/notifications", icon: "bell", labelKey: "notificationManagement", oliveIconSlug: "notifications" },
  { href: "/admin/content", icon: "fileText", labelKey: "content", oliveIconSlug: "feedback" },
  { href: "/admin/settings", icon: "settings", labelKey: "settings", oliveIconSlug: "settings" },
  { href: "/admin/guest-users", icon: "users", labelKey: "guestUsers", oliveIconSlug: "guestUsers" },
];

/** Sidebar item definitions for the authenticated dashboard role (Prisma `Role`). */
export function dashboardNavDefinitionsForRole(
  role: string,
): DashboardNavDefinition[] {
  switch (role) {
    case "USER":
      return [...USER_NAV];
    case "COACH":
      return [...COACH_NAV];
    case "MANAGER":
      return [...MANAGER_NAV];
    case "CONTENT_ADMIN":
      return [...CONTENT_ADMIN_NAV];
    case "ADMIN":
      return [...ADMIN_NAV];
    default:
      return [];
  }
}

/** Notifications entrypoint route in header for the authenticated dashboard role. */
export function dashboardNotificationRouteForRole(
  role: string,
): DashboardRoleNotificationRoute | null {
  switch (role) {
    case "USER":
      return null;
    case "COACH":
      return { href: "/coach/notifications", labelKey: "notifications" };
    case "CONTENT_ADMIN":
      return { href: "/content-admin/notifications", labelKey: "notifications" };
    case "MANAGER":
      return { href: "/manager/notifications", labelKey: "notifications" };
    case "ADMIN":
      return { href: "/admin/notifications", labelKey: "notifications" };
    default:
      return null;
  }
}

/** Whether `pathname` matches a sidebar nav item (exact or nested), except account root. */
export function dashboardNavPathActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  if (href === USER_ACCOUNT_PATH) return false;
  return pathname.startsWith(`${href}/`);
}
