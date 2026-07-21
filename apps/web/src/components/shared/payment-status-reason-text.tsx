"use client";

import { useTranslations } from "next-intl";
import {
  shouldShowPaymentStatusReason,
  type PaymentStatusReason,
} from "@/lib/payment-status-reason";

type PaymentStatusReasonTextProps = {
  status: string;
  reason: string | null | undefined;
  className?: string;
};

/** Compact secondary line under a PENDING/FAILED status badge. */
export function PaymentStatusReasonText({
  status,
  reason,
  className = "mt-1 max-w-[9rem] text-[10px] font-medium leading-snug normal-case tracking-normal text-sage-500",
}: PaymentStatusReasonTextProps) {
  const t = useTranslations("paymentStatusReasons");
  if (!shouldShowPaymentStatusReason(status, reason)) {
    return null;
  }
  return (
    <p className={className} title={t(reason as PaymentStatusReason)}>
      {t(reason as PaymentStatusReason)}
    </p>
  );
}
