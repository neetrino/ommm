import type { DashboardNavItem } from "@/lib/dashboard-nav";

function pathMatchesNav(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/** Short helper line under the page title (Ilona-style header). */
const SUBTITLE_BY_HREF: Partial<Record<string, string>> = {
  "/admin/home": "Overview of studio activity and key metrics.",
  "/admin/clients": "Members, roles, and account access.",
  "/admin/bookings": "Sessions, attendance, and reservations.",
  "/admin/classes": "Class types, capacity, and schedules.",
  "/admin/waitlists": "Queue positions and recent waitlist activity.",
  "/admin/coaches": "Coach roster and profile records.",
  "/admin/memberships": "Plans, pricing, and member subscriptions.",
  "/admin/gift-cards": "Issued cards and redemption status.",
  "/admin/notifications": "Broadcast messages to members and staff.",
  "/admin/reports": "Operational summaries and exports.",
  "/admin/content": "Posts, publishing status, and slugs.",
  "/admin/profile": "Your backoffice identity and sign-in email.",
  "/admin/settings": "Workspace preferences and integrations.",
  "/user/home": "Your upcoming classes, bookings, and member tools.",
  "/user/progress": "Achievements and milestones.",
  "/user/classes": "Browse and book sessions.",
  "/user/bookings": "Upcoming and past reservations.",
  "/user/memberships": "Active plans and renewals.",
  "/user/gift-cards": "Balances and redemption.",
  "/user/profile": "Your member profile and contact details.",
  "/user/notifications": "Alerts and studio messages.",
  "/user/settings": "Preferences for your member account.",
  "/coach/home": "Today’s sessions and roster at a glance.",
  "/coach/analytics": "Teaching load and session trends.",
  "/coach/salary": "Payouts and compensation summaries.",
  "/coach/profile": "Public coach profile and bio.",
  "/coach/settings": "Workspace preferences.",
  "/manager/home": "Operations snapshot for your studio.",
  "/manager/classes": "Schedule and capacity across rooms.",
  "/manager/bookings": "Bookings that need attention.",
  "/manager/waitlists": "Waitlist queues by session.",
  "/manager/coaches": "Coach assignments and availability.",
  "/manager/clients": "Member roster for the studio.",
  "/manager/profile": "Your manager account summary.",
  "/manager/settings": "Operational preferences.",
  "/content-admin/home": "Editorial tools and content overview.",
  "/content-admin/content": "Posts, status, and last updates.",
  "/content-admin/profile": "Your content editor account.",
};

/**
 * Picks the most specific matching nav item, then a human title + subtitle.
 */
export function dashboardHeadingFromPath(
  pathname: string,
  navItems: DashboardNavItem[],
): { title: string; subtitle: string } {
  const matches = navItems.filter((item) => pathMatchesNav(pathname, item.href));
  if (matches.length === 0) {
    return { title: "Home", subtitle: "" };
  }
  const best = matches.reduce((a, b) =>
    a.href.length >= b.href.length ? a : b,
  );
  const subtitle = SUBTITLE_BY_HREF[best.href] ?? "";
  return { title: best.label, subtitle };
}
