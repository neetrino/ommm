export type AdminNavItem = { href: string; label: string };

/**
 * Backoffice navigation: full studio admin vs content-only editor (`CONTENT_ADMIN`).
 */
export function adminNavItemsForRole(role: string): AdminNavItem[] {
  if (role === "CONTENT_ADMIN") {
    return [
      { href: "/admin/content", label: "Content" },
      { href: "/admin/profile", label: "Profile" },
    ];
  }
  return [
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
}
