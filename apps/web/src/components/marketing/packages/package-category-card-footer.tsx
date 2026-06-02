"use client";

import { Link } from "@/i18n/navigation";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";

type PackageCategoryCardFooterProps = {
  audience: PublicPackageCategoryCardsAudience;
  subscribeLabel: string;
  accountLabel: string;
  hint: string;
  onSubscribe?: () => void;
};

export function PackageCategoryCardFooter({
  audience,
  subscribeLabel,
  accountLabel,
  hint,
  onSubscribe,
}: PackageCategoryCardFooterProps) {
  const accountHref = audience === "member" ? "#your-packages" : "/user/packages";

  return (
    <div className="mt-8 border-t border-white/50 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        {audience === "member" ? (
          <button
            type="button"
            className="ommm-cta-primary flex-1 text-center"
            onClick={(event) => {
              event.stopPropagation();
              onSubscribe?.();
            }}
          >
            {subscribeLabel}
          </button>
        ) : (
          <Link href="/login" className="ommm-cta-primary flex-1 text-center">
            {subscribeLabel}
          </Link>
        )}
        <Link
          href={accountHref}
          className="ommm-cta-ghost flex-1 text-center"
          onClick={(event) => event.stopPropagation()}
        >
          {accountLabel}
        </Link>
      </div>
      <p className="mt-4 text-center text-xs text-sage-500">{hint}</p>
    </div>
  );
}
