import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { isUserDashboardRole } from "@/lib/role-home";
import type { LayoutAuthUser } from "@/server/require-role-layout";

/**
 * Marketing pages treat only Prisma `Role.USER` as a member for in-page actions.
 * Staff roles keep the public guest experience on marketing routes.
 */
export function resolveMarketingAudience(
  authUser: LayoutAuthUser | null,
): PublicPackageCategoryCardsAudience {
  if (authUser !== null && isUserDashboardRole(authUser.role)) {
    return "member";
  }
  return "guest";
}

export function isMarketingMemberUser(authUser: LayoutAuthUser | null): boolean {
  return resolveMarketingAudience(authUser) === "member";
}
