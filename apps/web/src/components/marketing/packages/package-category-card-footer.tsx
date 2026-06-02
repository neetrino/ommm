"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";

type PackageCategoryCardFooterProps = {
  audience: PublicPackageCategoryCardsAudience;
  subscribeLabel: string;
  accountLabel: string;
  hint: string;
  locale: string;
  plans: readonly PackageSubscribePlanOption[];
};

export function PackageCategoryCardFooter({
  audience,
  subscribeLabel,
  accountLabel,
  hint,
  locale,
  plans,
}: PackageCategoryCardFooterProps) {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const accountHref = audience === "member" ? "#your-packages" : "/user/packages";

  return (
    <>
      <div className="mt-8 border-t border-white/50 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          {audience === "member" ? (
            <button
              type="button"
              className="ommm-cta-primary flex-1 text-center"
              onClick={() => setPaymentModalOpen(true)}
            >
              {subscribeLabel}
            </button>
          ) : (
            <Link href="/login" className="ommm-cta-primary flex-1 text-center">
              {subscribeLabel}
            </Link>
          )}
          <Link href={accountHref} className="ommm-cta-ghost flex-1 text-center">
            {accountLabel}
          </Link>
        </div>
        <p className="mt-4 text-center text-xs text-sage-500">{hint}</p>
      </div>
      {audience === "member" ? (
        <PackageSubscribePaymentModal
          isOpen={paymentModalOpen}
          locale={locale}
          plans={plans}
          onClose={() => setPaymentModalOpen(false)}
        />
      ) : null}
    </>
  );
}
