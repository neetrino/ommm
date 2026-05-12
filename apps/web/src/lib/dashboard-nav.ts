/**
 * Central navigation for authenticated role dashboards.
 * Each role’s `href` values must stay under that role’s URL namespace.
 */
export type DashboardNavItem = {
  href: string;
  label: string;
};

const USER_NAV: readonly DashboardNavItem[] = [
  { href: "/user/home", label: "Home" },
  { href: "/user/progress", label: "Progress" },
  { href: "/user/classes", label: "Classes" },
  { href: "/user/bookings", label: "Bookings" },
  { href: "/user/memberships", label: "Memberships" },
  { href: "/user/gift-cards", label: "Gift cards" },
  { href: "/user/profile", label: "Profile" },
  { href: "/user/notifications", label: "Notifications" },
  { href: "/user/settings", label: "Settings" },
];

const COACH_NAV: readonly DashboardNavItem[] = [
  { href: "/coach/home", label: "Schedule" },
  { href: "/coach/analytics", label: "Analytics" },
  { href: "/coach/salary", label: "Salary" },
  { href: "/coach/profile", label: "Profile" },
  { href: "/coach/settings", label: "Settings" },
];

const MANAGER_NAV: readonly DashboardNavItem[] = [
  { href: "/manager/home", label: "Home" },
  { href: "/manager/classes", label: "Classes" },
  { href: "/manager/bookings", label: "Bookings" },
  { href: "/manager/waitlists", label: "Waitlists" },
  { href: "/manager/coaches", label: "Coaches" },
  { href: "/manager/clients", label: "Clients" },
  { href: "/manager/profile", label: "Profile" },
  { href: "/manager/settings", label: "Settings" },
];

const CONTENT_ADMIN_NAV: readonly DashboardNavItem[] = [
  { href: "/content-admin/home", label: "Home" },
  { href: "/content-admin/content", label: "Content" },
  { href: "/content-admin/profile", label: "Profile" },
];

const ADMIN_NAV: readonly DashboardNavItem[] = [
  { href: "/admin/home", label: "Dashboard" },
  { href: "/admin/clients", label: "Users" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/waitlists", label: "Waitlists" },
  { href: "/admin/coaches", label: "Coaches" },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/gift-cards", label: "Gift cards" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/settings", label: "Settings" },
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
