import type { Href } from "expo-router";

/** MaterialCommunityIcons glyph names used by the floating tab bar. */
export type TabIconName =
  | "home"
  | "view-dashboard"
  | "calendar-month"
  | "tag"
  | "meditation"
  | "account-multiple"
  | "clipboard-check-outline"
  | "layers-outline"
  | "account-circle-outline";

export type RoleTabItem = {
  key: string;
  label: string;
  href: Href;
  iconName: TabIconName;
  iconSize: number;
};

const ICON = {
  home: { iconName: "home" as const, iconSize: 22 },
  classes: { iconName: "view-dashboard" as const, iconSize: 22 },
  bookings: { iconName: "clipboard-check-outline" as const, iconSize: 22 },
  schedule: { iconName: "calendar-month" as const, iconSize: 24 },
  plans: { iconName: "tag" as const, iconSize: 22 },
  userPlans: { iconName: "layers-outline" as const, iconSize: 22 },
  profile: { iconName: "meditation" as const, iconSize: 26 },
  account: { iconName: "account-circle-outline" as const, iconSize: 24 },
  users: { iconName: "account-multiple" as const, iconSize: 22 },
} as const;

const USER_TABS: RoleTabItem[] = [
  { key: "home", label: "Home", href: "/user/home", ...ICON.home },
  {
    key: "schedule",
    label: "Schedule",
    href: "/user/schedule",
    ...ICON.schedule,
  },
  {
    key: "classes",
    label: "My Bookings",
    href: "/user/classes",
    ...ICON.bookings,
  },
  {
    key: "progress",
    label: "Plans",
    href: "/user/progress",
    ...ICON.userPlans,
  },
  {
    key: "profile",
    label: "My Account",
    href: "/user/profile",
    ...ICON.account,
  },
];

const ADMIN_TABS: RoleTabItem[] = [
  { key: "admin-home", label: "Home", href: "/admin/home", ...ICON.home },
  {
    key: "admin-users",
    label: "Users",
    href: "/admin/clients",
    ...ICON.users,
  },
  {
    key: "admin-profile",
    label: "Profile",
    href: "/admin/profile",
    ...ICON.profile,
  },
];

/** Mobile stack has no `/content-admin/*`; keep tabs to safe admin routes. */
const CONTENT_ADMIN_TABS: RoleTabItem[] = [
  { key: "content-admin-home", label: "Home", href: "/admin/home", ...ICON.home },
  {
    key: "content-admin-profile",
    label: "Profile",
    href: "/admin/profile",
    ...ICON.profile,
  },
];

const COACH_TABS: RoleTabItem[] = [
  { key: "coach-home", label: "Home", href: "/coach/home", ...ICON.home },
  {
    key: "coach-profile",
    label: "Profile",
    href: "/coach/profile",
    ...ICON.profile,
  },
];

const MANAGER_TABS: RoleTabItem[] = [
  { key: "manager-home", label: "Home", href: "/manager/home", ...ICON.home },
  {
    key: "manager-bookings",
    label: "Bookings",
    href: "/manager/bookings",
    ...ICON.schedule,
  },
  {
    key: "manager-clients",
    label: "Clients",
    href: "/manager/clients",
    ...ICON.users,
  },
  {
    key: "manager-profile",
    label: "Profile",
    href: "/manager/profile",
    ...ICON.profile,
  },
];

/**
 * Bottom tabs for the signed-in shell. Defaults to member (`USER`) paths under `/user/*`.
 */
export function tabItemsForRole(role: string | null): RoleTabItem[] {
  if (role === null) {
    return USER_TABS;
  }
  if (role === "CONTENT_ADMIN") {
    return CONTENT_ADMIN_TABS;
  }
  if (role === "ADMIN") {
    return ADMIN_TABS;
  }
  if (role === "COACH") {
    return COACH_TABS;
  }
  if (role === "MANAGER") {
    return MANAGER_TABS;
  }
  return USER_TABS;
}
