/** Public marketing home — default landing after member login/register. */
export const PUBLIC_HOME_PATH = "/";

/** Member account root — avatar link and `/user` namespace entry. */
export const USER_ACCOUNT_PATH = "/user";

/** Member dashboard (Prisma `Role.USER`). */
export const USER_DASHBOARD_PATH = "/user/dashboard";

/** Member profile and account settings (Prisma `Role.USER`). */
export const USER_PROFILE_PATH = "/user/profile";

/** @deprecated Use {@link USER_ACCOUNT_PATH} or {@link USER_DASHBOARD_PATH}. */
export const USER_HOME_PATH = USER_ACCOUNT_PATH;

/** Backoffice home for studio administrators (`Role.ADMIN`). */
export const ADMIN_HOME_PATH = "/admin/dashboard";

/** Content editor workspace (Prisma `Role.CONTENT_ADMIN`). */
export const CONTENT_ADMIN_HOME_PATH = "/content-admin/home";

/** Operations / studio manager workspace. */
export const MANAGER_HOME_PATH = "/manager/dashboard";

/** Coach schedule and roster home. */
export const COACH_HOME_PATH = "/coach/home";

/**
 * Primary post-auth landing path for the given API user role (Prisma `Role`).
 */
export function homePathForRole(role: string): string {
  if (role === "CONTENT_ADMIN") {
    return CONTENT_ADMIN_HOME_PATH;
  }
  if (role === "ADMIN") {
    return ADMIN_HOME_PATH;
  }
  if (role === "MANAGER") {
    return MANAGER_HOME_PATH;
  }
  if (role === "COACH") {
    return COACH_HOME_PATH;
  }
  return USER_ACCOUNT_PATH;
}

/**
 * Path after successful login/register (email or OAuth entry via `/account`).
 * Regular members land on My account; staff roles go to their workspace.
 */
export function postAuthPathForRole(role: string): string {
  if (role === "USER") {
    return USER_ACCOUNT_PATH;
  }
  return homePathForRole(role);
}

export function isUserDashboardRole(role: string): boolean {
  return role === "USER";
}

export function isAdminDashboardRole(role: string): boolean {
  return role === "ADMIN";
}

export function isManagerDashboardRole(role: string): boolean {
  return role === "MANAGER";
}
