import type { MarketingHeaderAccount } from "@/components/marketing/marketing-site-header";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { homePathForRole } from "@/lib/role-home";
import { userDisplayInitials } from "@/lib/user-display-initials";
import { userDisplayName } from "@/lib/user-display-name";
import type { LayoutAuthUser } from "@/lib/layout-auth-user";

/** Maps layout auth user to marketing header account menu props. */
export function resolveMarketingHeaderAccount(
  authUser: LayoutAuthUser | null | undefined,
): MarketingHeaderAccount | null {
  if (!authUser) {
    return null;
  }

  const href = homePathForRole(authUser.role);

  return {
    href,
    initials: userDisplayInitials(
      authUser.name,
      authUser.lastName,
      authUser.email,
    ),
    // Match mobile + member hub — navbar uses the custom home photo only, not OAuth avatarUrl.
    imageSrc: resolveApiAssetUrl(authUser.homeImageUrl) ?? null,
    displayName: userDisplayName(
      authUser.name,
      authUser.lastName,
      authUser.email,
    ),
  };
}
