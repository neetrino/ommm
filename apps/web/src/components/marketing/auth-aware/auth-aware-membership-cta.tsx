import type { ReactNode } from "react";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { Link } from "@/i18n/navigation";
import { buildLoginHrefWithReturnUrl, buildPackagesSubscribeLoginHref } from "@/lib/auth-redirect";

type AuthAwareMembershipCtaProps = {
  audience: PublicPackageCategoryCardsAudience;
  planId?: string;
  returnPath?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps membership CTAs on marketing pages — guests go to login; members use caller actions.
 */
export function AuthAwareMembershipCta({
  audience,
  planId,
  returnPath = "/package",
  className,
  children,
}: AuthAwareMembershipCtaProps) {
  if (audience === "member") {
    return <>{children}</>;
  }

  const href =
    planId !== undefined
      ? buildPackagesSubscribeLoginHref(planId)
      : buildLoginHrefWithReturnUrl(returnPath);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
