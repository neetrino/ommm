/**
 * Post-auth landing path for a Prisma `Role`.
 * Web uses `/content-admin/*` for `CONTENT_ADMIN`; the mobile app only mounts the
 * `/admin/*` stack, so content editors land on `/admin/home` here.
 */
export function homeHrefForRole(role: string): string {
  if (role === "CONTENT_ADMIN" || role === "ADMIN") {
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
