"use client";

import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { formatAmdFromCents } from "@/lib/price-amd";

/** Positive whole-AMD gift-card credit applied to this payment. */
export function readGiftDiscountCents(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.floor(value);
}

export function AdminFinanceListAmount({
  amountCents,
  giftCreditsAppliedCents,
  isGiftCreditSpend,
  locale,
  className,
  giftLabel,
  giftSpendLabel,
}: {
  amountCents: number;
  giftCreditsAppliedCents?: number;
  isGiftCreditSpend?: boolean;
  locale: string;
  className: string;
  giftLabel: string;
  giftSpendLabel: string;
}) {
  const discount = readGiftDiscountCents(giftCreditsAppliedCents);

  return (
    <div>
      <AmdMoneyText cents={amountCents} locale={locale} className={className} />
      {discount > 0 ? (
        <p className="mt-1 text-xs leading-snug text-sage-800">
          {giftLabel} −<AmdMoneyText cents={discount} locale={locale} />
        </p>
      ) : null}
      {isGiftCreditSpend ? (
        <p className="mt-1 text-xs leading-snug text-sage-600">{giftSpendLabel}</p>
      ) : null}
    </div>
  );
}

export function formatClientPaymentGiftNote(
  payment: {
    giftCreditsAppliedCents?: number;
    isGiftCreditSpend?: boolean;
  },
  locale: string,
  labels: { gift: string; giftSpend: string },
): string | null {
  const discount = readGiftDiscountCents(payment.giftCreditsAppliedCents);
  if (discount > 0) {
    return `${labels.gift} −${formatAmdFromCents(discount, locale)}`;
  }
  if (payment.isGiftCreditSpend) {
    return labels.giftSpend;
  }
  return null;
}
