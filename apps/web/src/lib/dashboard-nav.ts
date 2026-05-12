/**
 * Central navigation for authenticated role dashboards.
 * Each role’s `href` values must stay under that role’s URL namespace.
 * Labels are resolved via next-intl under `dashboard.nav.{ROLE}.{labelKey}`.
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

const USER_NAV: readonly DashboardNavDefinition[] = [
  { href: "/user/home", icon: "home", labelKey: "home" },
  { href: "/user/progress", icon: "trendingUp", labelKey: "progress" },
  { href: "/user/classes", icon: "layoutGrid", labelKey: "classes" },
  { href: "/user/bookings", icon: "calendar", labelKey: "bookings" },
  { href: "/user/memberships", icon: "tag", labelKey: "memberships" },
  { href: "/user/gift-cards", icon: "gift", labelKey: "giftCards" },
  { href: "/user/notifications", icon: "bell", labelKey: "notifications" },
  { href: "/user/profile", icon: "user", labelKey: "profile" },
];

const COACH_NAV: readonly DashboardNavDefinition[] = [
  { href: "/coach/home", icon: "calendar", labelKey: "schedule" },
  { href: "/coach/analytics", icon: "barChart", labelKey: "analytics" },
  { href: "/coach/salary", icon: "wallet", labelKey: "salary" },
  { href: "/coach/profile", icon: "user", labelKey: "profile" },
];

const MANAGER_NAV: readonly DashboardNavDefinition[] = [
  { href: "/manager/home", icon: "home", labelKey: "home" },
  { href: "/manager/classes", icon: "layoutGrid", labelKey: "classes" },
  { href: "/manager/bookings", icon: "calendar", labelKey: "bookings" },
  { href: "/manager/waitlists", icon: "listOrdered", labelKey: "waitlists" },
  { href: "/manager/coaches", icon: "userCheck", labelKey: "coaches" },
  { href: "/manager/clients", icon: "users", labelKey: "clients" },
  { href: "/manager/profile", icon: "user", labelKey: "profile" },
];

const CONTENT_ADMIN_NAV: readonly DashboardNavDefinition[] = [
  { href: "/content-admin/home", icon: "home", labelKey: "home" },
  { href: "/content-admin/content", icon: "fileText", labelKey: "content" },
  { href: "/content-admin/profile", icon: "user", labelKey: "profile" },
];

const ADMIN_NAV: readonly DashboardNavDefinition[] = [
  { href: "/admin/home", icon: "layoutDashboard", labelKey: "dashboard" },
  { href: "/admin/clients", icon: "users", labelKey: "users" },
  { href: "/admin/bookings", icon: "calendar", labelKey: "bookings" },
  { href: "/admin/classes", icon: "layoutGrid", labelKey: "classes" },
  { href: "/admin/waitlists", icon: "listOrdered", labelKey: "waitlists" },
  { href: "/admin/coaches", icon: "userCheck", labelKey: "coaches" },
  { href: "/admin/memberships", icon: "tag", labelKey: "memberships" },
  { href: "/admin/gift-cards", icon: "gift", labelKey: "giftCards" },
  { href: "/admin/notifications", icon: "send", labelKey: "notifications" },
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
