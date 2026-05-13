/**
 * Central navigation for authenticated role dashboards.
 * Each role’s `href` values must stay under that role’s URL namespace.
 * Labels are resolved via next-intl under `dashboard.nav.{ROLE}.{labelKey}`.
 * Source: CRM - Ommm - code.md (member app tabs, coach/manager/admin matrices).
 */
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
  | "pieChart";

export type DashboardNavDefinition = {
  href: string;
  icon: DashboardNavIcon;
  /** Key under `dashboard.nav.{role}` */
  labelKey: string;
};

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
};

export type DashboardRoleNotificationRoute = {
  href: string;
  labelKey: string;
};

/** Member (USER): Home, Classes, My Bookings, My Account areas — no top-level Notifications tab per CRM. */
const USER_NAV: readonly DashboardNavDefinition[] = [
  { href: "/user/home", icon: "home", labelKey: "home" },
  { href: "/user/classes", icon: "layoutGrid", labelKey: "classes" },
  { href: "/user/bookings", icon: "calendar", labelKey: "bookings" },
  { href: "/user/progress", icon: "trendingUp", labelKey: "progress" },
  { href: "/user/memberships", icon: "tag", labelKey: "memberships" },
  { href: "/user/gift-cards", icon: "gift", labelKey: "giftCards" },
  { href: "/user/profile", icon: "user", labelKey: "profile" },
];

/** Coach panel: Dashboard, My schedule, My groups, Salary, Analytics, Profile settings. */
const COACH_NAV: readonly DashboardNavDefinition[] = [
  { href: "/coach/home", icon: "layoutDashboard", labelKey: "dashboard" },
  { href: "/coach/schedule", icon: "calendar", labelKey: "schedule" },
  { href: "/coach/groups", icon: "users", labelKey: "groups" },
  { href: "/coach/salary", icon: "wallet", labelKey: "salary" },
  { href: "/coach/analytics", icon: "barChart", labelKey: "analytics" },
  { href: "/coach/profile", icon: "user", labelKey: "profile" },
];

/** Manager matrix: no Memberships, Notifications, Reports, or studio Settings. */
const MANAGER_NAV: readonly DashboardNavDefinition[] = [
  { href: "/manager/home", icon: "home", labelKey: "home" },
  { href: "/manager/classes", icon: "layoutGrid", labelKey: "classes" },
  { href: "/manager/bookings", icon: "calendar", labelKey: "bookings" },
  { href: "/manager/waitlists", icon: "listOrdered", labelKey: "waitlists" },
  { href: "/manager/clients", icon: "users", labelKey: "clients" },
  { href: "/manager/coaches", icon: "userCheck", labelKey: "coaches" },
  { href: "/manager/gift-cards", icon: "gift", labelKey: "giftCards" },
  { href: "/manager/profile", icon: "user", labelKey: "profile" },
];

const CONTENT_ADMIN_NAV: readonly DashboardNavDefinition[] = [
  { href: "/content-admin/home", icon: "home", labelKey: "home" },
  { href: "/content-admin/content", icon: "fileText", labelKey: "content" },
  { href: "/content-admin/profile", icon: "user", labelKey: "profile" },
];

/** Admin panel section order per CRM (Settings is studio-level; profile remains account). */
const ADMIN_NAV: readonly DashboardNavDefinition[] = [
  { href: "/admin/home", icon: "layoutDashboard", labelKey: "dashboard" },
  { href: "/admin/classes", icon: "layoutGrid", labelKey: "classes" },
  { href: "/admin/bookings", icon: "calendar", labelKey: "bookings" },
  { href: "/admin/waitlists", icon: "listOrdered", labelKey: "waitlists" },
  { href: "/admin/clients", icon: "users", labelKey: "clients" },
  { href: "/admin/coaches", icon: "userCheck", labelKey: "coaches" },
  { href: "/admin/schedule", icon: "calendar", labelKey: "schedule" },
  { href: "/admin/memberships", icon: "tag", labelKey: "memberships" },
  { href: "/admin/gift-cards", icon: "gift", labelKey: "giftCards" },
  { href: "/admin/reports", icon: "pieChart", labelKey: "reports" },
  { href: "/admin/content", icon: "fileText", labelKey: "content" },
  { href: "/admin/profile", icon: "user", labelKey: "profile" },
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
      return { href: "/user/notifications", labelKey: "notifications" };
    case "COACH":
      return { href: "/coach/notifications", labelKey: "notifications" };
    case "CONTENT_ADMIN":
      return { href: "/content-admin/notifications", labelKey: "notifications" };
    case "ADMIN":
      return { href: "/admin/notifications", labelKey: "notifications" };
    default:
      return null;
  }
}
