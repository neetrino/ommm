/** Member dashboard (Prisma `Role.USER`). */
export const USER_HOME_PATH = "/user/home";

/** Backoffice home for studio administrators and content editors. */
export const ADMIN_HOME_PATH = "/admin/home";

/** Operations / studio manager workspace. */
export const MANAGER_HOME_PATH = "/manager/home";

/** Coach schedule and roster home. */
export const COACH_HOME_PATH = "/coach/home";

const ADMIN_DASHBOARD_ROLES = new Set<string>(["ADMIN", "CONTENT_ADMIN"]);

/**
 * Primary post-auth landing path for the given API user role (Prisma `Role`).
 */
export function homePathForRole(role: string): string {
  if (ADMIN_DASHBOARD_ROLES.has(role)) {
    return ADMIN_HOME_PATH;
  }
  if (role === "MANAGER") {
    return MANAGER_HOME_PATH;
  }
  if (role === "COACH") {
    return COACH_HOME_PATH;
  }
  return USER_HOME_PATH;
}

export function isUserDashboardRole(role: string): boolean {
  return role === "USER";
}

export function isAdminDashboardRole(role: string): boolean {
  return ADMIN_DASHBOARD_ROLES.has(role);
}

export function isManagerDashboardRole(role: string): boolean {
  return role === "MANAGER";
}
