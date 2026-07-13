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
  | "account-circle-outline"
  | "chart-box-outline";

export type RoleTabLabelNamespace = "dashboard.nav" | "common";

export type RoleTabItem = {
  key: string;
  labelKey: string;
  labelNamespace: RoleTabLabelNamespace;
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
  analytics: { iconName: "chart-box-outline" as const, iconSize: 22 },
} as const;

const USER_TABS: RoleTabItem[] = [
  {
    key: "home",
    labelKey: "USER.home",
    labelNamespace: "dashboard.nav",
    href: "/user/home",
    ...ICON.home,
  },
  {
    key: "schedule",
    labelKey: "USER.schedule",
    labelNamespace: "dashboard.nav",
    href: "/user/schedule",
    ...ICON.schedule,
  },
  {
    key: "classes",
    labelKey: "USER.bookings",
    labelNamespace: "dashboard.nav",
    href: "/user/classes",
    ...ICON.bookings,
  },
  {
    key: "packages",
    labelKey: "USER.packages",
    labelNamespace: "dashboard.nav",
    href: "/user/packages",
    ...ICON.userPlans,
  },
  {
    key: "profile",
    labelKey: "account",
    labelNamespace: "common",
    href: "/user/profile",
    ...ICON.account,
  },
];

const ADMIN_TABS: RoleTabItem[] = [
  {
    key: "admin-home",
    labelKey: "ADMIN.dashboard",
    labelNamespace: "dashboard.nav",
    href: "/admin/home",
    ...ICON.home,
  },
  {
    key: "admin-users",
    labelKey: "ADMIN.clients",
    labelNamespace: "dashboard.nav",
    href: "/admin/clients",
    ...ICON.users,
  },
  {
    key: "admin-profile",
    labelKey: "ADMIN.profile",
    labelNamespace: "dashboard.nav",
    href: "/admin/profile",
    ...ICON.profile,
  },
];

const CONTENT_ADMIN_TABS: RoleTabItem[] = [
  {
    key: "content-admin-home",
    labelKey: "CONTENT_ADMIN.home",
    labelNamespace: "dashboard.nav",
    href: "/admin/home",
    ...ICON.home,
  },
  {
    key: "content-admin-profile",
    labelKey: "CONTENT_ADMIN.profile",
    labelNamespace: "dashboard.nav",
    href: "/admin/profile",
    ...ICON.profile,
  },
];

const COACH_TABS: RoleTabItem[] = [
  {
    key: "coach-home",
    labelKey: "COACH.dashboard",
    labelNamespace: "dashboard.nav",
    href: "/coach/home",
    ...ICON.home,
  },
  {
    key: "coach-schedule",
    labelKey: "COACH.schedule",
    labelNamespace: "dashboard.nav",
    href: "/coach/schedule",
    ...ICON.schedule,
  },
  {
    key: "coach-groups",
    labelKey: "COACH.groups",
    labelNamespace: "dashboard.nav",
    href: "/coach/groups",
    ...ICON.users,
  },
  {
    key: "coach-analytics",
    labelKey: "COACH.analytics",
    labelNamespace: "dashboard.nav",
    href: "/coach/analytics",
    ...ICON.analytics,
  },
  {
    key: "coach-profile",
    labelKey: "account",
    labelNamespace: "common",
    href: "/coach/profile",
    ...ICON.account,
  },
];

const MANAGER_TABS: RoleTabItem[] = [
  {
    key: "manager-home",
    labelKey: "MANAGER.home",
    labelNamespace: "dashboard.nav",
    href: "/manager/home",
    ...ICON.home,
  },
  {
    key: "manager-bookings",
    labelKey: "MANAGER.bookings",
    labelNamespace: "dashboard.nav",
    href: "/manager/bookings",
    ...ICON.schedule,
  },
  {
    key: "manager-clients",
    labelKey: "MANAGER.clients",
    labelNamespace: "dashboard.nav",
    href: "/manager/clients",
    ...ICON.users,
  },
  {
    key: "manager-profile",
    labelKey: "MANAGER.profile",
    labelNamespace: "dashboard.nav",
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
