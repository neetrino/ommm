"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";

type PackageCategoryCardFooterProps = {
  audience: PublicPackageCategoryCardsAudience;
  subscribeLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  hint: ReactNode;
  onSubscribe?: () => void;
  rootClassName?: string;
  actionsClassName?: string;
  hintClassName?: string;
};

export function PackageCategoryCardFooter({
  audience,
  subscribeLabel,
  secondaryLabel,
  secondaryHref,
  hint,
  onSubscribe,
  rootClassName,
  actionsClassName,
  hintClassName,
}: PackageCategoryCardFooterProps) {
  const footerCtaClass = "ommm-package-card-footer-cta flex-1 text-center";

  return (
    <div className={rootClassName ?? "mt-8 border-t border-white/50 pt-6"}>
      <div className={actionsClassName ?? "flex flex-col gap-3 sm:flex-row"}>
        {audience === "member" ? (
          <button
            type="button"
            className={`ommm-cta-primary ${footerCtaClass}`}
            onClick={(event) => {
              event.stopPropagation();
              onSubscribe?.();
            }}
          >
            {subscribeLabel}
          </button>
        ) : (
          <Link href="/login" className={`ommm-cta-primary ${footerCtaClass}`}>
            {subscribeLabel}
          </Link>
        )}
        <Link
          href={secondaryHref}
          className={`ommm-cta-ghost ${footerCtaClass}`}
          onClick={(event) => event.stopPropagation()}
        >
          {secondaryLabel}
        </Link>
      </div>
      <div className={hintClassName ?? "mt-4"}>{hint}</div>
    </div>
  );
}
