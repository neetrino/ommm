"use client";

import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";

type BookingPackagePurchaseModalProps = {
  isOpen: boolean;
  locale: string;
  plans: readonly PackageSubscribePlanOption[];
  initialPlanId?: string;
  notice?: string;
  onClose: () => void;
};

/** Opens the standard package subscribe / payment sheet for booking flows. */
export function BookingPackagePurchaseModal({
  isOpen,
  locale,
  plans,
  initialPlanId,
  notice,
  onClose,
}: BookingPackagePurchaseModalProps) {
  return (
    <PackageSubscribePaymentModal
      isOpen={isOpen}
      locale={locale}
      plans={plans}
      initialPlanId={initialPlanId}
      notice={notice}
      onClose={onClose}
    />
  );
}
