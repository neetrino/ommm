/** Member dashboard (Prisma `Role.USER`). */
export const USER_HOME_PATH = "/user/home";

/** Backoffice home for studio administrators (`Role.ADMIN`). */
export const ADMIN_HOME_PATH = "/admin/home";

/** Content editor workspace (Prisma `Role.CONTENT_ADMIN`). */
export const CONTENT_ADMIN_HOME_PATH = "/content-admin/home";

/** Operations / studio manager workspace. */
export const MANAGER_HOME_PATH = "/manager/home";

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
  return USER_HOME_PATH;
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
