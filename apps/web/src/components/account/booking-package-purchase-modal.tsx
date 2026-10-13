"use client";

import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import type { PackageSubscribePlanOption } from "@/lib/package-subscribe-plan-option";

type BookingPackagePurchaseModalProps = {
  isOpen: boolean;
  locale: string;
  plans: readonly PackageSubscribePlanOption[];
  initialPlanId?: string;
  /** Class the member is booking; stored on the package payment. */
  sessionId?: string;
  onClose: () => void;
};

/** Opens the standard package subscribe / payment sheet for booking flows. */
export function BookingPackagePurchaseModal({
  isOpen,
  locale,
  plans,
  initialPlanId,
  sessionId,
  onClose,
}: BookingPackagePurchaseModalProps) {
  return (
    <PackageSubscribePaymentModal
      isOpen={isOpen}
      locale={locale}
      plans={plans}
      initialPlanId={initialPlanId}
      sessionId={sessionId}
      onClose={onClose}
    />
  );
}
