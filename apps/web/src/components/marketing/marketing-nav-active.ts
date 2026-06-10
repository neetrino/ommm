import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { isMarketingMembershipPath } from "@/components/marketing/marketing-route-utils";

/** Whether a marketing header nav item matches the current pathname. */
export function isMarketingNavLinkActive(
  pathname: string,
  href: string,
  key: MarketingNavKey,
): boolean {
  if (key === "memberships") {
    return isMarketingMembershipPath(pathname);
  }

  if (href === "/") {
    return pathname === "/" || pathname === "";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
