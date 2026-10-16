"use client";

import { AdminFinancePaymentDetailRow } from "@/components/admin/admin-finance-payment-details-rows";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftDiscountLabels = {
  amount: string;
  listPrice: string;
  gift: string;
  paid: string;
};

type GiftDiscountAmountProps = {
  amountCents: number;
  giftCreditsAppliedCents?: number;
  couponCode?: string;
  couponDiscountCents?: number;
  locale: string;
  labels: GiftDiscountLabels & { coupon?: string };
};

/** Positive whole-AMD gift-card credit applied to this payment. */
export function readGiftDiscountCents(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.floor(value);
}

export function AdminFinanceSheetAmountRows({
  amountCents,
  giftCreditsAppliedCents,
  couponCode,
  couponDiscountCents,
  locale,
  labels,
}: GiftDiscountAmountProps) {
  const discount = readGiftDiscountCents(giftCreditsAppliedCents);
  const coupon = readGiftDiscountCents(couponDiscountCents);
  if (discount <= 0 && coupon <= 0) {
    return (
      <AdminFinancePaymentDetailRow
        label={labels.amount}
        value={
          <AmdMoneyText cents={amountCents} locale={locale} className="font-serif text-lg" />
        }
      />
    );
  }

  return (
    <>
      <AdminFinancePaymentDetailRow
        label={labels.listPrice}
        value={
          <AmdMoneyText
            cents={amountCents + discount + coupon}
            locale={locale}
            className="text-sage-500 line-through"
          />
        }
      />
      {coupon > 0 ? (
        <AdminFinancePaymentDetailRow
          label={couponCode ? `${labels.coupon ?? "Promo"} ${couponCode}` : (labels.coupon ?? "Promo")}
          value={
            <span className="font-medium text-sage-800">
              −<AmdMoneyText cents={coupon} locale={locale} />
            </span>
          }
        />
      ) : null}
      {discount > 0 ? (
        <AdminFinancePaymentDetailRow
          label={labels.gift}
          value={
            <span className="font-medium text-sage-800">
              −<AmdMoneyText cents={discount} locale={locale} />
            </span>
          }
        />
      ) : null}
      <AdminFinancePaymentDetailRow
        label={labels.paid}
        value={
          <AmdMoneyText cents={amountCents} locale={locale} className="font-serif text-lg" />
        }
      />
    </>
  );
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
