/**
 * Central navigation for authenticated role dashboards.
 * Each role’s `href` values must stay under that role’s URL namespace.
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
  | "settings"
  | "barChart"
  | "users"
  | "userCheck"
  | "listOrdered"
  | "wallet"
  | "fileText"
  | "send"
  | "pieChart";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardNavIcon;
};

const USER_NAV: readonly DashboardNavItem[] = [
  { href: "/user/home", label: "Home", icon: "home" },
  { href: "/user/progress", label: "Progress", icon: "trendingUp" },
  { href: "/user/classes", label: "Classes", icon: "layoutGrid" },
  { href: "/user/bookings", label: "Bookings", icon: "calendar" },
  { href: "/user/memberships", label: "Memberships", icon: "tag" },
  { href: "/user/gift-cards", label: "Gift cards", icon: "gift" },
  { href: "/user/profile", label: "Profile", icon: "user" },
  { href: "/user/notifications", label: "Notifications", icon: "bell" },
  { href: "/user/settings", label: "Settings", icon: "settings" },
];

const COACH_NAV: readonly DashboardNavItem[] = [
  { href: "/coach/home", label: "Schedule", icon: "calendar" },
  { href: "/coach/analytics", label: "Analytics", icon: "barChart" },
  { href: "/coach/salary", label: "Salary", icon: "wallet" },
  { href: "/coach/profile", label: "Profile", icon: "user" },
  { href: "/coach/settings", label: "Settings", icon: "settings" },
];

const MANAGER_NAV: readonly DashboardNavItem[] = [
  { href: "/manager/home", label: "Home", icon: "home" },
  { href: "/manager/classes", label: "Classes", icon: "layoutGrid" },
  { href: "/manager/bookings", label: "Bookings", icon: "calendar" },
  { href: "/manager/waitlists", label: "Waitlists", icon: "listOrdered" },
  { href: "/manager/coaches", label: "Coaches", icon: "userCheck" },
  { href: "/manager/clients", label: "Clients", icon: "users" },
  { href: "/manager/profile", label: "Profile", icon: "user" },
  { href: "/manager/settings", label: "Settings", icon: "settings" },
];

const CONTENT_ADMIN_NAV: readonly DashboardNavItem[] = [
  { href: "/content-admin/home", label: "Home", icon: "home" },
  { href: "/content-admin/content", label: "Content", icon: "fileText" },
  { href: "/content-admin/profile", label: "Profile", icon: "user" },
];

const ADMIN_NAV: readonly DashboardNavItem[] = [
  { href: "/admin/home", label: "Dashboard", icon: "layoutDashboard" },
  { href: "/admin/clients", label: "Users", icon: "users" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/classes", label: "Classes", icon: "layoutGrid" },
  { href: "/admin/waitlists", label: "Waitlists", icon: "listOrdered" },
  { href: "/admin/coaches", label: "Coaches", icon: "userCheck" },
  { href: "/admin/memberships", label: "Memberships", icon: "tag" },
  { href: "/admin/gift-cards", label: "Gift cards", icon: "gift" },
  { href: "/admin/notifications", label: "Notifications", icon: "send" },
  { href: "/admin/reports", label: "Reports", icon: "pieChart" },
  { href: "/admin/content", label: "Content", icon: "fileText" },
  { href: "/admin/profile", label: "Profile", icon: "user" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

/** Sidebar items for the authenticated dashboard role (Prisma `Role`). */
export function dashboardNavForRole(role: string): DashboardNavItem[] {
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
