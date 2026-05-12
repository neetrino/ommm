import type { ShellNavItem } from "@/components/shell/shell-header";

/** Authenticated member (`Role.USER`) navigation — all routes live under `/user/*`. */
export const USER_MEMBER_NAV: ShellNavItem[] = [
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
