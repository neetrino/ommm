const ADMIN_DASHBOARD_ROLES = new Set<string>(["ADMIN", "CONTENT_ADMIN"]);

/**
 * Post-auth landing path for a Prisma `Role` (aligned with web `homePathForRole`).
 */
export function homeHrefForRole(role: string): string {
  if (ADMIN_DASHBOARD_ROLES.has(role)) {
    return "/admin/home";
  }
  if (role === "MANAGER") {
    return "/manager/home";
  }
  if (role === "COACH") {
    return "/coach/home";
  }
  return "/user/home";
}
