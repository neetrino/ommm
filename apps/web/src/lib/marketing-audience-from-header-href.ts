import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";

/** Member marketing actions only for Prisma `Role.USER` — inferred from member home href. */
export function marketingAudienceFromHeaderHref(
  href: string,
): PublicPackageCategoryCardsAudience {
  if (href === USER_ACCOUNT_PATH || href.startsWith(`${USER_ACCOUNT_PATH}/`)) {
    return "member";
  }
  return "guest";
}
